/**
 * Analytics Tracking System v1.2
 * 
 * Implements the GTM/GA4 tracking plan for ReadyServer mobile app download optimization.
 * Core KPI: Mobile App Downloads (Store Outbound Clicks)
 * 
 * Event Categories:
 * - Conversion: store_outbound_click (PRIMARY)
 * - Navigation: cta_click (internal links)
 * - Engagement: view_section, scroll_depth, time_on_page
 * - UI: faq_open, outbound_link_click
 * 
 * Key Implementation Details:
 * - Strict event precedence to prevent double firing
 * - Store link detection by hostname (not substring)
 * - event_id on all click events for de-duplication
 * - Canonical section keys for consistency
 */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Page key mapping for funnel tracking
 * Used in page_view, scroll_depth, and time_on_page events
 * Note: Dedicated Servers removed - now redirects to external dedicated-server.readyserver.sg
 */
const PAGE_KEY_MAP = {
  '/': 'home',
  '/download-mobile-app': 'download_mobile_app',
  '/vps-hosting': 'vps_hosting',
  '/windows-vps': 'windows_vps',
  // '/dedicated-servers': 'dedicated_servers',  // Removed - external link
  '/contact': 'contact',
  '/blog': 'blog',
  '/brand-guidelines': 'brand_guidelines',
  '/privacy-policy': 'privacy_policy',
  '/terms-of-service': 'terms_of_service',
  '/sla': 'sla',
};

/**
 * Page type mapping
 * Note: Dedicated Servers removed - now redirects to external dedicated-server.readyserver.sg
 */
const PAGE_TYPE_MAP = {
  '/': 'landing',
  '/download-mobile-app': 'landing',
  '/vps-hosting': 'product',
  '/windows-vps': 'product',
  // '/dedicated-servers': 'product',  // Removed - external link
  '/contact': 'support',
  '/blog': 'blog',
  '/brand-guidelines': 'other',
  '/privacy-policy': 'legal',
  '/terms-of-service': 'legal',
  '/sla': 'legal',
};

/**
 * Store hostnames for detection
 */
