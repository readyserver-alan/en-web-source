/**
 * Alpine.js Application Setup
 * 
 * Custom directives and utilities for the Ready Server static site.
 * Replaces Framer Motion animations with CSS + Intersection Observer.
 * 
 * Features:
 * - x-animate directive for scroll-triggered animations
 * - Theme store integration
 * - Utility functions
 */

// ============================================================================
// ALPINE.JS INITIALIZATION
// ============================================================================

document.addEventListener('alpine:init', () => {
  
  // --------------------------------------------------------------------------
  // x-animate Directive
  // Triggers CSS animations when element enters viewport
  // 
  // Usage:
  //   <div x-animate class="opacity-0 animate-fade-up">Content</div>
  //   <div x-animate.once class="opacity-0 animate-slide-in-left">Once only</div>
  //   <div x-animate.stagger class="stagger-children">...</div>
  // --------------------------------------------------------------------------
  
  Alpine.directive('animate', (el, { modifiers }, { cleanup }) => {
    const once = modifiers.includes('once') || true; // Default to once
    const threshold = modifiers.includes('half') ? 0.5 : 0.1;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add 'animate' class for stagger-children
            if (el.classList.contains('stagger-children')) {
              el.classList.add('animate');
            }
            
            // Trigger CSS animations by removing opacity-0
            // The animation classes (animate-fade-up, etc.) will handle the rest
            el.style.visibility = 'visible';
            el.classList.remove('opacity-0');
            
            // Unobserve if only animating once
            if (once) {
              observer.unobserve(el);
            }
          } else if (!once) {
            // Reset for re-animation if not using 'once'
            el.classList.remove('animate');
            el.classList.add('opacity-0');
          }
        });
      },
      { 
        threshold,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is in view
      }
    );
    
    // Initially hide element (will be shown by animation)
    if (!el.classList.contains('stagger-children')) {
      el.style.visibility = 'hidden';
    }
    
    observer.observe(el);
    
    cleanup(() => {
      observer.disconnect();
    });
  });
  
  // --------------------------------------------------------------------------
  // Theme Store
  // Manages dark/light mode state
  // --------------------------------------------------------------------------
  
  Alpine.store('theme', {
    dark: false,
    
    init() {
      // Check localStorage first, then system preference
      const stored = localStorage.getItem('theme');
      if (stored) {
        this.dark = stored === 'dark';
      } else {
        this.dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      
      // Apply theme class immediately
      this.applyTheme();
      
      // Listen for system preference changes
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
          this.dark = e.matches;
          this.applyTheme();
        }
      });
    },
    
    toggle() {
      this.dark = !this.dark;
      localStorage.setItem('theme', this.dark ? 'dark' : 'light');
      this.applyTheme();
    },
    
    applyTheme() {
      if (this.dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  });
  
  // Initialize theme store
  Alpine.store('theme').init();
  
  // --------------------------------------------------------------------------
  // Mobile Menu Store
  // Manages mobile navigation state
  // --------------------------------------------------------------------------
  
  Alpine.store('mobileMenu', {
    open: false,
    dropdownOpen: false,
    
    toggle() {
      this.open = !this.open;
      
      // Prevent body scroll when menu is open
      if (this.open) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.dropdownOpen = false;
      }
    },
    
    close() {
      this.open = false;
      this.dropdownOpen = false;
      document.body.style.overflow = '';
    }
  });
  
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Debounce function for performance-sensitive operations
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Check if element is in viewport
 */
function isInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Smooth scroll to element
 */
function scrollToElement(selector) {
  const element = document.querySelector(selector);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ============================================================================
// SCROLL PROGRESS (Optional - for progress indicators)
// ============================================================================

let scrollProgressEl = null;

function updateScrollProgress() {
  if (!scrollProgressEl) {
    scrollProgressEl = document.querySelector('[data-scroll-progress]');
  }
  
  if (scrollProgressEl) {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / windowHeight) * 100;
    scrollProgressEl.style.width = `${scrolled}%`;
  }
}

// Attach scroll progress listener if element exists
if (document.querySelector('[data-scroll-progress]')) {
  window.addEventListener('scroll', debounce(updateScrollProgress, 10), { passive: true });
}

// ============================================================================
// KEYBOARD NAVIGATION SUPPORT
// ============================================================================

// Close modals/menus on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close mobile menu if open
    if (Alpine.store('mobileMenu')?.open) {
      Alpine.store('mobileMenu').close();
    }
    
    // Dispatch custom event for modals
    document.dispatchEvent(new CustomEvent('escape-pressed'));
  }
});

// ============================================================================
// FOCUS TRAP UTILITY (for modals)
// ============================================================================

/**
 * Create a focus trap within an element
 * Usage: const trap = createFocusTrap(modalElement); trap.activate();
 */
function createFocusTrap(element) {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ];
  
  let firstFocusable = null;
  let lastFocusable = null;
  let previouslyFocused = null;
  
  function getFocusableElements() {
    return element.querySelectorAll(focusableSelectors.join(', '));
  }
  
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;
    
    const focusables = getFocusableElements();
    firstFocusable = focusables[0];
    lastFocusable = focusables[focusables.length - 1];
    
    if (e.shiftKey && document.activeElement === firstFocusable) {
      e.preventDefault();
      lastFocusable?.focus();
    } else if (!e.shiftKey && document.activeElement === lastFocusable) {
      e.preventDefault();
      firstFocusable?.focus();
    }
  }
  
  return {
    activate() {
      previouslyFocused = document.activeElement;
      element.addEventListener('keydown', handleKeyDown);
      
      // Focus first focusable element
      const focusables = getFocusableElements();
      if (focusables.length) {
        focusables[0].focus();
      }
    },
    
    deactivate() {
      element.removeEventListener('keydown', handleKeyDown);
      
      // Return focus to previously focused element
      if (previouslyFocused && previouslyFocused.focus) {
        previouslyFocused.focus();
      }
    }
  };
}

// Export for use in other scripts
window.createFocusTrap = createFocusTrap;
window.scrollToElement = scrollToElement;
window.debounce = debounce;

