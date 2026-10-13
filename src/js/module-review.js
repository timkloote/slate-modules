/** Temporary stakeholder inspector. Build embeds the audit catalog so this file
 * works in Slate by itself, without fetching data or changing module markup.
 * Remove its script tag to retire it. Default off; preference lasts for this tab.
 */
(() => {
  'use strict';
  const catalog = null; /* MODULE_REVIEW_CATALOG */
  function init() {
    if (document.getElementById('module-review-tools')) return;
    const host = document.createElement('div');
    host.id = 'module-review-tools';
    host.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:2147483647;max-width:calc(100vw - 32px);';
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
      :host{font:14px/1.5 Arial,sans-serif;color:#fff}
      section{background:#17212a;padding:12px;border-radius:6px;box-shadow:0 3px 16px #0003;max-width:440px;box-sizing:border-box}
      button{font:inherit;color:#fff;background:#17212a;border:1px solid #fff;border-radius:3px;padding:6px 10px;cursor:pointer}
      button:focus-visible{outline:3px solid #ffce55;outline-offset:3px}
      p{margin:8px 0 0;overflow-wrap:anywhere}code{font:12px/1.5 monospace;user-select:text}
      [hidden]{display:none!important}.outline{position:fixed;pointer-events:none;border:2px solid #c8102f;box-sizing:border-box;background:#c8102f08}
      @media print{:host{display:none}}
    </style><section aria-label="Module review tools"><button type="button" aria-pressed="false">Module review: Off</button><div hidden><p role="status" aria-live="polite">Hover over a module or focus a link/control inside it.</p><p><code></code></p></div></section><div class="outline" hidden></div>`;
    document.body.append(host);
    const toggle = shadow.querySelector('button');
    const details = shadow.querySelector('section div');
    const label = shadow.querySelector('[role="status"]');
    const id = shadow.querySelector('code');
    const outline = shadow.querySelector('.outline');
    let enabled = false;
    let current = null;
    function position() {
      if (!enabled || !current?.isConnected) { outline.hidden = true; return; }
      const rect = current.getBoundingClientRect();
      outline.hidden = !rect.width || !rect.height;
      Object.assign(outline.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    }
    function setEnabled(value) {
      enabled = value;
      toggle.textContent = `Module review: ${enabled ? 'On' : 'Off'}`;
      toggle.setAttribute('aria-pressed', String(enabled));
      details.hidden = !enabled;
      if (!enabled) { current = null; outline.hidden = true; }
      try { sessionStorage.setItem('slate-module-review', String(enabled)); } catch { /* Storage can be unavailable in Slate. */ }
    }
    function identify(event) {
      if (!enabled || !(event.target instanceof Element)) return;
      current = event.target.closest('.part[id^="part_"]');
      if (!current) { outline.hidden = true; return; }
      const record = catalog?.[current.id];
      label.textContent = record ? `${record.view} · ${record.order}. ${record.name}` : current.dataset.module || 'Module not in the current inventory';
      id.textContent = current.id;
      position();
    }
    toggle.addEventListener('click', () => setEnabled(!enabled));
    document.addEventListener('pointerover', identify);
    document.addEventListener('focusin', identify);
    document.addEventListener('pointerout', event => {
      if (current && !current.contains(event.relatedTarget)) { current = null; outline.hidden = true; }
    });
    document.addEventListener('keydown', event => { if (enabled && event.key === 'Escape') setEnabled(false); });
    document.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    try { setEnabled(sessionStorage.getItem('slate-module-review') === 'true'); } catch { setEnabled(false); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
