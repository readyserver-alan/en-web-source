# Ready Server Design System

**Version:** 1.0  
**Last Updated:** December 2025  
**Framework:** Tailwind CSS + Alpine.js  
**Inspired by:** Cash App's minimalist aesthetic with blue accent

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Best Practices](#best-practices)

---

## Design Philosophy

### Core Principles

1. **Minimalist & Clean**: Inspired by Cash App's clean, uncluttered interface
2. **Blue Accent**: Strategic use of blue (`hsl(217 91% 60%)`) as the primary brand color
3. **Performance-First**: CSS containment, GPU acceleration, and optimized animations
4. **Accessibility**: WCAG AA compliant with proper contrast ratios and keyboard navigation
5. **Mobile-First**: Responsive design that works seamlessly across all devices
6. **Dark Mode Native**: Full dark mode support with optimized color palettes

### Visual Language

- **Rounded Corners**: Generous use of rounded corners (`rounded-2xl`, `rounded-3xl`) for a modern, friendly feel
- **Subtle Shadows**: Layered shadows for depth without overwhelming the design
- **Glassmorphism**: Backdrop blur effects for modern, layered interfaces
- **Gradient Accents**: Blue gradients for emphasis and visual interest
- **Floating Elements**: Subtle float animations for interactive elements

---

## Color System

### Theme Variables

All colors use HSL format for easy manipulation and theming.

#### Light Theme

```css
/* Backgrounds */
--background: 220 20% 98%;        /* Cool-tinted off-white */
--foreground: 222 47% 11%;        /* Near-black text */

/* Cards & Surfaces */
--card: 0 0% 100%;                /* Pure white */
--card-foreground: 222 47% 11%;

/* Primary Brand Color (Blue) */
--primary: 217 91% 52%;           /* Vibrant blue */
--primary-foreground: 0 0% 100%;  /* White text on blue */
--primary-glow: 217 91% 60%;      /* Lighter blue for glows */

/* Secondary & Muted */
--secondary: 214 32% 96%;         /* Light blue-tinted */
--muted: 214 25% 94%;             /* Subtle background */
--muted-foreground: 220 13% 35%;  /* WCAG AA compliant (5.1:1 ratio) */

/* Borders & Inputs */
--border: 214 25% 85%;            /* Visible borders */
--input: 214 25% 88%;
--ring: 217 91% 52%;              /* Focus ring */

/* Destructive/Error */
--destructive: 0 72% 51%;         /* Red */
--destructive-foreground: 0 0% 100%;
```

#### Dark Theme

```css
/* Backgrounds */
--background: 222 47% 5%;         /* Deep dark blue-black */
--foreground: 0 0% 98%;           /* Off-white text */

/* Cards & Surfaces */
--card: 222 47% 8%;               /* Slightly lighter than background */
--card-foreground: 0 0% 98%;

/* Primary Brand Color (Blue) */
--primary: 217 91% 60%;           /* Brighter blue for dark mode */
--primary-foreground: 0 0% 100%;
--primary-glow: 217 91% 70%;      /* Even lighter for glows */

/* Secondary & Muted */
--secondary: 217 33% 17%;
--muted: 217 33% 17%;
--muted-foreground: 215 20% 65%;

/* Borders & Inputs */
--border: 217 33% 17%;
--input: 217 33% 17%;
--ring: 217 91% 60%;

/* Destructive/Error */
--destructive: 0 63% 31%;
--destructive-foreground: 0 0% 98%;
```

### Color Usage Guidelines

#### Primary Blue
- **Use for:** CTAs, links, active states, brand elements
- **Don't use for:** Large background areas, body text
- **Accessibility:** Ensure 4.5:1 contrast ratio with backgrounds

```html
<!-- Primary button -->
<button class="bg-primary text-primary-foreground">Deploy Now</button>

<!-- Text accent -->
<span class="text-gradient">under 3 minutes</span>
```

#### Semantic Colors

```html
<!-- Success (Green) -->
<div class="bg-green-500/10 text-green-600 dark:text-green-400">
  99% Uptime
</div>

<!-- Warning (Orange/Yellow) -->
<div class="bg-orange-500/10 text-orange-600 dark:text-orange-400">
  Warning message
</div>

<!-- Error (Red) -->
<div class="bg-destructive/10 text-destructive">
  Error message
</div>

<!-- Info (Blue) -->
<div class="bg-primary/10 text-primary">
  Information
</div>
```

### Gradients

```css
/* Primary gradient (blue to cyan) */
--gradient-primary: linear-gradient(135deg, hsl(217 91% 52%), hsl(200 85% 52%));

/* Background gradient */
--gradient-dark: linear-gradient(180deg, hsl(220 20% 98%), hsl(220 25% 96%));

/* Glow gradient */
--gradient-glow: radial-gradient(ellipse at center, hsl(217 91% 60% / 0.12), transparent 70%);
```

**Usage:**

```html
<!-- Text gradient -->
<h1 class="text-gradient">Your server. Live in under 3 minutes.</h1>

<!-- Background gradient -->
<div class="bg-gradient-to-b from-background to-background/95">
  Content
</div>
```

---

## Typography

### Font Family

**Primary:** Inter (with system fallback stack)

```css
font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, 
             BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Type Scale

```html
<!-- Display (Hero headlines) -->
<h1 class="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black">
  Your server. Live in under 3 minutes.
</h1>

<!-- Page Titles -->
<h2 class="text-3xl md:text-5xl font-black">
  Strategically located for APAC
</h2>

<!-- Section Headings -->
<h3 class="text-2xl md:text-3xl font-bold">
  Enterprise hardware
</h3>

<!-- Card Titles -->
<h4 class="text-xl font-bold">
  Singapore
</h4>

<!-- Body Text -->
<p class="text-base text-muted-foreground">
  Deploy high-performance VPS hosting in Singapore...
</p>

<!-- Small Text -->
<p class="text-sm text-muted-foreground">
  From $0.009/hr
</p>

<!-- Extra Small (Labels, Captions) -->
<span class="text-xs text-muted-foreground">
  Active Servers
</span>
```

### Font Weights

- **Black (900):** Hero headlines, large numbers
- **Bold (700):** Section headings, card titles
- **Semibold (600):** Buttons, labels, emphasis
- **Medium (500):** Navigation, subtle emphasis
- **Regular (400):** Body text, descriptions

### Text Styles

```html
<!-- Gradient text -->
<span class="text-gradient">APAC</span>

<!-- Muted text -->
<p class="text-muted-foreground">Secondary information</p>

<!-- Uppercase labels -->
<span class="text-sm uppercase tracking-wider font-semibold text-primary">
  Infrastructure
</span>

<!-- Tracking -->
<h1 class="tracking-tight">Tight tracking for headlines</h1>
<span class="tracking-wider">Wide tracking for labels</span>
```

---

## Spacing & Layout

### Container System

```html
<!-- Standard container -->
<div class="container mx-auto px-6">
  Content
</div>

<!-- Max-width variants -->
<div class="max-w-2xl mx-auto">  <!-- 672px -->
<div class="max-w-4xl mx-auto">  <!-- 896px -->
<div class="max-w-5xl mx-auto">  <!-- 1024px -->
<div class="max-w-6xl mx-auto">  <!-- 1152px -->
<div class="max-w-7xl mx-auto">  <!-- 1280px -->
```

### Section Spacing

```html
<!-- Standard section -->
<section class="py-20 md:py-32">
  Content
</section>

<!-- Compact section -->
<section class="py-12 md:py-16">
  Content
</section>

<!-- Hero section -->
<section class="min-h-screen flex items-center">
  Content
</section>
```

### Grid Systems

```html
<!-- 2-column responsive -->
<div class="grid md:grid-cols-2 gap-8">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- 3-column responsive -->
<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- 4-column responsive -->
<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</div>
```

### Spacing Scale

- **xs:** `gap-1` (4px)
- **sm:** `gap-2` (8px)
- **md:** `gap-4` (16px)
- **lg:** `gap-6` (24px)
- **xl:** `gap-8` (32px)
- **2xl:** `gap-12` (48px)

---

## Components

### Buttons

#### Primary Button

```html
<button class="btn-primary">
  Deploy Now
</button>

<!-- With icon -->
<button class="btn-primary flex items-center gap-2">
  <span>Get Started</span>
  <svg class="w-5 h-5">...</svg>
</button>
```

**CSS:**
```css
.btn-primary {
  @apply bg-primary text-primary-foreground font-semibold 
         px-8 py-4 rounded-full transition-all duration-300;
}

.btn-primary:hover {
  @apply scale-105;
  box-shadow: var(--shadow-glow);
}
```

#### Secondary Button

```html
<button class="bg-secondary text-secondary-foreground font-semibold px-8 py-4 rounded-full hover:bg-secondary/80 transition-all">
  Learn More
</button>
```

#### Ghost Button

```html
<button class="text-foreground font-semibold px-8 py-4 rounded-full border-2 border-border hover:border-primary hover:text-primary transition-all">
  Contact Sales
</button>
```

### Cards

#### Elevated Card

```html
<div class="card-elevated p-8">
  <h3 class="text-xl font-bold mb-4">Card Title</h3>
  <p class="text-muted-foreground">Card content goes here...</p>
</div>
```

**CSS:**
```css
.card-elevated {
  @apply bg-card border border-border rounded-2xl;
  box-shadow: var(--shadow-card);
}
```

#### Interactive Card (Hover Effect)

```html
<a href="/vps-hosting" class="group block p-8 bg-card border border-border rounded-2xl transition-all duration-300 hover:border-primary/50 hover:-translate-y-1">
  <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
    <svg class="w-6 h-6 text-primary">...</svg>
  </div>
  <h3 class="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
    VPS Hosting
  </h3>
  <p class="text-muted-foreground">
    High-performance Linux VPS with NVMe SSD storage.
  </p>
</a>
```

#### Glassmorphic Card

```html
<div class="bg-card/50 backdrop-blur rounded-2xl p-4 border border-border/30">
  Content with glassmorphism effect
</div>
```

### Badges & Pills

```html
<!-- Primary badge -->
<span class="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
  New
</span>

<!-- Success badge -->
<span class="bg-green-500/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full text-sm font-semibold">
  Running
</span>

<!-- Chip/Tag -->
<span class="px-3 py-1.5 bg-muted text-muted-foreground text-xs font-medium rounded-full">
  Tier IV datacenter
</span>
```

### Icons

**Size Scale:**
- `w-4 h-4` - Small (16px)
- `w-5 h-5` - Medium (20px)
- `w-6 h-6` - Large (24px)
- `w-8 h-8` - Extra Large (32px)

```html
<!-- Icon with background -->
<div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
  <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="..."/>
  </svg>
</div>

<!-- Inline icon -->
<span class="flex items-center gap-2">
  <svg class="w-5 h-5 text-primary">...</svg>
  <span>VPS Hosting</span>
</span>
```

### Phone Mockup

Standardized iPhone-style mockup with Dynamic Island:

```html
{% include 'components/phone-mockup.html' %}
```

**Features:**
- iPhone 14 Pro style with Dynamic Island
- Animated menu items
- Status bar with time, WiFi, battery
- Quick stats display
- Floating animation
- Glow effect

### Navigation

#### Desktop Navigation

```html
<nav class="hidden lg:flex items-center gap-8">
  <a href="/vps-hosting" class="text-foreground hover:text-primary transition-colors">
    VPS Hosting
  </a>
  <a href="/blog" class="text-foreground hover:text-primary transition-colors">
    Blog
  </a>
</nav>
```

#### Mobile Navigation

```html
<button 
  @click="mobileOpen = !mobileOpen"
  class="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
  aria-label="Toggle menu"
>
  <svg class="w-6 h-6">...</svg>
</button>
```

### Forms

```html
<!-- Input field -->
<input 
  type="text"
  class="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all"
  placeholder="Enter your email"
>

<!-- Textarea -->
<textarea 
  class="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
  rows="4"
  placeholder="Your message"
></textarea>

<!-- Select -->
<select class="w-full px-4 py-3 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring transition-all">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

---

## Animations

### Scroll Animations

```html
<!-- Fade up (most common) -->
<div class="opacity-0 animate-fade-up" style="animation-delay: 0.1s;">
  Content fades up on scroll
</div>

<!-- Slide in from left -->
<div class="opacity-0 animate-slide-in-left" style="animation-delay: 0.2s;">
  Content slides in from left
</div>

<!-- Slide in from right -->
<div class="opacity-0 animate-slide-in-right" style="animation-delay: 0.3s;">
  Content slides in from right
</div>

<!-- Scale up -->
<div class="opacity-0 animate-scale-up">
  Content scales up
</div>
```

### Staggered Animations

```html
<div class="grid grid-cols-3 gap-8">
  <div class="animate-fade-up" style="animation-delay: 0.1s;">Item 1</div>
  <div class="animate-fade-up" style="animation-delay: 0.2s;">Item 2</div>
  <div class="animate-fade-up" style="animation-delay: 0.3s;">Item 3</div>
</div>
```

### Continuous Animations

```html
<!-- Float animation (6s loop) -->
<div class="animate-float">
  Floating element
</div>

<!-- Pulse glow (2s loop) -->
<div class="animate-pulse-glow">
  Glowing element
</div>

<!-- Gradient shift (8s loop) -->
<div class="bg-gradient-to-r from-primary to-cyan-500 animate-gradient">
  Animated gradient
</div>

<!-- Marquee scroll (80s loop) -->
<div class="animate-marquee">
  Scrolling content
</div>
```

### Hover Animations

```html
<!-- Scale on hover -->
<button class="transition-transform duration-300 hover:scale-105">
  Hover me
</button>

<!-- Translate on hover -->
<div class="transition-all duration-300 hover:-translate-y-1">
  Lifts on hover
</div>

<!-- Glow on hover -->
<button class="btn-primary">
  <!-- Automatically adds glow on hover -->
  Glows on hover
</button>
```

### Animation Delays

Use inline styles for staggered delays:

```html
<div class="animate-fade-up" style="animation-delay: 0.1s;">First</div>
<div class="animate-fade-up" style="animation-delay: 0.2s;">Second</div>
<div class="animate-fade-up" style="animation-delay: 0.3s;">Third</div>
```

### Performance Optimization

All animations use GPU acceleration:

```css
/* Automatically applied to animated elements */
transform: translateZ(0);
backface-visibility: hidden;
will-change: transform;
```

### Reduced Motion

Respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
}
```

### Skip Links

```html
<a href="#main-content" class="skip-link">
  Skip to main content
