/**
 * Analytics Compatibility Layer
 * 
 * Preserves ALL existing GTM tracking during migration.
 * Matches the event structure from lib/analytics.ts (Next.js version).
 * 
 * This ensures zero analytics data loss during migration.
 * 
 * Event Categories:
 * - Conversion events (start_checkout, download_app_cta, form_submit)
 * - Navigation events (nav_click, nav_dropdown_open, nav_mobile_toggle)
 * - Engagement events (scroll_depth, time_on_page, section_view)
 * - UI events (accordion_expand, modal_open, modal_close)
 * - CTA events (cta_click, copy_to_clipboard)
 */

// Initialize dataLayer
window.dataLayer = window.dataLayer || [];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get page category based on URL path
 */
function getPageCategory() {
  const path = window.location.pathname;
  
  if (path === '/') return 'marketing';
  if (path === '/blog') return 'blog';
  if (path.startsWith('/blog/')) return 'blog-post';
  if (path.includes('vps') || path.includes('dedicated')) return 'product';
  if (path === '/contact') return 'support';
  if (path.includes('privacy') || path.includes('terms') || path.includes('sla')) return 'legal';
  if (path === '/download-mobile-app') return 'marketing';
  
  return 'other';
}

/**
 * Get device type based on screen width
 */
function getDeviceType() {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get UTM parameters from URL
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
 * Store UTM parameters in session storage for later use
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
 * Track an event to GTM dataLayer
 * Matches the signature from lib/analytics.ts
 */
function trackEvent(event, params = {}) {
  const baseParams = {
    // Page context
    page_path: window.location.pathname,
    page_title: document.title,
    page_category: getPageCategory(),
    page_referrer: document.referrer || null,
    
    // Device info
    device_type: getDeviceType(),
    screen_width: window.innerWidth,
    screen_height: window.innerHeight,
    
    // Timestamp
    event_timestamp: new Date().toISOString(),
    
    // UTM parameters (current or stored)
    ...getUTMParams(),
    ...getStoredAttribution(),
  };
  
  const payload = {
    event,
    ...baseParams,
    ...params,
  };
  
  window.dataLayer.push(payload);
  
  // Debug logging in development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('[Analytics]', event, params);
  }
}

// ============================================================================
// AUTO-TRACKING: PAGE VIEW
// ============================================================================

// Track page view on load
trackEvent('page_view', {
  page_type: getPageCategory(),
});

// Store attribution on first visit
storeAttribution();

// ============================================================================
// AUTO-TRACKING: CLICKS (data-gtm-id)
// ============================================================================

document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-gtm-id]');
  if (!target) return;
  
  const gtmId = target.dataset.gtmId;
  const parts = gtmId.split('.');
  
  // Parse GTM ID format: "page.section.action.label" or "section.action.label"
  let page, section, action, label;
  if (parts.length === 4) {
    [page, section, action, label] = parts;
  } else if (parts.length === 3) {
    [section, action, label] = parts;
    page = getPageCategory();
  } else {
    // Fallback
    section = parts[0] || 'unknown';
    action = parts[1] || 'click';
    label = parts[2] || '';
  }
  
  // Map to appropriate event type based on GTM ID patterns
  
  // Conversion: Deploy buttons
  if (action === 'deploy' || gtmId.includes('.deploy.')) {
    trackEvent('start_checkout', {
      button_id: gtmId,
      plan: target.dataset.gtmPlan || null,
      price: target.dataset.gtmPrice || null,
      location: section,
    });
    return;
  }
  
  // Conversion: App store buttons
  if (gtmId.includes('.appstore.') || gtmId.includes('.googleplay.') || 
      gtmId.includes('download-app') || gtmId.includes('download_app')) {
    trackEvent('download_app_cta', {
      button_id: gtmId,
      platform: gtmId.includes('appstore') ? 'ios' : 
                gtmId.includes('googleplay') ? 'android' : 'unknown',
      location: section,
    });
    return;
  }
  
  // Navigation: Desktop nav
  if (gtmId.includes('.nav.') && gtmId.includes('.link.')) {
    trackEvent('nav_click', {
      nav_type: 'desktop',
      nav_label: label,
      nav_href: target.href || target.closest('a')?.href,
    });
    return;
  }
  
  // Navigation: Mobile nav
  if (gtmId.includes('.mobile.') && !gtmId.includes('.menu.toggle')) {
    trackEvent('nav_click', {
      nav_type: 'mobile',
      nav_label: label,
      nav_href: target.href || target.closest('a')?.href,
    });
    return;
  }
  
  // Navigation: Mobile menu toggle
  if (gtmId.includes('.menu.toggle')) {
    trackEvent('nav_mobile_toggle', {
      action: document.querySelector('[x-data]')?.__x?.$data?.mobileOpen ? 'close' : 'open',
    });
    return;
  }
  
  // Navigation: Dropdown
  if (gtmId.includes('.dropdown.')) {
    trackEvent('nav_dropdown_open', {
      dropdown_label: section,
    });
    return;
  }
  
  // CTA buttons
  if (gtmId.includes('.cta.')) {
    trackEvent('cta_click', {
      cta_label: label,
      cta_location: section,
      cta_destination: target.href || target.closest('a')?.href,
      cta_variant: target.dataset.gtmVariant || 'default',
    });
    return;
  }
  
  // FAQ accordion
  if (gtmId.includes('.faq.') || gtmId.includes('faq.item')) {
    trackEvent('accordion_expand', {
      accordion_id: gtmId,
      accordion_item: label || target.textContent?.slice(0, 50),
    });
    return;
  }
  
  // Form submit
  if (gtmId.includes('.form.submit')) {
    trackEvent('form_submit', {
      form_id: section,
      form_type: target.dataset.gtmForm || 'unknown',
    });
    return;
  }
  
  // Email click
  if (gtmId.includes('.email.')) {
    trackEvent('email_click', {
      email_address: target.href?.replace('mailto:', '') || null,
      location: section,
    });
    return;
  }
  
  // Generic UI interaction (fallback)
  trackEvent('ui_interaction', {
    element_id: gtmId,
    element_type: target.tagName.toLowerCase(),
    element_text: target.textContent?.slice(0, 50),
  });
});

