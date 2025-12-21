#!/usr/bin/env python3
"""
HTML Formatter for Blog Content

This script post-processes markdown-generated HTML to add Tailwind CSS classes
matching the victorium.xyz/Ready Server production site styling.

Usage:
    from scripts.html_formatter import format_blog_html
    styled_html = format_blog_html(raw_html)

Reference: https://www.readyserver.sg/blog/ and victorium.xyz blog posts
"""

import re
from typing import Optional
from bs4 import BeautifulSoup, NavigableString


# ============================================================================
# TAILWIND CLASS DEFINITIONS
# Extracted from victorium.xyz sample_post.html
# ============================================================================

TAILWIND_CLASSES = {
    # Headings
    'h2': 'text-2xl font-bold mt-10 mb-4',
    'h3': 'text-xl font-bold mt-8 mb-4',
    'h4': 'text-lg font-semibold mt-6 mb-3',
    'h5': 'text-base font-semibold mt-4 mb-2',
    'h6': 'text-sm font-semibold mt-4 mb-2',
    
    # Paragraphs
    'p': 'mb-4 leading-relaxed',
    
    # Lists
    'ul': 'list-disc list-outside ml-6 my-4',
    'ol': 'list-decimal list-outside ml-6 my-4',
    'li': 'ml-4 mb-2',
    
    # Horizontal rules
    'hr': 'my-8 border-border',
    
    # Links
    'a': 'text-primary hover:underline',
    
    # Tables
    'table': 'w-full my-6 border-collapse',
    'thead': 'bg-muted/50',
    'th': 'px-4 py-3 text-left font-semibold border border-border',
    'td': 'px-4 py-3 border border-border',
    'tr': 'hover:bg-muted/30 transition-colors',
    
    # Code blocks
    'pre': 'my-6 p-4 bg-muted rounded-lg overflow-x-auto',
    'code': 'text-sm font-mono',
    
    # Inline code (inside paragraphs)
    'code_inline': 'px-1.5 py-0.5 bg-muted rounded text-sm font-mono',
    
    # Blockquotes
    'blockquote': 'my-6 pl-4 border-l-4 border-primary italic text-muted-foreground',
    
    # Strong/emphasis
    'strong': 'font-semibold text-foreground',
    'em': 'italic',
    
    # Images
    'img': 'rounded-xl my-6 max-w-full h-auto',
}


def format_blog_html(html_content: str) -> str:
    """
    Post-process markdown-generated HTML to add Tailwind CSS classes.
    
    Args:
        html_content: Raw HTML string from markdown conversion
        
    Returns:
        Styled HTML string with Tailwind classes
    """
    if not html_content or not html_content.strip():
        return html_content
    
    # Parse HTML
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Process each element type
    _process_headings(soup)
    _process_paragraphs(soup)
    _process_lists(soup)
    _process_links(soup)
    _process_tables(soup)
    _process_code_blocks(soup)
    _process_blockquotes(soup)
    _process_horizontal_rules(soup)
    _process_images(soup)
    _process_inline_elements(soup)
    
    # Return formatted HTML
    return str(soup)


def _add_classes(element, classes: str) -> None:
    """Add Tailwind classes to an element, preserving existing classes."""
    if element is None:
        return
    
    existing = element.get('class', [])
    if isinstance(existing, str):
        existing = existing.split()
    
    new_classes = classes.split()
    combined = existing + [c for c in new_classes if c not in existing]
    element['class'] = combined


def _process_headings(soup: BeautifulSoup) -> None:
    """Add classes to heading elements."""
    for level in ['h2', 'h3', 'h4', 'h5', 'h6']:
        for heading in soup.find_all(level):
            _add_classes(heading, TAILWIND_CLASSES[level])


def _process_paragraphs(soup: BeautifulSoup) -> None:
    """Add classes to paragraph elements."""
    for p in soup.find_all('p'):
        # Skip paragraphs inside special containers
        if p.parent and p.parent.name in ['blockquote', 'li', 'td', 'th']:
            continue
        _add_classes(p, TAILWIND_CLASSES['p'])