</a>
```

### Screen Reader Only Content

```html
<span class="sr-only">
  Text visible only to screen readers
</span>
```

### ARIA Labels

```html
<!-- Navigation -->
<nav aria-label="Main navigation">
  ...
</nav>

<!-- Buttons -->
<button aria-label="Close menu">
  <svg>...</svg>
</button>

<!-- Sections -->
<section aria-labelledby="features-heading">
  <h2 id="features-heading">Features</h2>
  ...
</section>
```

### Color Contrast

All text meets WCAG AA standards:

- **Normal text:** 4.5:1 minimum
- **Large text:** 3:1 minimum
- **Muted foreground:** 5.1:1 (exceeds AA)

### Keyboard Navigation

All interactive elements are keyboard accessible:

```html
<!-- Dropdown menu -->
<div x-data="{ open: false }">
  <button 
    @click="open = !open"
    @keydown.escape="open = false"
    aria-expanded="false"
  >
    Menu
  </button>
</div>

<!-- Modal -->
<div 
  x-show="modalOpen"
  @keydown.escape.window="modalOpen = false"
  role="dialog"
  aria-modal="true"
>
  ...
</div>
```

---

## Best Practices

### Component Structure

```html
<!-- Semantic HTML -->
<article class="card-elevated">
  <header>
    <h2>Article Title</h2>
  </header>
  <div>
    <p>Article content...</p>
  </div>
  <footer>
    <time datetime="2025-12-30">December 30, 2025</time>
  </footer>