const STORE_HOSTS = [
  'apps.apple.com',
  'itunes.apple.com',
  'play.google.com'
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get page key from current URL path
 * @returns {string} Stable page identifier
 */
function getPageKey() {
  const path = window.location.pathname;
  
  // Exact match first
  if (PAGE_KEY_MAP[path]) {
    return PAGE_KEY_MAP[path];
  }
  
  // Blog post pattern
  if (path.startsWith('/blog/') && path.length > 6) {
    return 'blog_post';
  }
  
  return 'other';
}

/**
 * Get page type from current URL path
 * @returns {string} Page category
 */
function getPageType() {
  const path = window.location.pathname;
  
  // Exact match first
  if (PAGE_TYPE_MAP[path]) {
    return PAGE_TYPE_MAP[path];
  }
  
  // Blog post pattern
  if (path.startsWith('/blog/')) {
    return 'blog';
  }
  
  return 'other';
}

/**
 * Check if URL is a store link (by hostname, NOT substring)
 * @param {string} href - The URL to check
 * @returns {boolean}
 */
function isStoreLink(href) {
  try {
    const url = new URL(href);
    return STORE_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Derive store destination from URL
 * @param {string} href - Store URL
 * @returns {string} 'app_store' | 'play_store' | 'unknown'
 */
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

/**
 * Check if URL is internal (same origin)
 * @param {string} href - The URL to check
 * @returns {boolean}
 */
function isInternalLink(href) {
  try {
    const url = new URL(href, window.location.origin);
    return url.origin === window.location.origin;
  } catch {
    // Relative URLs are internal
    return href.startsWith('/') || href.startsWith('#');
  }
}

/**
 * Generate unique event ID for de-duplication
 * Format: timestamp_randomstring
 * @returns {string}
 */
function generateEventId() {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Sanitize internal URL (keep only path and UTM params)
 * @param {string} href - URL to sanitize
 * @returns {string}
 */
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

/**
 * Get current A/B test variant
 * @returns {string} Variant identifier, defaults to 'control'
 */
function getVariant() {
  // Implement based on your A/B testing setup
  // Example: return window.abTestVariant || sessionStorage.getItem('ab_variant') || 'control';
  return 'control';
}

/**
 * Get device type based on screen width
 * @returns {string} 'mobile' | 'tablet' | 'desktop'
 */
function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get UTM parameters from URL
 * @returns {Object}
 */
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    gclid: params.get('gclid'),
    fbclid: params.get('fbclid'),
  };
}

/**
 * Store UTM parameters in session storage for attribution
 */
function storeAttribution() {
  const utms = getUTMParams();
  const hasUtms = Object.values(utms).some(v => v !== null);
  
  if (hasUtms) {
    sessionStorage.setItem('traffic_attribution', JSON.stringify({
      ...utms,
      landing_page: window.location.pathname,
      referrer: document.referrer,
      timestamp: new Date().toISOString(),
    }));
  }
}

/**
 * Get stored attribution data
 * @returns {Object}
 */
function getStoredAttribution() {
  try {
    const stored = sessionStorage.getItem('traffic_attribution');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// ============================================================================
// CORE TRACKING FUNCTION
// ============================================================================

/**
 * Push event to GTM dataLayer
 * @param {string} event - Event name
 * @param {Object} params - Event parameters
 */
function trackEvent(event, params = {}) {
  const baseParams = {
    // Page context
    page_path: window.location.pathname,
    page_key: getPageKey(),
    page_type: getPageType(),
    
    // Device info
    device_type: getDeviceType(),
    
    // Timestamp
    event_timestamp: new Date().toISOString(),
  };
  
  const payload = {
    event,
    ...baseParams,
    ...params,
  };
  
  window.dataLayer.push(payload);
  
  // Debug logging in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[Analytics]', event, payload);
  }
}

// ============================================================================
// PAGE VIEW TRACKING
// ============================================================================

// Track page view on load with page_key and page_type
trackEvent('page_view', {
  page_key: getPageKey(),
  page_type: getPageType(),
  page_referrer: document.referrer || null,
});

// Store attribution on first visit
storeAttribution();

// ============================================================================
// CLICK EVENT TRACKING (with strict precedence rules)
// ============================================================================

document.addEventListener('click', (e) => {
  // Find the closest element with data-gtm-id
  const target = e.target.closest('[data-gtm-id]');
  if (!target) return;
  
  // Use getAttribute for robustness (handles nested SVG clicks, etc.)
  const gtmId = target.getAttribute('data-gtm-id');
  if (!gtmId) return;
  
  const placement = target.getAttribute('data-gtm-placement') || 'unknown';
  const section = target.getAttribute('data-gtm-section') || 'unknown';
  const destination = target.getAttribute('data-gtm-destination');
  const faqLabel = target.getAttribute('data-gtm-faq-label');
  
  // Get href from the element or closest anchor
  const linkElement = target.tagName === 'A' ? target : target.closest('a');
  const href = linkElement?.href;
  
  // Generate unique event ID for de-duplication
  const eventId = generateEventId();
  
  // =========================================================================
  // PRECEDENCE RULE 1: Store links (App Store / Play Store)
  // Fire ONLY store_outbound_click, nothing else
  // =========================================================================
  if (href && isStoreLink(href)) {
    trackEvent('store_outbound_click', {
      event_id: eventId,
      cta_id: gtmId,
      placement: placement,
      section: section,
      destination: destination || deriveDestination(href),
      url: href,
      link_type: 'store',
      variant: getVariant(),
    });
    return; // STOP - do not fire other events
  }
  
  // =========================================================================
  // PRECEDENCE RULE 2: Internal links
  // Fire ONLY cta_click
  // =========================================================================
  if (href && isInternalLink(href)) {
    trackEvent('cta_click', {
      event_id: eventId,
      cta_id: gtmId,
      placement: placement,
      section: section,
      url: sanitizeUrl(href),
      link_type: 'internal',
      variant: getVariant(),
    });
    return; // STOP
  }
  
  // =========================================================================
  // PRECEDENCE RULE 3: External links (non-store)
  // Fire ONLY outbound_link_click
  // =========================================================================
  if (href && !isInternalLink(href)) {
    try {
      trackEvent('outbound_link_click', {
        event_id: eventId,
        url: href,
        link_domain: new URL(href).hostname,
        link_type: 'external',
      });
    } catch {
      // Invalid URL, skip
    }
    return; // STOP
  }
  
  // =========================================================================
  // PRECEDENCE RULE 4: FAQ toggles (non-link interactions)
  // Fire ONLY faq_open
  // =========================================================================
  if (gtmId.includes('.faq.')) {
    trackEvent('faq_open', {
      event_id: eventId,
      faq_id: gtmId,
      faq_label: faqLabel || null,
      section: section,
    });
    return; // STOP
  }
  
  // =========================================================================
  // PRECEDENCE RULE 5: Form submissions
  // =========================================================================
  if (gtmId.includes('.form.submit') || gtmId.includes('.form.')) {
    trackEvent('form_submit', {
      event_id: eventId,
      form_id: gtmId,
      section: section,
    });
    return; // STOP
  }
  
  // =========================================================================
  // Fallback: Generic UI interaction (for debugging unexpected clicks)
  // =========================================================================
  trackEvent('ui_interaction', {
    event_id: eventId,
    element_id: gtmId,
    element_type: target.tagName.toLowerCase(),
  });
});

// ============================================================================
// OUTBOUND LINK TRACKING (for links without data-gtm-id)
// Excludes store links to prevent double-tracking
// ============================================================================

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  
  // Skip if already tracked via data-gtm-id
  if (link.closest('[data-gtm-id]')) return;
  
  const href = link.href;
  
  // Skip internal links
  if (isInternalLink(href)) return;
  
  // Skip store links (they should have data-gtm-id)
  if (isStoreLink(href)) return;
  
  // Track generic outbound link
  try {
    trackEvent('outbound_link_click', {
      event_id: generateEventId(),
      url: href,
      link_domain: new URL(href).hostname,
      link_type: 'external',
    });
  } catch {
    // Invalid URL, skip
  }
});

// ============================================================================
// SECTION VIEW TRACKING
// Uses 35% threshold for better hero section tracking on mobile
// ============================================================================

function setupSectionTracking() {
  const sections = document.querySelectorAll('[data-track-section]');
  
  if (sections.length === 0) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          const sectionKey = section.getAttribute('data-track-section');
          const sectionLabel = section.getAttribute('data-section-label');
          
          trackEvent('view_section', {
            section: sectionKey,
            section_label: sectionLabel || null,
          });
          
          // Unobserve after first view (fire once per page load)
          observer.unobserve(section);
        }
      });
    },
    { 
      threshold: 0.35,  // 35% visibility threshold
      rootMargin: '0px'
    }
  );
  
  sections.forEach(section => observer.observe(section));
}

