#!/usr/bin/env python3
"""
Ready Server Static Site Generator

Builds HTML pages from Jinja2 templates and Markdown blog posts.
Output is suitable for static hosting on Cloudflare Pages.

Usage:
    python build.py           # Build once
    python build.py --watch   # Watch for changes and rebuild
    python build.py --serve   # Build and start dev server
"""

import os
import sys
import json
import shutil
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional

# Template engine
from jinja2 import Environment, FileSystemLoader, select_autoescape

# Markdown processing
import markdown
import frontmatter

# YAML for data files
import yaml

# File watching (optional)
try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    WATCHDOG_AVAILABLE = True
except ImportError:
    WATCHDOG_AVAILABLE = False

# ============================================================================
# CONFIGURATION
# ============================================================================

# Directory paths (relative to this script)
BASE_DIR = Path(__file__).parent
PARENT_DIR = BASE_DIR.parent  # Next.js project root
SRC_DIR = BASE_DIR / "src"
TEMPLATES_DIR = SRC_DIR / "templates"
STATIC_DIR = SRC_DIR / "static"
DATA_DIR = SRC_DIR / "data"
CONTENT_DIR = SRC_DIR / "content"
PARENT_CONTENT_DIR = PARENT_DIR / "content"  # Next.js content directory
DIST_DIR = BASE_DIR / "dist"

# Site metadata
SITE_CONFIG = {
    "title": "Ready Server",
    "tagline": "Singapore's #1 VPS & Dedicated Hosting",
    "description": "Enterprise-grade VPS and dedicated server hosting in Singapore. 99.99% uptime, NVMe SSD, 24/7 support, and ISO 27001 certified data centers.",
    "url": "https://readyserver.sg",
    "locale": "en-SG",
    "twitter": "@readyserversg",
    "og_image": "/og/home.svg",
    "gtm_id": "GTM-P5CRWLDZ",
}

# Markdown extensions
MD_EXTENSIONS = [
    'fenced_code',
    'tables',
    'codehilite',
    'toc',
    'attr_list',
    'md_in_html',
]

# ============================================================================
# JINJA2 SETUP
# ============================================================================

def create_jinja_env() -> Environment:
    """Create Jinja2 environment with custom filters"""
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(['html', 'xml']),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    
    # Custom filters
    env.filters['date'] = lambda d, fmt='%B %d, %Y': d.strftime(fmt) if d else ''
    env.filters['truncate_words'] = lambda s, n=30: ' '.join(s.split()[:n]) + ('...' if len(s.split()) > n else '')
    env.filters['slugify'] = lambda s: s.lower().replace(' ', '-').replace("'", '')
    
    # Global variables
    env.globals['site'] = SITE_CONFIG
    env.globals['now'] = datetime.now()
    env.globals['year'] = datetime.now().year
    
    return env

# ============================================================================
# DATA LOADING
# ============================================================================

def load_yaml_data(filename: str) -> Dict[str, Any]:
    """Load YAML data file from data directory"""
    path = DATA_DIR / f"{filename}.yaml"
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return yaml.safe_load(f) or {}
    return {}

def load_json_data(filename: str) -> Dict[str, Any]:
    """Load JSON data file from data directory"""
    path = DATA_DIR / f"{filename}.json"
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def load_all_data() -> Dict[str, Any]:
    """Load all data files from data directory"""
    data = {}
    
    # Load YAML files
    for yaml_file in DATA_DIR.glob('*.yaml'):
        name = yaml_file.stem
        data[name] = load_yaml_data(name)
    
    # Load JSON files
    for json_file in DATA_DIR.glob('*.json'):
        name = json_file.stem
        data[name] = load_json_data(name)
    
    return data

# ============================================================================
# BLOG POST PROCESSING
# ============================================================================

def strip_markdown_links(text: str) -> str:
    """Strip markdown links from text, converting [Text](/url) to just Text"""
    import re
    return re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)


