# GTM/GA4 Tracking System Plan
## ReadyServer Mobile App Download Optimization

**Document Version**: 1.2  
**Date**: December 29, 2025  
**Core KPI**: Mobile App Downloads (Store Outbound Clicks)  
**GTM Container ID**: GTM-P5CRWLDZ

---

## Table of Contents

1. [Repo Scan & Inventory](#1-repo-scan--inventory)
2. [Funnel Definition](#2-funnel-definition-download-first)
3. [Event Taxonomy & Schema](#3-event-taxonomy--schema-the-contract)
4. [Instrumentation Approach](#4-instrumentation-approach)
5. [GTM Container Design](#5-gtm-container-design)
6. [Measurement & Reporting Plan](#6-measurement--reporting-plan)
7. [Acceptance Criteria](#7-acceptance-criteria)

---

## 1. Repo Scan & Inventory

### 1.1 Framework & Routing

| Aspect | Details |
|--------|---------|
| **Framework** | Static site generator (Python/Jinja2 templates) |
| **Interactivity** | Alpine.js v3.14.8 |
| **Styling** | Tailwind CSS |
| **Routing** | Traditional page loads (no SPA) — each page is a separate HTML file |
| **Build Output** | `/dist/` directory, deployed to Cloudflare Pages |
| **GTM Loading** | Deferred via `requestIdleCallback` (see `src/templates/base.html:77-92`) |

### 1.2 Landing Pages Relevant to App Download

| Path | File Location | page_key | page_type | In Funnel |
|------|---------------|----------|-----------|-----------|
| `/` | `src/templates/pages/home.html` | `home` | `landing` | ✓ Primary |
| `/download-mobile-app` | `src/templates/pages/download-mobile-app.html` | `download_mobile_app` | `landing` | ✓ Primary |
| `/vps-hosting` | `src/templates/pages/vps-hosting.html` | `vps_hosting` | `product` | ✓ Secondary |
| `/windows-vps` | `src/templates/pages/windows-vps.html` | `windows_vps` | `product` | ✓ Secondary |
| `/dedicated-servers` | `src/templates/pages/dedicated-servers.html` | `dedicated_servers` | `product` | ✗ Excluded* |

*`/dedicated-servers` excluded from funnel v1 — no app store badges or download CTAs on this page. Track `page_view` for baseline but exclude from funnel analysis.

### 1.3 Canonical Section Keys

**IMPORTANT**: Use these exact keys for BOTH `data-track-section` (visibility) AND `data-gtm-section` (click context). Never use different naming schemes.

| Canonical Section Key | Page | Human Label | Track in Funnel | Component File |
|-----------------------|------|-------------|-----------------|----------------|
| `home.hero` | `/` | Hero Section | ✗ Awareness only | `hero-dramatic.html` |
| `home.social_proof` | `/` | As Seen On | ✗ Awareness only | `as-seen-on.html` |
| `home.features` | `/` | Features Section | ✓ Value section | `features.html` |
| `home.app_showcase` | `/` | App Showcase | ✓ Value section | `app-showcase.html` |
| `home.faq` | `/` | FAQ Section | ✗ Objection handling | `faq.html` |
| `home.cta` | `/` | Final CTA | ✗ Conversion point | `cta.html` |
| `download.hero` | `/download-mobile-app` | Hero Section | ✗ Awareness only | Line 68-255 |
| `download.benefits` | `/download-mobile-app` | Why ReadyServer | ✓ Value section | Line 260-325 |
| `download.comparison` | `/download-mobile-app` | Comparison | ✓ Value section | Line 330-424 |
| `download.locations` | `/download-mobile-app` | Locations | ✗ Feature detail | Line 429-499 |
| `download.features` | `/download-mobile-app` | Technical Features | ✗ Feature detail | Line 504-583 |
| `download.faq` | `/download-mobile-app` | FAQ Section | ✗ Objection handling | Line 588-651 |
| `download.cta` | `/download-mobile-app` | Final CTA | ✗ Conversion point | Line 656-712 |

**Note**: `home.blog` section removed from tracking scope — not relevant to download conversion goal and adds noise to section view data.

### 1.4 Download-Related CTA Inventory

#### Direct Store Outbound Links (Primary Conversion Points)

| CTA ID | File Path | Placement | Section | Destination | href |
|--------|-----------|-----------|---------|-------------|------|
| `home.hero.appstore` | `hero-dramatic.html` → `app-store-badges.html` | `hero` | `home.hero` | `app_store` | `https://apps.apple.com/sg/app/ready-server/id6739326850` |
| `home.hero.playstore` | `hero-dramatic.html` → `app-store-badges.html` | `hero` | `home.hero` | `play_store` | `https://play.google.com/store/apps/details?id=com.appcms.liveapp&hl=en_SG` |
| `home.app_showcase.appstore` | `app-showcase.html` → `app-store-badges.html` | `mid` | `home.app_showcase` | `app_store` | Same |
| `home.app_showcase.playstore` | `app-showcase.html` → `app-store-badges.html` | `mid` | `home.app_showcase` | `play_store` | Same |
| `home.cta.appstore` | `cta.html` → `app-store-badges.html` | `footer` | `home.cta` | `app_store` | Same |
| `home.cta.playstore` | `cta.html` → `app-store-badges.html` | `footer` | `home.cta` | `play_store` | Same |
| `download.hero.appstore` | `download-mobile-app.html` → `app-store-badges.html` | `hero` | `download.hero` | `app_store` | Same |
| `download.hero.playstore` | `download-mobile-app.html` → `app-store-badges.html` | `hero` | `download.hero` | `play_store` | Same |
| `download.hero.qr_appstore` | `download-mobile-app.html:191-213` | `hero` | `download.hero` | `app_store` | Same |
| `download.hero.qr_playstore` | `download-mobile-app.html:216-238` | `hero` | `download.hero` | `play_store` | Same |

#### Internal Navigation CTAs (Intent Signals)

| CTA ID | File Path | Placement | Section | link_type | href |
|--------|-----------|-----------|---------|-----------|------|
| `nav.desktop.download_app` | `header.html:172-178` | `nav` | `nav` | `internal` | `/download-mobile-app` |
| `nav.mobile.download_app` | `header.html:308-314` | `nav` | `nav` | `internal` | `/download-mobile-app` |
| `home.features.download_app` | `features.html:145-152` | `mid` | `home.features` | `internal` | `/download-mobile-app` |
| `home.cta.primary` | `cta.html:52-61` | `footer` | `home.cta` | `internal` | `/download-mobile-app` |
| `footer.download_mobile_app` | `footer.html:108-118` | `footer` | `footer` | `internal` | `/download-mobile-app` |
| `download.final_cta.deploy` | `download-mobile-app.html:676-684` | `footer` | `download.cta` | `internal` | `/download-mobile-app` |

### 1.5 Existing Tracking Infrastructure

**File**: `src/static/js/analytics.js`

**Current Events (to be consolidated)**:
- `page_view` ✓ Keep
- `download_app_cta` ⚠️ **REMOVE** — duplicates `store_outbound_click`
- `cta_click` ✓ Keep (for internal CTAs only)
- `outbound_link_click` ⚠️ **MODIFY** — exclude store links
- `accordion_expand` → Rename to `faq_open`
- `scroll_depth` ✓ Keep as diagnostic
- `section_view` → Rename to `view_section`
- `time_on_page` ✓ Keep as diagnostic

---

## 2. Funnel Definition (Download-First)

### 2.1 Two Funnel Variants

Users reach the download page via two paths. Track both to avoid undercounting intent.

#### Funnel A: Cross-Page Journey (Home → Download → Store)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1          STEP 2              STEP 3            STEP 4               │
│  page_view  →  value_engagement  →  intent_signal  →  store_outbound_click │
│  (home)        (view_section)       (cta_click)       (store click)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Funnel B: Direct Lander Journey (Ad/SEO/QR → Download → Store)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1          STEP 2              STEP 3                                 │
│  page_view  →  value_engagement  →  store_outbound_click                   │
│  (download)    (view_section)       (store click)                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Implementation**: Create both as separate Funnel Explorations in GA4, or use segments to filter by entry page.

### 2.2 Funnel Step Definitions (Strict)

| Step | Funnel A | Funnel B |
|------|----------|----------|
| **1. Page View** | `page_view` where `page_key` IN (`home`, `vps_hosting`, `windows_vps`) | `page_view` where `page_key` = `download_mobile_app` |
| **2. Value Engagement** | `view_section` where `section` IN (`home.features`, `home.app_showcase`) | `view_section` where `section` IN (`download.benefits`, `download.comparison`) |
| **3. Intent Signal** | `cta_click` where `url` contains `/download-mobile-app` | *(Skip — they're already on download page)* |
| **4. Store Outbound** | `store_outbound_click` | `store_outbound_click` |

**⚠️ IMPORTANT**: Step 2 uses ONLY `view_section` of specific value sections. 

**Diagnostic metrics** (NOT funnel gates):
- `scroll_depth` — Use to understand page consumption patterns
- `time_on_page` — Use to identify confusion vs. engagement
- `view_section` of non-value sections — Use to understand section performance

### 2.3 Funnel Success Metrics

> **Note**: These are initial benchmark hypotheses. Actual targets should be calibrated after 2 weeks of baseline data collection.

| Metric | Funnel A | Funnel B | Initial Hypothesis |
|--------|----------|----------|-------------------|
| **Engagement Rate** | Step 2 / Step 1 | Step 2 / Step 1 | ~40-60% |
| **Intent Rate** | Step 3 / Step 2 | N/A | ~20-35% |
| **Download CTR** | Step 4 / Step 3 | Step 3 / Step 2 | ~30-50% |
| **Overall Conversion** | Step 4 / Step 1 | Step 3 / Step 1 | ~5-10% |

---

## 3. Event Taxonomy & Schema (The Contract)

### 3.1 Event Precedence Rules (CRITICAL)

For any click event, apply this precedence to **prevent double firing**:

```
1. Is href an App Store or Play Store link? (check by hostname)
   └─ YES → Fire ONLY `store_outbound_click`. Stop.
   
2. Is it an internal link (same origin)?
   └─ YES → Fire ONLY `cta_click`. Stop.
   
3. Is it an external link (different origin)?
   └─ YES → Fire ONLY `outbound_link_click`. Stop.
   
4. Is it a non-link CTA (button, toggle)?
   └─ YES → Fire appropriate event (faq_open, etc.). Stop.
```

**Store link detection (by hostname, not substring)**:

```javascript
function isStoreLink(href) {
  try {
    const url = new URL(href);
    const storeHosts = [
      'apps.apple.com',
      'itunes.apple.com',  // legacy, just in case
      'play.google.com'
    ];
    return storeHosts.includes(url.hostname);
  } catch {
    return false;
  }
}
```

**⚠️ DO NOT use substring matching** (e.g., `href.includes('apps.apple.com')`). It can be spoofed by malicious URLs like `apps.apple.com.evil.com` and breaks on UTM redirectors.

### 3.2 Required Events

#### `page_view`
Fires on every page load.

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `page_key` | string | ✓ | Stable page identifier | `home`, `download_mobile_app`, `vps_hosting` |
| `page_type` | string | ✓ | Page category | `landing`, `product`, `blog`, `support`, `legal` |
| `page_path` | string | ✓ | URL path | `/`, `/download-mobile-app` |

#### `store_outbound_click`
Fires when user clicks an App Store or Play Store link. **PRIMARY CONVERSION EVENT.**

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `event_id` | string | ✓ | Unique ID for de-dupe | `1703836800000_a1b2c3` |
| `cta_id` | string | ✓ | Stable identifier | `home.hero.appstore` |
| `placement` | string | ✓ | UI location | `hero`, `mid`, `footer` |
| `section` | string | ✓ | Canonical section key | `home.hero`, `download.hero` |
| `destination` | string | ✓ | Store type | `app_store`, `play_store` |
| `url` | string | ✓ | Full store URL | `https://apps.apple.com/...` |
| `link_type` | string | ✓ | Always "store" | `store` |
| `variant` | string | ✓ | A/B test variant | `control` |

#### `cta_click`
Fires for internal CTA clicks (NOT store links).

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `event_id` | string | ✓ | Unique ID for de-dupe | `1703836800000_d4e5f6` |
| `cta_id` | string | ✓ | Stable identifier | `nav.desktop.download_app` |
| `placement` | string | ✓ | UI location | `nav`, `hero`, `mid`, `footer` |
| `section` | string | ✓ | Canonical section key | `nav`, `home.features` |
| `url` | string | ✓ | Destination path | `/download-mobile-app` |
| `link_type` | string | ✓ | Link type | `internal` |
| `variant` | string | ✓ | A/B test variant | `control` |

#### `view_section`
Fires when a section becomes visible (35% threshold).

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `section` | string | ✓ | Canonical section key | `home.hero`, `home.features` |
| `section_label` | string | ✗ | Human-readable (optional) | `Hero Section` |

**Threshold Note**: Use 35% visibility threshold consistently. This works better for hero sections on small screens where 50% may never be reached.

#### `faq_open`
Fires when FAQ accordion item is expanded.

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `event_id` | string | ✓ | Unique ID for de-dupe | `1703836800000_g7h8i9` |
| `faq_id` | string | ✓ | Stable item identifier | `home.faq.1`, `download.faq.3` |
| `faq_label` | string | ✗ | Short static label (optional) | `getting_started`, `pricing`, `mobile_app` |
| `section` | string | ✓ | Parent section | `home.faq`, `download.faq` |

**⚠️ DO NOT capture `faq_question` text.** It bloats cardinality, risks encoding issues, and makes GA4 UI messy. Use static `faq_label` if you need readability.

#### `outbound_link_click`
Fires for external links that are NOT store links.

| Parameter | Type | Required | Description | Example Values |
|-----------|------|----------|-------------|----------------|
| `event_id` | string | ✓ | Unique ID for de-dupe | `1703836800000_j0k1l2` |
| `url` | string | ✓ | Full URL | `https://example.com/...` |
| `link_domain` | string | ✓ | Domain only | `example.com` |
| `link_type` | string | ✓ | Always "external" | `external` |

### 3.3 Event ID Generation

Add `event_id` to every click event for de-duplication and debugging.

```javascript
function generateEventId() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}_${random}`;
}
```

**Why**: Even with precedence rules, double-firing can happen via:
- Nested elements with multiple listeners
- Rapid double-clicks
- Browser quirks

`event_id` enables:
- Easy debugging in GTM Preview
- De-duplication in BigQuery exports
- Correlation of events in session analysis

### 3.4 Diagnostic Events (Not in Funnel)

#### `scroll_depth`
| Parameter | Type | Description |
|-----------|------|-------------|
| `scroll_percentage` | number | 25, 50, 75, 100 |
| `page_key` | string | Page identifier |

#### `time_on_page`
| Parameter | Type | Description |
|-----------|------|-------------|
| `time_seconds` | number | 30, 60, 120, 300 |
| `page_key` | string | Page identifier |

### 3.5 Parameter Rules

1. **No PII**: Never capture emails, phone numbers, names, or user-submitted text
2. **No question text**: Use `faq_id` and optional static `faq_label`, never dynamic text
3. **Stable IDs**: Always use `data-gtm-id` attributes, never `innerText`
4. **Single section namespace**: Use identical keys for `data-track-section` and `data-gtm-section`
5. **Variant default**: Always default to `"control"` if no experiment is active
6. **link_type always set**: Every click must have `internal`, `external`, or `store`
7. **event_id on clicks**: Every click event gets a unique ID for de-duplication

### 3.6 Placement Taxonomy

| Placement | Definition |
|-----------|------------|
| `hero` | Above-the-fold hero section |
| `nav` | Header navigation (desktop or mobile) |
| `mid` | Mid-page sections (features, app-showcase, comparison, locations) |
| `footer` | Footer or final CTA sections |
| `modal` | Modal/popup (not currently implemented) |

---

## 4. Instrumentation Approach

### 4.1 Strategy: Data Attributes + Delegated Listeners

Enhance the existing `analytics.js` pattern. **Do not replace.**

#### Required Data Attributes

```html
<!-- Store outbound link -->
<a 
  href="https://apps.apple.com/sg/app/ready-server/id6739326850"
  target="_blank"
  rel="noopener noreferrer"
  data-gtm-id="home.hero.appstore"
  data-gtm-placement="hero"
  data-gtm-section="home.hero"
  data-gtm-destination="app_store"
>

<!-- Internal CTA -->
<a 
  href="/download-mobile-app"
  data-gtm-id="nav.desktop.download_app"
  data-gtm-placement="nav"
  data-gtm-section="nav"
>

<!-- Section visibility -->
<section 
  data-track-section="home.features"
  data-section-label="Features Section"
>

<!-- FAQ item -->
<button
  data-gtm-id="home.faq.1"
  data-gtm-faq-label="getting_started"
>
```

### 4.2 Event Delegation Logic

**⚠️ Use `getAttribute()` instead of `dataset`** to avoid silent failures when click target is a child element (e.g., SVG path inside a link).

```javascript
document.addEventListener('click', (e) => {
  // Find the closest element with data-gtm-id
  const target = e.target.closest('[data-gtm-id]');
  if (!target) return;
  
  // Use getAttribute for robustness (not dataset)
  const gtmId = target.getAttribute('data-gtm-id');
  const placement = target.getAttribute('data-gtm-placement') || 'unknown';
  const section = target.getAttribute('data-gtm-section') || 'unknown';
  const destination = target.getAttribute('data-gtm-destination');
  const faqLabel = target.getAttribute('data-gtm-faq-label');
  
  // Get href from the element or closest anchor
  const linkElement = target.closest('a');
  const href = linkElement?.href;
  
  // Generate unique event ID
  const eventId = generateEventId();
  
  // PRECEDENCE RULE 1: Store links (check by hostname)
  if (href && isStoreLink(href)) {
    pushEvent('store_outbound_click', {
      event_id: eventId,
      cta_id: gtmId,
      placement,
      section,
      destination: destination || deriveDestination(href),
      url: href,
      link_type: 'store',
      variant: getVariant()
    });
    return; // STOP - do not fire other events
  }
  
  // PRECEDENCE RULE 2: Internal links
  if (href && isInternalLink(href)) {
    pushEvent('cta_click', {
      event_id: eventId,
      cta_id: gtmId,
      placement,
      section,
      url: sanitizeUrl(href),
      link_type: 'internal',
      variant: getVariant()
    });
    return; // STOP
  }
  
  // PRECEDENCE RULE 3: External links (non-store)
  if (href && !isInternalLink(href)) {
    pushEvent('outbound_link_click', {
      event_id: eventId,
      url: href,
      link_domain: new URL(href).hostname,
      link_type: 'external'
    });
    return; // STOP
  }
  
  // PRECEDENCE RULE 4: FAQ toggles (non-link)
  if (gtmId.startsWith('home.faq.') || gtmId.startsWith('download.faq.')) {
    pushEvent('faq_open', {
      event_id: eventId,
      faq_id: gtmId,
      faq_label: faqLabel || null,
      section
    });
    return; // STOP
  }
});

// Helper: Check if URL is a store link (by hostname)
function isStoreLink(href) {
  try {
    const url = new URL(href);
    const storeHosts = ['apps.apple.com', 'itunes.apple.com', 'play.google.com'];
    return storeHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

// Helper: Derive destination from store URL
function deriveDestination(href) {
  try {
    const url = new URL(href);
    if (url.hostname.includes('apple.com')) return 'app_store';
    if (url.hostname.includes('play.google.com')) return 'play_store';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// Helper: Generate unique event ID
function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
```

### 4.3 Outbound Click Handling

**DO NOT use `setTimeout` + `window.open()` patterns.** They:
- Get blocked by popup blockers (no longer a direct user gesture)
- Break expected UX (new tab vs same tab)
- Hurt conversion

**Correct approach**:

Since all store links already have `target="_blank"`:
1. The click opens a new tab
2. The original page remains, giving GTM time to fire
3. No scripted navigation needed

```html
<!-- This is already correct in the templates -->
<a 
  href="https://apps.apple.com/..."
  target="_blank"
  rel="noopener noreferrer"
>
```

### 4.4 Implementation Files

| File | Changes |
|------|---------|
| `src/static/js/analytics.js` | Update event logic with precedence rules, add `event_id`, remove `download_app_cta` |
| `src/templates/components/app-store-badges.html` | Add `data-gtm-destination`, `data-gtm-placement`, `data-gtm-section` |
| `src/templates/sections/*.html` | Standardize `data-track-section` to canonical keys |
| `src/templates/components/accordion.html` | Update `data-gtm-id` format, add `data-gtm-faq-label` |

---

## 5. GTM Container Design

### 5.1 Variables

#### Data Layer Variables

| Variable Name | Data Layer Key |
|---------------|----------------|
| DLV - Event ID | `event_id` |
| DLV - CTA ID | `cta_id` |
| DLV - Placement | `placement` |
| DLV - Section | `section` |
| DLV - Destination | `destination` |
| DLV - URL | `url` |
| DLV - Link Type | `link_type` |
| DLV - Variant | `variant` |
| DLV - Page Key | `page_key` |
| DLV - Page Type | `page_type` |
| DLV - FAQ ID | `faq_id` |
| DLV - FAQ Label | `faq_label` |
| DLV - Section Label | `section_label` |
| DLV - Scroll Percentage | `scroll_percentage` |
| DLV - Time Seconds | `time_seconds` |
| DLV - Link Domain | `link_domain` |

### 5.2 Triggers

#### Custom Event Triggers

| Trigger Name | Event Name | Conditions |
|--------------|------------|------------|
| CE - Store Outbound Click | `store_outbound_click` | — |
| CE - CTA Click | `cta_click` | — |
| CE - CTA Click - Download Intent | `cta_click` | DLV - URL contains `/download-mobile-app` |
| CE - View Section | `view_section` | — |
| CE - View Section - Value (Home) | `view_section` | DLV - Section matches RegEx `^home\.(features|app_showcase)$` |
| CE - View Section - Value (Download) | `view_section` | DLV - Section matches RegEx `^download\.(benefits|comparison)$` |
| CE - FAQ Open | `faq_open` | — |
| CE - Outbound Link | `outbound_link_click` | — |
| CE - Scroll Depth | `scroll_depth` | — |
| CE - Time on Page | `time_on_page` | — |

### 5.3 Tags

#### GA4 Event Tags

| Tag Name | Event Name | Parameters | Trigger |
|----------|------------|------------|---------|
| GA4 - Store Outbound Click | `store_outbound_click` | `event_id`, `cta_id`, `placement`, `section`, `destination`, `url`, `link_type`, `variant` | CE - Store Outbound Click |
| GA4 - CTA Click | `cta_click` | `event_id`, `cta_id`, `placement`, `section`, `url`, `link_type`, `variant` | CE - CTA Click |
| GA4 - View Section | `view_section` | `section`, `section_label` | CE - View Section |
| GA4 - FAQ Open | `faq_open` | `event_id`, `faq_id`, `faq_label`, `section` | CE - FAQ Open |
| GA4 - Outbound Link | `outbound_link_click` | `event_id`, `url`, `link_domain`, `link_type` | CE - Outbound Link |
| GA4 - Scroll Depth | `scroll_depth` | `scroll_percentage`, `page_key` | CE - Scroll Depth |
| GA4 - Time on Page | `time_on_page` | `time_seconds`, `page_key` | CE - Time on Page |

### 5.4 GA4 Custom Definitions

#### Custom Dimensions (Event-scoped)

| Dimension Name | Parameter Name |
|----------------|----------------|
| Event ID | `event_id` |
| CTA ID | `cta_id` |
| Placement | `placement` |
| Section | `section` |
| Destination | `destination` |
| Link Type | `link_type` |
| Variant | `variant` |
| Page Key | `page_key` |
| Page Type | `page_type` |
| FAQ ID | `faq_id` |
| FAQ Label | `faq_label` |
| Link Domain | `link_domain` |

#### Custom Metrics (Event-scoped)

| Metric Name | Parameter Name | Unit |
|-------------|----------------|------|
| Scroll Percentage | `scroll_percentage` | Standard |
| Time Seconds | `time_seconds` | Seconds |

---

## 6. Measurement & Reporting Plan

### 6.1 GA4 Funnel Explorations

#### Funnel A: Cross-Page Journey

**Name**: App Download Funnel - Cross Page

| Step | Event | Condition |
|------|-------|-----------|
| 1 | `page_view` | `page_key` IN (`home`, `vps_hosting`, `windows_vps`) |
| 2 | `view_section` | `section` IN (`home.features`, `home.app_showcase`) |
| 3 | `cta_click` | `url` contains `/download-mobile-app` |
| 4 | `store_outbound_click` | (any) |

#### Funnel B: Direct Lander Journey

**Name**: App Download Funnel - Direct Landers

| Step | Event | Condition |
|------|-------|-----------|
| 1 | `page_view` | `page_key` = `download_mobile_app` |
| 2 | `view_section` | `section` IN (`download.benefits`, `download.comparison`) |
| 3 | `store_outbound_click` | (any) |

**Breakdown Dimensions** (both funnels):
- Device category
- Source / Medium
- Country
- `destination` (app_store vs play_store)

### 6.2 CTA Performance Report (Leaderboard)

#### Metric Definitions

| Metric | Definition | Calculation |
|--------|------------|-------------|
| **Outbound Clicks** | Store clicks from this CTA | Count of `store_outbound_click` by `cta_id` |
| **Section Exposure** | Users who saw the CTA's section | Count of `view_section` by `section` |
| **Section→Store Rate** | Conversion from section view to store click | `store_outbound_click` / `view_section` for same `section` |
| **Page→Store Rate** | Conversion from page view to store click | `store_outbound_click` / `page_view` for same `page_key` |

**Primary KPI**: `store_outbound_click` per `view_section(section)` — this is the true "exposure to action" rate.

**Note**: "Click→Store rate" is tautological for store badges (click = store click). Focus on exposure-based rates.

#### Report Structure

| CTA ID | Section | Dest | Outbound Clicks | Section Views | Section→Store % | Page Views | Page→Store % |
|--------|---------|------|-----------------|---------------|-----------------|------------|--------------|
| `home.hero.appstore` | home.hero | app_store | 890 | 4,200 | 21.2% | 5,000 | 17.8% |
| `home.hero.playstore` | home.hero | play_store | 654 | 4,200 | 15.6% | 5,000 | 13.1% |
| `download.hero.appstore` | download.hero | app_store | 456 | 1,800 | 25.3% | 2,000 | 22.8% |
| `home.app_showcase.appstore` | home.app_showcase | app_store | 234 | 2,100 | 11.1% | 5,000 | 4.7% |

### 6.3 Diagnostic Reports

#### Scroll Depth by Page
- Dimensions: `page_key`, `scroll_percentage`
- Metric: Event count
- Use to identify pages where users don't scroll to value sections

#### Time on Page Distribution
- Dimensions: `page_key`, `time_seconds` bucket
- Metric: Event count
- Use to identify bounce patterns vs. engagement

#### Section Visibility Funnel
- Dimensions: `section` (ordered by page position)
- Metric: Event count
- Use to understand content consumption sequence and drop-off

### 6.4 Debug Checklist

#### GTM Preview Mode

| Action | Expected Event | Key Parameters |
|--------|----------------|----------------|
| Load home page | `page_view` | `page_key: home`, `page_type: landing` |
| Scroll to features section | `view_section` | `section: home.features` |
| Click App Store badge in hero | `store_outbound_click` | `destination: app_store`, `link_type: store`, `event_id: (present)` |
| Click Play Store badge in hero | `store_outbound_click` | `destination: play_store`, `link_type: store`, `event_id: (present)` |
| Click "Download App" in nav | `cta_click` | `link_type: internal`, `url: /download-mobile-app`, `event_id: (present)` |
| Expand FAQ item 1 | `faq_open` | `faq_id: home.faq.1`, `event_id: (present)` |
| Scroll to 50% | `scroll_depth` | `scroll_percentage: 50` |
| Wait 30 seconds | `time_on_page` | `time_seconds: 30` |

#### Verify NO Double Firing

| Action | Should Fire | Should NOT Fire |
|--------|-------------|-----------------|
| Click App Store link | `store_outbound_click` | `cta_click`, `outbound_link_click`, `download_app_cta` |
| Click internal CTA | `cta_click` | `outbound_link_click`, `store_outbound_click` |
| Click external link (non-store) | `outbound_link_click` | `store_outbound_click`, `cta_click` |

#### Verify event_id Uniqueness

- Rapid double-click on same CTA → Two events with different `event_id` values
- Click CTA, navigate, click another → Different `event_id` values

---

## 7. Acceptance Criteria

### 7.1 Definition of Done

| Criterion | Verification |
|-----------|--------------|
| `store_outbound_click` fires for ALL store badge clicks | GTM Preview on all placements |
| NO other events fire alongside `store_outbound_click` | GTM Preview event sequence |
| `destination` is always `app_store` or `play_store` (never unknown) | GA4 exploration filter |
| `section` uses canonical keys (e.g., `home.hero` not `home-hero`) | GA4 custom dimension report |
| `link_type` is always `store`, `internal`, or `external` | GA4 exploration |
| `event_id` is present and unique on all click events | GTM Preview |
| Both funnel explorations show data | GA4 Explore |
| `faq_question` parameter does NOT exist | GA4 custom dimensions list |
| Events fire reliably even when clicking `target="_blank"` links | Manual testing |
| Store link detection uses hostname parsing (not substring) | Code review |

### 7.2 Anti-Goals

| Anti-Goal | Prevention |
|-----------|------------|
| **No double firing** | Strict precedence rules in event delegation |
| **No scripted navigation** | Do not use `setTimeout` + `window.open()` for outbound |
| **No PII** | Never capture user-entered text |
| **No high-cardinality text** | Use `faq_id` + static `faq_label`, not question text |
| **No inconsistent section keys** | Single canonical namespace for visibility + click |
| **No OR-logic funnel gates** | Step 2 = `view_section` only, diagnostics are separate |
| **No substring URL matching** | Use hostname parsing for store detection |
| **No missing event IDs** | All click events get `event_id` |

### 7.3 Testing Matrix

| Scenario | Device | Expected Event | Verify |
|----------|--------|----------------|--------|
| Click App Store badge in hero | Desktop Chrome | `store_outbound_click` only | event_id present |
| Click Play Store badge in hero | Desktop Firefox | `store_outbound_click` only | event_id present |
| Click App Store badge in app-showcase | Mobile Safari | `store_outbound_click` only | event_id present |
| Click Play Store QR code link | Tablet Safari | `store_outbound_click` only | event_id present |
| Click "Download App" nav button | Desktop Edge | `cta_click` only | event_id present |
| Click external blog link | Desktop Chrome | `outbound_link_click` only | event_id present |
| Rapid double-click store badge | Desktop Chrome | 2 events | Different event_ids |

### 7.4 Rollout Checklist

- [ ] Update `analytics.js` with precedence rules
- [ ] Add `event_id` generation to all click events
- [ ] Update `isStoreLink()` to use hostname parsing
- [ ] Remove `download_app_cta` event entirely
- [ ] Update `outbound_link_click` to exclude store links
- [ ] Add missing data attributes to templates
- [ ] Standardize all section keys to canonical format
- [ ] Remove `home.blog` from section tracking (noise reduction)
- [ ] Create GTM variables, triggers, tags (include `event_id`)
- [ ] Register GA4 custom dimensions (include `event_id`, NOT `faq_question`)
- [ ] Test in GTM Preview (all scenarios + no double firing + event_id verification)
- [ ] Test in GA4 DebugView
- [ ] Publish GTM container
- [ ] Monitor real-time for 24 hours
- [ ] Create BOTH funnel explorations (cross-page + direct lander)
- [ ] Create CTA leaderboard with Section→Store rate
- [ ] Collect 2 weeks baseline data before setting targets

---

## Appendix A: Data Attribute Specification

### CTA Elements

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-gtm-id` | ✓ | Unique stable identifier. Format: `{page_key}.{section_suffix}.{element}` |
| `data-gtm-placement` | ✓ | UI location: `hero`, `nav`, `mid`, `footer` |
| `data-gtm-section` | ✓ | Canonical section key (must match `data-track-section`) |
| `data-gtm-destination` | For store links | `app_store` or `play_store` |

### Section Elements

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-track-section` | ✓ | Canonical section key for visibility tracking |
| `data-section-label` | ✗ | Human-readable label (optional) |

### FAQ Elements

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-gtm-id` | ✓ | Format: `{page_key}.faq.{index}` (e.g., `home.faq.1`) |
| `data-gtm-faq-label` | ✗ | Static short label: `getting_started`, `pricing`, `mobile_app`, etc. |

---

## Appendix B: Migration from Current Implementation

### Events to Remove
- `download_app_cta` — Replaced by `store_outbound_click`

### Events to Rename
- `section_view` → `view_section`
- `accordion_expand` → `faq_open`

### Parameters to Remove
- `faq_question` / `accordion_item` (was capturing question text)

### Parameters to Add
- `event_id` (on all click events)
- `link_type` (on all click events)
- `page_key` (on `page_view`, `scroll_depth`, `time_on_page`)
- `page_type` (on `page_view`)

### Section Key Mapping (Old → New)

| Old Key | New Canonical Key |
|---------|-------------------|
| `home-hero` | `home.hero` |
| `home-features` | `home.features` |
| `home-app-showcase` | `home.app_showcase` |
| `home-blog-highlights` | *(removed from tracking)* |
| `home-faq` | `home.faq` |
| `cta` | `home.cta` |

### FAQ ID Format

**Locked format**: `{page_key}.faq.{index}`

Examples:
- `home.faq.1`
- `home.faq.2`
- `download.faq.1`
- `download.faq.3`

---

## Appendix C: Helper Functions Reference

```javascript
// Store link detection (by hostname, not substring)
function isStoreLink(href) {
  try {
    const url = new URL(href);
    const storeHosts = ['apps.apple.com', 'itunes.apple.com', 'play.google.com'];
    return storeHosts.includes(url.hostname);
  } catch {
    return false;
  }
}

// Derive destination from store URL
function deriveDestination(href) {
  try {
    const url = new URL(href);
    if (url.hostname.includes('apple.com')) return 'app_store';
    if (url.hostname.includes('play.google.com')) return 'play_store';
    return 'unknown';
  } catch {
    return 'unknown';
  }
}

// Internal link check
function isInternalLink(href) {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    return href.startsWith('/');
  }
}

// Generate unique event ID for de-duplication
function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

// Sanitize internal URL (remove query params except UTM)
function sanitizeUrl(href) {
  try {
    const url = new URL(href, window.location.origin);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    const newParams = new URLSearchParams();
    
    for (const param of utmParams) {
      if (url.searchParams.has(param)) {
        newParams.set(param, url.searchParams.get(param));
      }
    }
    
    return url.pathname + (newParams.toString() ? '?' + newParams.toString() : '');
  } catch {
    return href;
  }
}

// Get current A/B test variant (default to control)
function getVariant() {
  // Implement based on your A/B testing setup
  // Example: return window.abTestVariant || 'control';
  return 'control';
}
```

---

*End of Document*