// Initialize section tracking after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupSectionTracking);
} else {
  setupSectionTracking();
}

// ============================================================================
// SCROLL DEPTH TRACKING (diagnostic, not funnel gate)
// ============================================================================

const scrollMilestones = [25, 50, 75, 100];
const scrollTracked = new Set();

function trackScrollDepth() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  
  if (docHeight <= 0) return;
  
  const scrollPercent = Math.round((scrollTop / docHeight) * 100);
  
  scrollMilestones.forEach(milestone => {
    if (scrollPercent >= milestone && !scrollTracked.has(milestone)) {
      scrollTracked.add(milestone);
      trackEvent('scroll_depth', {
        scroll_percentage: milestone,
        page_key: getPageKey(),
      });
    }
  });
}

// Throttled scroll listener
let scrollTimeout;
window.addEventListener('scroll', () => {
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => {
    trackScrollDepth();
    scrollTimeout = null;
  }, 100);
}, { passive: true });

// ============================================================================
// TIME ON PAGE TRACKING (diagnostic, not funnel gate)
// ============================================================================

const timeIntervals = [30, 60, 120, 300]; // seconds
let timeOnPage = 0;
const timeTracked = new Set();

setInterval(() => {
  timeOnPage += 10;
  
  timeIntervals.forEach(interval => {
    if (timeOnPage >= interval && !timeTracked.has(interval)) {
      timeTracked.add(interval);
      trackEvent('time_on_page', {
        time_seconds: interval,
        page_key: getPageKey(),
      });
    }
  });
}, 10000); // Check every 10 seconds

// ============================================================================
// CONVENIENCE FUNCTIONS (for manual tracking if needed)
// ============================================================================

/**
 * Manually track a store outbound click
 * Use this if you need to track programmatic store link clicks
 */
function trackStoreClick(ctaId, placement, section, destination, url) {
  trackEvent('store_outbound_click', {
    event_id: generateEventId(),
    cta_id: ctaId,
    placement: placement,
    section: section,
    destination: destination,
    url: url,
    link_type: 'store',
    variant: getVariant(),
  });
}

/**
 * Manually track an internal CTA click
 */
function trackCTAClick(ctaId, placement, section, url) {
  trackEvent('cta_click', {
    event_id: generateEventId(),
    cta_id: ctaId,
    placement: placement,
    section: section,
    url: sanitizeUrl(url),
    link_type: 'internal',
    variant: getVariant(),
  });
}

/**
 * Manually track form submission
 */
function trackFormSubmit(formId, success = true, errorMessage = null) {
  if (success) {
    trackEvent('form_submit', {
      event_id: generateEventId(),
      form_id: formId,
    });
  } else {
    trackEvent('form_submit_failed', {
      event_id: generateEventId(),
      form_id: formId,
      error_message: errorMessage,
    });
  }
}

// Export for manual use
window.trackEvent = trackEvent;
window.trackStoreClick = trackStoreClick;
window.trackCTAClick = trackCTAClick;
window.trackFormSubmit = trackFormSubmit;
window.generateEventId = generateEventId;