</article>
```

### Responsive Design

```html
<!-- Mobile-first approach -->
<div class="
  text-base          /* Mobile */
  md:text-lg         /* Tablet */
  lg:text-xl         /* Desktop */
  xl:text-2xl        /* Large desktop */
">
  Responsive text
</div>

<!-- Responsive grid -->
<div class="
  grid 
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols-3     /* Desktop: 3 columns */
  gap-4 md:gap-6 lg:gap-8
">
  ...
</div>
```

### Dark Mode

```html
<!-- Color that adapts to theme -->
<div class="bg-card text-card-foreground">
  Automatically adapts to dark mode
</div>

<!-- Explicit dark mode variant -->
<div class="bg-white dark:bg-zinc-900">
  Custom dark mode styling
</div>
```

### Performance

```html
<!-- Lazy load images -->
<img 
  src="/image.jpg" 
  loading="lazy" 
  decoding="async"
  alt="Description"
>

<!-- Content visibility for off-screen sections -->
<section class="py-20">
  <!-- Automatically optimized via globals.css -->
  Content
</section>
```

### Analytics Tracking

```html
<!-- Track button clicks -->
<button data-gtm-id="cta.deploy.click">
  Deploy Now
</button>

<!-- Track section views -->
<section data-track-section="home.features" data-section-label="Features">
  ...
