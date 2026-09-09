/**
 * Slate portal application — the single script loaded by Slate.
 * Sections: shared dependencies → navigation → application startup.
 * Add each future feature as an initFeature() function and register it in initApp().
 * Document its purpose, required markup, event handlers, and focus/state effects.
 * Keep feature state private and return early when its markup is absent.
 */
(() => {
  'use strict';

  // 1. SHARED DEPENDENCIES
  const dependencyUrls = [
    'https://global-packages.cdn.northeastern.edu/global-elements/dist/js/index.umd.js',
    'https://global-packages.cdn.northeastern.edu/kernl-ui/dist/js/index.umd.js',
  ];

  /** Load an existing Northeastern library once; report network failures to the caller. */
  function loadScript(url) {
    if (Array.from(document.scripts).some((script) => script.src === url)) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', () => reject(new Error(`Could not load ${url}`)), { once: true });
      document.head.append(script);
    });
  }

  /** Preserve library order; a failed external library must not disable local navigation. */
  async function initGlobalLibraries() {
    for (const url of dependencyUrls) {
      try {
        await loadScript(url);
      } catch (error) {
        console.error('[Slate app]', error);
      }
    }
  }

  // 2. NAVIGATION
  /** Initialize the header once, only when its toggle, account menu, and Back control exist. */
  function initNavigation() {
    const toggle = document.querySelector('.nav-toggle');
    const navigation = document.getElementById('primary-navigation');
    if (!toggle || !navigation || navigation.dataset.appInitialized === 'true') return;

    const mobile = window.matchMedia('(max-width: 1024px)');

    const account = navigation.querySelector('.account-menu');
    const summary = account?.querySelector('summary');
    const back = account?.querySelector('.nav-back');
    if (!account || !summary || !back) return;
    const panel = navigation.closest('header[role="banner"]');
    if (!panel) return;
    navigation.dataset.appInitialized = 'true';
    let overlayState = null;

    /** Isolate the full-screen menu and preserve page scrolling and existing inert states. */
    function setOverlay(active) {
      panel.classList.toggle('mobile-menu-open', active);
      if (active && !overlayState) {
        overlayState = {
          overflow: [document.documentElement, document.body].map((element) => ({
            element, value: element.style.getPropertyValue('overflow'),
            priority: element.style.getPropertyPriority('overflow'),
          })),
          siblings: [],
        };
        for (let branch = panel; branch.parentElement; branch = branch.parentElement) {
          for (const sibling of branch.parentElement.children) {
            if (sibling !== branch) {
              overlayState.siblings.push({ element: sibling, inert: sibling.inert });
              sibling.inert = true;
            }
          }
          if (branch.parentElement === document.body) break;
        }
        overlayState.overflow.forEach(({ element }) => element.style.setProperty('overflow', 'hidden'));
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
        panel.setAttribute('aria-label', 'Navigation');
      } else if (!active && overlayState) {
        overlayState.siblings.forEach(({ element, inert }) => { element.inert = inert; });
        overlayState.overflow.forEach(({ element, value, priority }) => {
          if (value) element.style.setProperty('overflow', value, priority);
          else element.style.removeProperty('overflow');
        });
        panel.setAttribute('role', 'banner');
        panel.removeAttribute('aria-modal');
        panel.removeAttribute('aria-label');
        overlayState = null;
      }
    }

    /** Keep Tab inside the visible full-screen controls; Escape also works on the close button. */
    function handlePanelKeydown(event) {
      if (!overlayState || event.key !== 'Tab') return;
      const controls = Array.from(panel.querySelectorAll('a[href], button, summary, [tabindex="0"]'))
        .filter((element) => !element.disabled && element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    /** Return to the top-level menu and close the account disclosure. */
    function resetSubmenu() {
      navigation.classList.remove('submenu-active');
      account.open = false;
    }

    /** Open the separate account view on mobile; retain native details on desktop. */
    function handleAccountClick(event) {
      if (!mobile.matches) return;
      event.preventDefault();
      account.open = true;
      navigation.classList.add('submenu-active');
      back.focus();
    }

    /** Back returns keyboard focus to the parent menu item. */
    function handleBackClick() {
      resetSubmenu();
      summary.focus();
    }

    /** Synchronize menu visibility, accessible state, and toggle label. */
    function setOpen(open) {
      if (!open) resetSubmenu();
      navigation.hidden = mobile.matches && !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      setOverlay(mobile.matches && open);
    }

    /** Reset menus at the breakpoint and move focus out of newly hidden controls. */
    function syncLayout() {
      const focused = document.activeElement;
      resetSubmenu();
      toggle.hidden = !mobile.matches;
      setOpen(!mobile.matches);
      if (mobile.matches && navigation.contains(focused)) toggle.focus();
      if (!mobile.matches && focused === toggle) navigation.querySelector('a').focus();
    }

    /** Toggle the mobile navigation without animation. */
    function handleToggleClick() {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    }

    /** Escape goes back one menu level and restores focus. */
    function handleKeydown(event) {
      if (event.key === 'Escape' && !mobile.matches && account.open) {
        event.preventDefault();
        resetSubmenu();
        summary.focus();
      } else if (event.key === 'Escape' && mobile.matches) {
        event.preventDefault();
        if (navigation.classList.contains('submenu-active')) {
          resetSubmenu();
          summary.focus();
        } else {
          setOpen(false);
          toggle.focus();
        }
      }
    }

    /** Close mobile navigation after a destination link is activated. */
    function handleNavigationClick(event) {
      if (mobile.matches && event.target.closest('a')) {
        setOpen(false);
        toggle.focus();
      }
    }

    /** Dismiss the desktop dropdown when clicking outside it. */
    function handleOutsideClick(event) {
      if (!mobile.matches && account.open && !account.contains(event.target)) {
        const restoreFocus = account.contains(document.activeElement);
        resetSubmenu();
        if (restoreFocus) summary.focus();
      }
    }

    // Register each navigation event once, after the required markup is found.
    summary.addEventListener('click', handleAccountClick);
    back.addEventListener('click', handleBackClick);
    toggle.addEventListener('click', handleToggleClick);
    panel.addEventListener('keydown', handleKeydown);
    panel.addEventListener('keydown', handlePanelKeydown);
    navigation.addEventListener('click', handleNavigationClick);
    document.addEventListener('click', handleOutsideClick);
    mobile.addEventListener('change', syncLayout);
    syncLayout();
  }

  // 3. APPLICATION STARTUP
  /** Register new feature initializers here; local UI does not wait for external libraries. */
  function initApp() {
    initNavigation();
    void initGlobalLibraries();
  }

  // Supports both a deferred external script and inline code pasted before the markup.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp, { once: true });
  } else {
    initApp();
  }
})();