def process_blog_posts() -> List[Dict[str, Any]]:
    """Process all Markdown blog posts from local content directory"""
    posts = []
    
    # Use local content directory (migrated blog posts)
    blog_content_dir = CONTENT_DIR / "blog"
    
    # Fall back to parent content directory if local doesn't exist
    if not blog_content_dir.exists():
        blog_content_dir = PARENT_CONTENT_DIR / "blog"
    
    if not blog_content_dir.exists():
        print(f"  [Warning] No blog content directory found")
        return posts
    
    md = markdown.Markdown(extensions=MD_EXTENSIONS)
    
    for md_file in blog_content_dir.glob('*.md'):
        try:
            post = frontmatter.load(md_file)
            
            # Get metadata
            metadata = post.metadata
            slug = metadata.get('slug', md_file.stem)
            
            # Get title and strip markdown links
            raw_title = metadata.get('title', 'Untitled')
            title = strip_markdown_links(raw_title)
            
            # Process content - also strip markdown links for clean rendering
            md.reset()
            content_html = md.convert(post.content)
            
            # Calculate reading time
            word_count = len(post.content.split())
            reading_time = metadata.get('read_time', max(1, round(word_count / 200)))
            
            # Get description - check multiple possible fields
            description = metadata.get('seo_description', 
                         metadata.get('description', 
                         metadata.get('excerpt', '')))
            
            # Get image - check multiple possible fields
            image = metadata.get('featured_image',
                    metadata.get('og_image',
                    metadata.get('image', '/og/blog.svg')))
            
            # Fix relative WordPress URLs to full URLs
            if image and image.startswith('/wp-content/'):
                image = f"https://www.readyserver.sg{image}"
            
            # Keep original categories from Next.js (Engineering, Product, Design, Company)
            category = metadata.get('category', 'Product')
            
            # Parse date
            date_val = metadata.get('date', datetime.now())
            if isinstance(date_val, str):
                try:
                    date_val = datetime.strptime(date_val, '%Y-%m-%d')
                except:
                    date_val = datetime.now()
            
            posts.append({
                'slug': slug,
                'title': title,
                'description': description,
                'date': date_val,
                'author': metadata.get('author', 'Ready Server Team'),
                'category': category,
                'tags': metadata.get('tags', []),
                'image': image,
                'content': content_html,
                'reading_time': reading_time,
                'word_count': word_count,
                'published': metadata.get('published', True),
            })
            
        except Exception as e:
            print(f"  [Error] Failed to process {md_file}: {e}")
    
    # Sort by date (newest first)
    posts.sort(key=lambda p: p['date'], reverse=True)
    
    # Filter unpublished posts
    posts = [p for p in posts if p.get('published', True)]
    
    return posts

# ============================================================================
# PAGE RENDERING
# ============================================================================

def render_page(env: Environment, template_name: str, output_path: Path, context: Dict[str, Any] = None) -> None:
    """Render a single page to HTML"""
    context = context or {}
    
    try:
        template = env.get_template(template_name)
        html = template.render(**context)
        
        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Write HTML file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
        
        print(f"  [OK] {output_path.relative_to(DIST_DIR)}")
        
    except Exception as e:
        print(f"  [ERR] {template_name}: {e}")

# ============================================================================
# BUILD FUNCTIONS
# ============================================================================

def clean_dist():
    """Remove and recreate dist directory"""
    if DIST_DIR.exists():
        try:
            shutil.rmtree(DIST_DIR)
        except PermissionError:
            # On Windows, try to remove files individually
            import time
            time.sleep(0.5)  # Wait a moment
            try:
                shutil.rmtree(DIST_DIR)
            except PermissionError:
                print("  [Warning] Could not fully clean dist directory (files in use)")
                # Continue anyway - files will be overwritten
    DIST_DIR.mkdir(parents=True, exist_ok=True)

def copy_static_files():
    """Copy static files to dist with organized structure"""
    print("\n[STATIC] Copying static files...")
    
    # Copy all static files from src/static
    for item in STATIC_DIR.iterdir():
        dest = DIST_DIR / item.name
        if item.is_dir():
            shutil.copytree(item, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dest)
    
    # Create legacy image paths for backwards compatibility
    # This maps new organized paths to old paths used in templates
    legacy_mappings = [
        # Map social-proof images to old /images/home/ path
        (DIST_DIR / "images" / "social-proof", DIST_DIR / "images" / "home"),
        # Map app images to old /images/download-app/ path
        (DIST_DIR / "images" / "app", DIST_DIR / "images" / "download-app"),
    ]
    
    for src, dest in legacy_mappings:
        if src.exists() and not dest.exists():
            shutil.copytree(src, dest, dirs_exist_ok=True)
    
    # Copy OG images to root /og/ for meta tags
    og_src = DIST_DIR / "images" / "og"
    og_dest = DIST_DIR / "og"
    if og_src.exists():
        shutil.copytree(og_src, og_dest, dirs_exist_ok=True)
    
    # Copy favicon from static/images/logo to root for backwards compatibility
    favicon_src = STATIC_DIR / "images" / "logo" / "favicon.ico"
    if favicon_src.exists():
        shutil.copy2(favicon_src, DIST_DIR / "favicon.ico")
        print("  [OK] favicon.ico (from static/images/logo)")
    
    # Also try parent public folder as fallback
    parent_public = BASE_DIR.parent / "public"
    if parent_public.exists():
        favicon = parent_public / "favicon.ico"
        if favicon.exists() and not (DIST_DIR / "favicon.ico").exists():
            shutil.copy2(favicon, DIST_DIR / "favicon.ico")
            print("  [OK] favicon.ico (from parent/public)")
    
    # Copy Cloudflare Pages configuration files
    cloudflare_files = ['_headers', '_redirects']
    for cf_file in cloudflare_files:
        src = BASE_DIR / cf_file
        if src.exists():
            shutil.copy2(src, DIST_DIR / cf_file)
            print(f"  [OK] {cf_file}")
    
    print("  [OK] Static files copied")