// ============================================================================
// AUTO-TRACKING: SCROLL DEPTH
// ============================================================================

let scrollMilestones = [25, 50, 75, 100];
let scrollTracked = new Set();

function trackScrollDepth() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = Math.round((scrollTop / docHeight) * 100);
  
  scrollMilestones.forEach(milestone => {
    if (scrollPercent >= milestone && !scrollTracked.has(milestone)) {
      scrollTracked.add(milestone);
      trackEvent('scroll_depth', {
        scroll_percentage: milestone,
        scroll_direction: 'down',
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
// AUTO-TRACKING: SECTION VIEWS
// ============================================================================

function setupSectionTracking() {
  const sections = document.querySelectorAll('[data-track-section]');
  
  if (sections.length === 0) return;
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const section = entry.target;
          trackEvent('section_view', {
            section_id: section.dataset.trackSection,
            section_name: section.dataset.trackSectionName || section.dataset.trackSection,
            section_index: section.dataset.trackSectionIndex || null,
          });
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.5 }
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
// AUTO-TRACKING: TIME ON PAGE
// ============================================================================

const timeIntervals = [30, 60, 120, 300]; // seconds
let timeOnPage = 0;
let timeTracked = new Set();

setInterval(() => {
  timeOnPage += 10;
  
  timeIntervals.forEach(interval => {
    if (timeOnPage >= interval && !timeTracked.has(interval)) {
      timeTracked.add(interval);
      trackEvent('time_on_page', {
        time_seconds: interval,
        time_bucket: interval <= 30 ? '30s' : 
                     interval <= 60 ? '60s' :
                     interval <= 120 ? '120s' : '300s',
      });
    }
  });
}, 10000); // Check every 10 seconds

// ============================================================================
// OUTBOUND LINK TRACKING
// ============================================================================

document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  
  const href = link.href;
  const isExternal = href && !href.startsWith(window.location.origin) && !href.startsWith('/');
  
  if (isExternal && !link.dataset.gtmId) {
    // Track outbound link if not already tracked via data-gtm-id
    trackEvent('outbound_link_click', {
      link_url: href,
      link_text: link.textContent?.slice(0, 50),
      link_domain: new URL(href).hostname,
    });
  }
});

// ============================================================================
// CONVENIENCE FUNCTIONS (for manual tracking)
// ============================================================================

/**
 * Track CTA click manually
 */
function trackCTAClick(label, location, destination) {
  trackEvent('cta_click', {
    cta_label: label,
    cta_location: location,
    cta_destination: destination,
  });
}

/**
 * Track form submission manually
 */
function trackFormSubmit(formId, formType, success = true, errorMessage = null) {
  if (success) {
    trackEvent('form_submit', {
      form_id: formId,
      form_type: formType,
    });
  } else {
    trackEvent('form_submit_failed', {
      form_id: formId,
      form_type: formType,
      error_message: errorMessage,
    });
  }
}

/**
 * Track modal open/close
 */
function trackModalOpen(modalId, modalTitle, trigger) {
  trackEvent('modal_open', {
    modal_id: modalId,
    modal_title: modalTitle,
    trigger_type: trigger,
  });
}

function trackModalClose(modalId, modalTitle, method) {
  trackEvent('modal_close', {
    modal_id: modalId,
    modal_title: modalTitle,
    close_method: method,
  });
}

/**
 * Track blog-related events
 */
function trackBlogSearch(query, resultsCount) {
  trackEvent('blog_search', {
    search_query: query,
    results_count: resultsCount,
  });
}

function trackBlogCardClick(postSlug, postTitle, category) {
  trackEvent('blog_card_click', {
    post_slug: postSlug,
    post_title: postTitle,
    post_category: category,
  });
}

// Export for manual use
window.trackEvent = trackEvent;
window.trackCTAClick = trackCTAClick;
window.trackFormSubmit = trackFormSubmit;
window.trackModalOpen = trackModalOpen;
window.trackModalClose = trackModalClose;
window.trackBlogSearch = trackBlogSearch;
window.trackBlogCardClick = trackBlogCardClick;