def _process_lists(soup: BeautifulSoup) -> None:
    """Add classes to list elements."""
    # Unordered lists
    for ul in soup.find_all('ul'):
        _add_classes(ul, TAILWIND_CLASSES['ul'])
        for li in ul.find_all('li', recursive=False):
            _add_classes(li, TAILWIND_CLASSES['li'])
    
    # Ordered lists
    for ol in soup.find_all('ol'):
        _add_classes(ol, TAILWIND_CLASSES['ol'])
        for li in ol.find_all('li', recursive=False):
            _add_classes(li, TAILWIND_CLASSES['li'])


def _process_links(soup: BeautifulSoup) -> None:
    """Add classes to anchor elements and ensure proper attributes."""
    for a in soup.find_all('a'):
        _add_classes(a, TAILWIND_CLASSES['a'])
        
        # Add external link attributes for external URLs
        href = a.get('href', '')
        if href.startswith('http') and 'readyserver' not in href.lower():
            a['target'] = '_blank'
            a['rel'] = 'noopener noreferrer'


def _process_tables(soup: BeautifulSoup) -> None:
    """Add classes to table elements."""
    for table in soup.find_all('table'):
        _add_classes(table, TAILWIND_CLASSES['table'])
        
        # Process thead
        thead = table.find('thead')
        if thead:
            _add_classes(thead, TAILWIND_CLASSES['thead'])
        
        # Process th elements
        for th in table.find_all('th'):
            _add_classes(th, TAILWIND_CLASSES['th'])
        
        # Process td elements
        for td in table.find_all('td'):
            _add_classes(td, TAILWIND_CLASSES['td'])
        
        # Process tr elements
        for tr in table.find_all('tr'):
            _add_classes(tr, TAILWIND_CLASSES['tr'])


def _process_code_blocks(soup: BeautifulSoup) -> None:
    """Add classes to code blocks and inline code."""
    # Pre blocks (code blocks)
    for pre in soup.find_all('pre'):
        _add_classes(pre, TAILWIND_CLASSES['pre'])
        
        # Code inside pre
        code = pre.find('code')
        if code:
            _add_classes(code, TAILWIND_CLASSES['code'])
    
    # Inline code (code not inside pre)
    for code in soup.find_all('code'):
        if code.parent and code.parent.name != 'pre':
            _add_classes(code, TAILWIND_CLASSES['code_inline'])


def _process_blockquotes(soup: BeautifulSoup) -> None:
    """Add classes to blockquote elements."""
    for blockquote in soup.find_all('blockquote'):
        _add_classes(blockquote, TAILWIND_CLASSES['blockquote'])


def _process_horizontal_rules(soup: BeautifulSoup) -> None:
    """Add classes to horizontal rule elements."""
    for hr in soup.find_all('hr'):
        _add_classes(hr, TAILWIND_CLASSES['hr'])


def _process_images(soup: BeautifulSoup) -> None:
    """Add classes to image elements."""
    for img in soup.find_all('img'):
        _add_classes(img, TAILWIND_CLASSES['img'])
        
        # Add lazy loading
        if not img.get('loading'):
            img['loading'] = 'lazy'
        
        # Add decoding async
        if not img.get('decoding'):
            img['decoding'] = 'async'


def _process_inline_elements(soup: BeautifulSoup) -> None:
    """Add classes to inline elements like strong and em."""
    for strong in soup.find_all('strong'):
        _add_classes(strong, TAILWIND_CLASSES['strong'])
    
    for b in soup.find_all('b'):
        _add_classes(b, TAILWIND_CLASSES['strong'])


# ============================================================================
# STANDALONE TESTING
# ============================================================================

if __name__ == '__main__':
    # Test with sample markdown HTML
    sample_html = """
    <h2>Test Heading</h2>
    <p>This is a paragraph with <strong>bold text</strong> and a <a href="https://example.com">link</a>.</p>
    <ul>
        <li>Item one</li>
        <li>Item two</li>
    </ul>
    <pre><code class="language-python">print("Hello")</code></pre>
    <table>
        <thead>
            <tr><th>Header 1</th><th>Header 2</th></tr>
        </thead>
        <tbody>
            <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </tbody>
    </table>
    """
    
    result = format_blog_html(sample_html)
    print("Formatted HTML:")
    print(result)

