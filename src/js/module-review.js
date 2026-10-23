/** Temporary stakeholder inspector. Build embeds the audit catalog so this file
 * works in Slate by itself, without fetching data or changing module markup.
 * Remove its script tag to retire it. Default off; preference lasts for this tab.
 */
(() => {
  'use strict';
  const catalog = null; /* MODULE_REVIEW_CATALOG */
  const views = []; /* MODULE_REVIEW_VIEWS */
  function init() {
    if (document.getElementById('module-review-tools')) return;
    const host = document.createElement('div');
    host.id = 'module-review-tools';
    host.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:2147483647;max-width:calc(100vw - 32px);';
    host.style.setProperty('z-index', '2147483647', 'important');
    host.style.setProperty('position', 'fixed', 'important');
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = `<style>
      :host{font:14px/1.5 Arial,sans-serif;color:#fff}
      section{position:relative;z-index:1;background:#17212a;padding:12px;border-radius:6px;box-shadow:0 3px 16px #0003;width:440px;max-width:100%;box-sizing:border-box}
      button{font:inherit;color:#fff;background:#17212a;border:1px solid #fff;border-radius:3px;padding:6px 10px;cursor:pointer}
      button:focus-visible{outline:3px solid #ffce55;outline-offset:3px}
      button:disabled{opacity:.5;cursor:default}.part-id{display:flex;align-items:center;gap:8px;margin-top:8px}.part-id code{min-width:0}.copy{display:inline-flex;align-items:center;justify-content:center;flex:none;padding:6px}.copy svg{width:16px;height:16px}.module-name{font-size:18px;font-weight:700;line-height:1.35}
      p{margin:8px 0 0;overflow-wrap:anywhere}code{font:12px/1.5 monospace;user-select:text}
      [hidden]{display:none!important}.outline{position:fixed;pointer-events:none;border:2px solid #c8102f;box-sizing:border-box;background:#c8102f08}
      .search-label{display:block;margin-top:10px;font-weight:700}
      input,select{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:8px;border:1px solid #aab3bb;border-radius:3px;background:#fff;color:#17212a;font:inherit}
      input:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #ffce55;outline-offset:2px}
      .search-results{display:grid;gap:4px;max-height:220px;overflow:auto;margin-top:8px}
      .search-results button{text-align:left;width:100%}.search-status{font-size:12px}
      section:has(.review-toggle:not([hidden])){width:auto}
      :host([data-open]) section{display:flex;flex-direction:column;width:100%;max-height:calc(100dvh - 32px);padding:16px;overflow-y:auto}
      :host([data-open]) .panel-header,:host([data-open]) .view-picker{flex:none}
      :host([data-open]) .details{flex:none;padding:4px}
      :host([data-open]) .tool-group{margin-top:0;padding-top:0;border-top:0}
      .search-field{position:relative;margin-top:4px}
      .search-field svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#54616c;pointer-events:none}
      .search-field input{margin-top:0;padding-left:38px;min-height:40px}
      .review-toggle{display:inline-flex;align-items:center;gap:10px;padding:2px 0;border:0;background:transparent}
      .switch-track{position:relative;display:inline-block;flex:none;width:36px;height:22px;border:1px solid #aab3bb;border-radius:12px;background:#54616c;box-sizing:border-box}
      .switch-track::after{content:"";position:absolute;left:3px;top:3px;width:14px;height:14px;border-radius:50%;background:#fff}
      .review-toggle[aria-checked="true"] .switch-track{background:#c8102f;border-color:#c8102f}
      .review-toggle[aria-checked="true"] .switch-track::after{left:17px}
      .panel-header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:12px}
      .panel-header strong{font-size:14px}
      .close-review{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;padding:0;font-size:24px;line-height:1}
      .details{margin-bottom:0}
      .tool-group{margin-top:16px;padding-top:16px;border-top:1px solid #ffffff40}
      .tool-group h2{margin:0 0 8px;font:700 12px/1.5 Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#c3ccd4}
      .tool-group .search-label{margin-top:0}
      .view-picker{padding-bottom:12px;margin-bottom:12px;border-bottom:1px solid #ffffff40}
      .navigation-heading{display:block;margin-bottom:8px}
      .view-picker .search-label{margin-top:0}
      .view-controls{display:flex;align-items:stretch;gap:8px;margin-top:4px}
      .view-controls select{flex:1;min-width:0;width:0;margin:0}
      .view-controls a{display:inline-flex;align-items:center;justify-content:center;flex:none;padding:8px 10px;border:1px solid #fff;border-radius:3px;background:#fff;color:#17212a;font:inherit;font-weight:700;text-decoration:none;white-space:nowrap}
      .view-controls a:hover{background:#e4e9ed}
      @media print{:host{display:none}}
    </style><section aria-label="View navigation and module review tools">
      <div class="panel-header" hidden><strong>Module Review</strong><button class="close-review" type="button" aria-label="Close Module Review" title="Close Module Review"><span aria-hidden="true">×</span></button></div>
      <nav class="view-picker" aria-label="View navigation" hidden>
        <strong class="navigation-heading">View navigation</strong>
        <label class="search-label" for="review-view">Choose a view</label>
        <div class="view-controls">
          <select id="review-view"></select>
          <a target="_blank" rel="noopener noreferrer" aria-label="Open selected Slate view in a new tab">Open view ↗</a>
        </div>
      </nav>
      <div id="review-details" class="details" hidden>
        <div class="tool-group" role="group" aria-labelledby="review-modules-heading">
          <h2 id="review-modules-heading">Modules on this page</h2>
          <label class="search-label" for="module-search">Find a module on this page</label>
          <div class="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
            <input id="module-search" type="search" placeholder="Number, name, or part ID" autocomplete="off" />
          </div>
          <p class="search-status" aria-live="polite"></p>
          <div class="search-results"></div>
          <p class="module-name" role="status" aria-live="polite">Hover to inspect. Click a module to pin its title and ID.</p>
          <div class="part-id"><code></code><button class="copy" type="button" aria-label="Copy part ID" title="Copy part ID" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg></button></div>
          <p class="copy-status" role="status" aria-live="polite"></p>
        </div>
      </div>
      <button class="review-toggle" type="button" role="switch" aria-label="Module Review" aria-checked="false" aria-expanded="false" aria-controls="review-details"><span class="switch-track" aria-hidden="true"></span><span class="switch-label">Module Review: Off</span></button>
    </section><div class="outline" hidden></div>`;
    document.body.append(host);
    const toggle = shadow.querySelector('.review-toggle');
    const details = shadow.querySelector('.details');
    const panelHeader = shadow.querySelector('.panel-header');
    const close = shadow.querySelector('.close-review');
    const label = shadow.querySelector('.module-name');
    const id = shadow.querySelector('code');
    const copy = shadow.querySelector('.copy');
    const copyStatus = shadow.querySelector('.copy-status');
    const outline = shadow.querySelector('.outline');
    const search = shadow.querySelector('input');
    const results = shadow.querySelector('.search-results');
    const searchStatus = shadow.querySelector('.search-status');
    const viewPicker = shadow.querySelector('.view-picker');
    const viewSelect = viewPicker.querySelector('select');
    const viewLink = viewPicker.querySelector('a');
    if (views.length) {
      for (const view of views) {
        const option = document.createElement('option');
        option.value = view.id;
        option.textContent = `${view.name}${view.inactive ? ' (inactive)' : ''}`;
        viewSelect.append(option);
      }
      const currentUrl = new URL(window.location.href);
      const currentView = views.find(view => {
        const url = new URL(view.url);
        return url.origin === currentUrl.origin && url.pathname === currentUrl.pathname && url.searchParams.get('cmd') === currentUrl.searchParams.get('cmd');
      });
      viewSelect.value = (currentView || views[0]).id;
      const syncView = () => { viewLink.href = views.find(view => view.id === viewSelect.value).url; };
      viewSelect.addEventListener('change', syncView);
      syncView();
    }
    let enabled = false;
    let current = null;
    let pinned = false;
    function position() {
      if (!enabled || !current?.isConnected) { outline.hidden = true; return; }
      const rect = current.getBoundingClientRect();
      outline.hidden = !rect.width || !rect.height;
      Object.assign(outline.style, { left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px` });
    }
    function setEnabled(value) {
      enabled = value;
      host.toggleAttribute('data-open', enabled);
      Object.assign(host.style, enabled
        ? { top: '', bottom: '16px', left: '16px', width: '360px', maxWidth: 'calc(100vw - 32px)' }
        : { top: '', bottom: '16px', left: '16px', width: '', maxWidth: 'calc(100vw - 32px)' });
      toggle.querySelector('.switch-label').textContent = `Module Review: ${enabled ? 'On' : 'Off'}`;
      toggle.setAttribute('aria-checked', String(enabled));
      toggle.setAttribute('aria-expanded', String(enabled));
      details.hidden = !enabled;
      panelHeader.hidden = !enabled;
      toggle.hidden = enabled;
      viewPicker.hidden = !enabled || !views.length;
      if (!enabled) { current = null; pinned = false; outline.hidden = true; }
      try { sessionStorage.setItem('slate-module-review', String(enabled)); } catch { /* Storage can be unavailable in Slate. */ }
    }
    function identify(event) {
      if (!enabled || !(event.target instanceof Element)) return;
      if (pinned && event.type !== 'click') return;
      const part = event.target.closest('.part[id^="part_"]');
      if (!part) {
        if (!pinned) { current = null; outline.hidden = true; }
        return;
      }
      current = part;
      if (event.type === 'click') pinned = true;
      const record = catalog?.[current.id];
      label.textContent = record ? `${record.view} · ${record.order}. ${record.name}` : current.dataset.module || 'Module not in the current inventory';
      id.textContent = current.id;
      copy.disabled = false;
      copyStatus.textContent = '';
      position();
    }
    function searchModules() {
      results.replaceChildren();
      const query = search.value.trim().toLowerCase();
      if (!query) { searchStatus.textContent = ''; return; }
      const matches = [...document.querySelectorAll('.part[id^="part_"]')].filter(part => {
        const record = catalog?.[part.id];
        if (/^\d+$/.test(query)) return String(record?.order ?? part.dataset.order) === query;
        return `${record?.view || ''} ${record?.name || part.dataset.module || ''} ${part.id}`.toLowerCase().includes(query);
      });
      searchStatus.textContent = matches.length ? `${matches.length} matching module${matches.length === 1 ? '' : 's'} on this page.` : 'No matching modules on this page.';
      for (const part of matches) {
        const record = catalog?.[part.id];
        const result = document.createElement('button');
        result.type = 'button';
        result.textContent = record ? `${record.view} · ${record.order}. ${record.name}` : part.dataset.module || part.id;
        result.addEventListener('click', () => {
          identify({ target: part, type: 'click' });
          part.scrollIntoView({ behavior: 'auto', block: 'center' });
          position();
          if (outline.hidden) searchStatus.textContent = 'Selected module is hidden or has no visible content.';
        });
        results.append(result);
      }
    }
    search.addEventListener('input', searchModules);
    search.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); results.querySelector('button')?.click(); }
    });
    copy.addEventListener('click', async () => {
      const text = id.textContent;
      try {
        await navigator.clipboard.writeText(text);
        copyStatus.textContent = 'Copied part ID.';
      } catch {
        copyStatus.textContent = 'Clipboard unavailable. Select the part ID and copy it manually.';
      }
    });
    toggle.addEventListener('click', () => { setEnabled(true); close.focus(); });
    close.addEventListener('click', () => { setEnabled(false); toggle.focus(); });
    document.addEventListener('pointerover', identify);
    document.addEventListener('focusin', identify);
    document.addEventListener('click', identify);
    document.addEventListener('pointerout', event => {
      if (!pinned && current && !current.contains(event.relatedTarget)) { current = null; outline.hidden = true; }
    });
    document.addEventListener('keydown', event => { if (enabled && event.key === 'Escape') setEnabled(false); });
    document.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    try { setEnabled(sessionStorage.getItem('slate-module-review') === 'true'); } catch { setEnabled(false); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