def build_pages(env: Environment, data: Dict[str, Any], posts: List[Dict[str, Any]] = None):
    """Build all static pages"""
    print("\n[PAGES] Building pages...")
    
    # Posts context for pages that need blog highlights
    posts_context = {'posts': posts or []}
    
    # Page definitions: (template, output, extra_context)
    pages = [
        # Marketing pages - home page needs posts for blog highlights
        ("pages/home.html", "index.html", posts_context),
        ("pages/vps-hosting.html", "vps-hosting/index.html", {}),
        ("pages/windows-vps.html", "windows-vps/index.html", {}),
        ("pages/dedicated-servers.html", "dedicated-servers/index.html", {}),
        ("pages/products.html", "products/index.html", {}),
        ("pages/download-mobile-app.html", "download-mobile-app/index.html", {}),
        ("pages/coming-soon.html", "coming-soon/index.html", {}),
        
        # Support pages
        ("pages/contact.html", "contact/index.html", {}),
        
        # Company pages
        ("pages/brand-guidelines.html", "brand-guidelines/index.html", {}),
        
        # Legal pages
        ("pages/legal/privacy-policy.html", "privacy-policy/index.html", {}),
        ("pages/legal/terms-of-service.html", "terms-of-service/index.html", {}),
        ("pages/legal/sla.html", "sla/index.html", {}),
    ]
    
    for template, output, extra_context in pages:
        context = {**data, **extra_context}
        render_page(env, template, DIST_DIR / output, context)

def build_blog(env: Environment, data: Dict[str, Any], posts: List[Dict[str, Any]]):
    """Build blog listing and individual posts"""
    print("\n[BLOG] Building blog...")
    
    # Add posts to context
    blog_context = {**data, 'posts': posts}
    
    # Blog listing page
    render_page(env, "pages/blog/index.html", DIST_DIR / "blog/index.html", blog_context)
    
    # Individual blog posts
    # CRITICAL: Output to /blog/<slug>/index.html to match existing URLs
    for post in posts:
        post_context = {**data, 'post': post}
        output_path = DIST_DIR / "blog" / post['slug'] / "index.html"
        render_page(env, "pages/blog/post.html", output_path, post_context)