</section>
```

### Code Organization

```
src/
├── templates/
│   ├── components/     # Reusable UI components
│   ├── sections/       # Page sections (hero, features, etc.)
│   ├── pages/          # Full page templates
│   └── layouts/        # Base layouts
├── static/
│   ├── css/
│   │   └── globals.css # Design system styles
│   ├── js/
│   │   └── app.js      # Alpine.js components
│   └── images/         # Static assets
```

### Naming Conventions

- **Components:** `kebab-case` (e.g., `phone-mockup.html`)
- **CSS Classes:** `kebab-case` (e.g., `btn-primary`)
- **JavaScript:** `camelCase` (e.g., `mobileOpen`)
- **Files:** `kebab-case` (e.g., `vps-hosting.html`)

---

## Component Library

### Quick Reference

| Component | Class | Usage |
|-----------|-------|-------|
| Primary Button | `.btn-primary` | CTAs, main actions |
| Elevated Card | `.card-elevated` | Content cards |
| Text Gradient | `.text-gradient` | Accent text |
| Glow Effect | `.glow-effect` | Emphasis elements |
| Fade Up | `.animate-fade-up` | Scroll animations |
| Float | `.animate-float` | Continuous motion |
| Screen Reader | `.sr-only` | Accessibility |

---

## Resources

### Tools

- **Tailwind CSS:** https://tailwindcss.com
- **Alpine.js:** https://alpinejs.dev
- **Heroicons:** https://heroicons.com (for SVG icons)
- **Inter Font:** https://fonts.google.com/specimen/Inter

### Color Tools

- **HSL Color Picker:** https://hslpicker.com
- **Contrast Checker:** https://webaim.org/resources/contrastchecker

### Inspiration

- **Cash App:** Minimalist design philosophy
- **Linear:** Clean, modern UI patterns
- **Vercel:** Developer-focused aesthetics

---

## Changelog

### Version 1.0 (December 2025)
- Initial design system documentation
- Extracted from production codebase
- Documented all core components and patterns
- Added accessibility guidelines
- Included animation system

---

**Maintained by:** Ready Server Design Team  
**Questions?** Contact the development team or refer to the codebase examples.

