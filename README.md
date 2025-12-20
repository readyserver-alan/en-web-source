# Ready Server Singapore - Static Website

High-performance static website for [Ready Server Singapore](https://readyserver.sg), built with Jinja2 templates, Alpine.js, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
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
│   ├── templates/      # Jinja2 HTML templates
│   ├── content/blog/   # Markdown blog posts
│   ├── data/           # Site configuration (JSON/YAML)
│   └── static/         # CSS, JS, images
├── dist/               # Build output
├── build.py            # Python build script
├── package.json        # Node.js config
├── requirements.txt    # Python dependencies
├── tailwind.config.js  # Tailwind CSS config
├── _headers            # Cloudflare security headers
└── _redirects          # Cloudflare redirects
```

## 🌐 Cloudflare Pages Deployment

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Build output | `dist` |
| Node.js | 18 (auto-detected from `.nvmrc`) |
| Python | 3.11 (auto-detected from `.python-version`) |

## 🛠 Tech Stack

- **Templating**: Jinja2
- **Styling**: Tailwind CSS
- **Interactivity**: Alpine.js
- **Analytics**: Google Tag Manager
- **Hosting**: Cloudflare Pages

## 📜 License

Copyright © 2025 Ready Server Pte Ltd. All rights reserved.