def build_sitemap(posts: List[Dict[str, Any]]):
    """Generate sitemap.xml"""
    print("\n[SITEMAP] Building sitemap...")
    
    base_url = SITE_CONFIG['url']
    now = datetime.now().strftime('%Y-%m-%d')
    
    # Static pages with priorities
    static_pages = [
        ('/', 1.0, 'daily'),
        ('/vps-hosting', 0.9, 'weekly'),
        ('/windows-vps', 0.9, 'weekly'),
        ('/dedicated-servers', 0.9, 'weekly'),
        ('/products', 0.8, 'weekly'),
        ('/download-mobile-app', 0.8, 'monthly'),
        ('/blog', 0.7, 'daily'),
        ('/contact', 0.6, 'monthly'),
        ('/brand-guidelines', 0.4, 'monthly'),
        ('/privacy-policy', 0.3, 'yearly'),
        ('/terms-of-service', 0.3, 'yearly'),
        ('/sla', 0.3, 'yearly'),
    ]
    
    urls = []
    
    # Add static pages
    for path, priority, freq in static_pages:
        urls.append(f'''  <url>
    <loc>{base_url}{path}</loc>
    <lastmod>{now}</lastmod>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>''')
    
    # Add blog posts
    for post in posts:
        post_date = post['date'].strftime('%Y-%m-%d') if isinstance(post['date'], datetime) else now
        urls.append(f'''  <url>
    <loc>{base_url}/blog/{post['slug']}</loc>
    <lastmod>{post_date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>''')
    
    sitemap = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>'''
    
    with open(DIST_DIR / 'sitemap.xml', 'w', encoding='utf-8') as f:
        f.write(sitemap)
    
    print(f"  [OK] sitemap.xml ({len(urls)} URLs)")

def build_robots():
    """Generate robots.txt"""
    robots = f"""# Ready Server - robots.txt
User-agent: *
Allow: /

Sitemap: {SITE_CONFIG['url']}/sitemap.xml

# Disallow admin/private areas (if any)
Disallow: /api/
Disallow: /_next/
"""
    
    with open(DIST_DIR / 'robots.txt', 'w', encoding='utf-8') as f:
        f.write(robots)
    
    print("  [OK] robots.txt")

def build():
    """Main build function"""
    import sys
    import io
    
    # Fix encoding for Windows terminals
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    start_time = datetime.now()
    
    print("=" * 60)
    print("[BUILD] Ready Server Static Site Builder")
    print("=" * 60)
    
    # Clean
    print("\n[CLEAN] Cleaning dist directory...")
    clean_dist()
    print("  [OK] Cleaned")
    
    # Copy static files
    copy_static_files()
    
    # Create Jinja environment
    env = create_jinja_env()
    
    # Load data
    print("\n[DATA] Loading data...")
    data = load_all_data()
    print(f"  [OK] Loaded {len(data)} data files")
    
    # Process blog posts
    print("\n[BLOG] Processing blog posts...")
    posts = process_blog_posts()
    print(f"  [OK] Processed {len(posts)} blog posts")
    
    # Build pages (pass posts for home page blog highlights)
    build_pages(env, data, posts)
    
    # Build blog
    build_blog(env, data, posts)
    
    # Build sitemap
    build_sitemap(posts)
    
    # Build robots.txt
    build_robots()
    
    # Summary
    elapsed = (datetime.now() - start_time).total_seconds()
    print("\n" + "=" * 60)
    print(f"[SUCCESS] Build complete in {elapsed:.2f}s")
    print(f"   Output: {DIST_DIR}")
    print("=" * 60 + "\n")

# ============================================================================
# WATCH MODE
# ============================================================================

class RebuildHandler(FileSystemEventHandler):
    """File system event handler that triggers rebuild"""
    
    def __init__(self, callback):
        self.callback = callback
        self._last_rebuild = None
    
    def on_any_event(self, event):
        if event.is_directory:
            return
        
        # Debounce: ignore events within 1 second of last rebuild
        now = datetime.now()
        if self._last_rebuild and (now - self._last_rebuild).total_seconds() < 1:
            return
        
        print(f"\n[CHANGE] Change detected: {event.src_path}")
        self._last_rebuild = now
        self.callback()

def watch():
    """Watch for changes and rebuild"""
    if not WATCHDOG_AVAILABLE:
        print("❌ watchdog not installed. Run: pip install watchdog")
        sys.exit(1)
    
    print("[WATCH] Watching for changes...")
    print("   Press Ctrl+C to stop\n")
    
    # Initial build
    build()
    
    # Set up file watcher
    event_handler = RebuildHandler(build)
    observer = Observer()
    
    # Watch templates and data
    observer.schedule(event_handler, str(TEMPLATES_DIR), recursive=True)
    observer.schedule(event_handler, str(DATA_DIR), recursive=True)
    observer.schedule(event_handler, str(CONTENT_DIR), recursive=True)
    
    observer.start()
    
    try:
        while True:
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        print("\n\n[STOP] Stopped watching")
    
    observer.join()

# ============================================================================
# MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description='Build Ready Server static site')
    parser.add_argument('--watch', action='store_true', help='Watch for changes and rebuild')
    parser.add_argument('--serve', action='store_true', help='Start development server')
    
    args = parser.parse_args()
    
    if args.watch:
        watch()
    elif args.serve:
        # Build first, then serve
        build()
        print("\n[SERVER] Starting development server...")
        print(f"   http://localhost:8000\n")
        os.chdir(DIST_DIR)
        import http.server
        import socketserver
        with socketserver.TCPServer(("", 8000), http.server.SimpleHTTPRequestHandler) as httpd:
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n[STOP] Server stopped")
    else:
        build()

if __name__ == '__main__':
    main()

