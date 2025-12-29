# Ready Server Singapore - Static Website

High-performance static website for [Ready Server Singapore](https://readyserver.sg), built with Jinja2 templates, Alpine.js, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.0.0
- **Python** >= 3.11

### Installation

```bash
npm install
pip install -r requirements.txt
```

### Development

```bash
npm run dev
```

Starts a local server at http://localhost:8000 with hot reload.

### Build

```bash
npm run build
```

Output is generated in the `dist/` folder.

## 📁 Project Structure

```
├── src/
│   ├── templates/          # Jinja2 HTML templates
│   │   ├── base.html       # Base layout (GTM, meta tags, scripts)
│   │   ├── components/     # Reusable UI components
│   │   ├── sections/       # Page sections (hero, features, etc.)
│   │   └── pages/          # Full page templates
│   ├── content/blog/       # Markdown blog posts
│   ├── data/               # Site configuration (JSON/YAML)
│   └── static/             # CSS, JS, images
│       ├── css/            # Tailwind input CSS
│       ├── js/             # Alpine.js, analytics
│       └── images/         # Image assets
├── dist/                   # Build output
├── docs/                   # Documentation
│   ├── cursor.md           # AI assistant context guide
│   └── gtm-tracking-plan.md # Analytics implementation spec
├── build.py                # Python build script
├── package.json            # Node.js config
├── requirements.txt        # Python dependencies
├── tailwind.config.js      # Tailwind CSS config
├── _headers                # Cloudflare security headers
└── _redirects              # Cloudflare redirects
```

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Templating** | Jinja2 (Python) |
| **Styling** | Tailwind CSS 3.4 |
| **Interactivity** | Alpine.js 3.14 |
| **Build** | Python + Node.js |
| **Analytics** | Google Tag Manager + GA4 |
| **Hosting** | Cloudflare Pages |

## 🌐 Cloudflare Pages Deployment

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output | `dist` |
| Node.js | 20 (auto-detected from `.nvmrc`) |
| Python | 3.11 (auto-detected from `.python-version`) |

## 📊 Analytics System

The site implements a comprehensive GTM/GA4 tracking system optimized for mobile app download conversions.

### Core Events

| Event | Purpose |
|-------|---------|
| `store_outbound_click` | **Primary KPI** - App Store/Play Store clicks |
| `cta_click` | Internal CTA navigation |
| `view_section` | Section visibility tracking |
| `faq_open` | FAQ accordion interactions |
| `scroll_depth` | Scroll milestone tracking |
| `time_on_page` | Time engagement metrics |

### Data Attributes

```html
<!-- Store link tracking -->
<a href="https://apps.apple.com/..."
   data-gtm-id="home.hero.appstore"
   data-gtm-placement="hero"
   data-gtm-section="home.hero"
   data-gtm-destination="app_store">

<!-- Section visibility -->
<section data-track-section="home.features">
```

For full analytics documentation, see [docs/gtm-tracking-plan.md](docs/gtm-tracking-plan.md).

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Full production build |
| `npm run build:local` | Local build (uses `pip` instead of `pip install --user`) |
| `npm run build:css` | Rebuild Tailwind CSS only |
| `npm run serve` | Serve dist folder locally |
| `npm run clean` | Remove dist folder |

## 🎨 Adding Content

### New Page

1. Create template in `src/templates/pages/`
2. Register in `build.py` under `build_pages()`
3. Add to sitemap if needed

### New Blog Post

Create `src/content/blog/post-slug.md`:

```yaml
---
title: "Post Title"
slug: "post-slug"
description: "SEO description"
date: 2025-01-15
author: "Ready Server Team"
category: "Product"
published: true
---

Content in Markdown...
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [docs/cursor.md](docs/cursor.md) | AI assistant context guide |
| [docs/gtm-tracking-plan.md](docs/gtm-tracking-plan.md) | Analytics implementation specification |

## 📜 License

Copyright © 2025 Ready Server Pte Ltd. All rights reserved.
