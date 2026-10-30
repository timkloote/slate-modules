/** Temporary stakeholder inspector. Build embeds the audit catalog so this file
 * works in Slate by itself, without fetching data or changing module markup.
 * Remove its script tag to retire it. Default off; preference is shared across views on this site.
 */
(() => {
  'use strict';
  const catalog = null; /* MODULE_REVIEW_CATALOG */
  const views = []; /* MODULE_REVIEW_VIEWS */
  const simulatorViews = []; /* MODULE_REVIEW_SIMULATOR_VIEWS */
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
      section{position:relative;z-index:1;background:#17212a;padding:12px;border:2px solid #fff;border-radius:6px;box-shadow:0 0 0 1px #17212a,0 4px 18px #0006;width:440px;max-width:100%;box-sizing:border-box}
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
      section:has(.review-toggle:not([hidden])){display:flex;align-items:center;width:auto}
      :host([data-open]) section{display:flex;flex-direction:column;width:100%;max-height:calc(100dvh - 32px);padding:16px;overflow-y:auto}
      :host([data-open]) .panel-header,:host([data-open]) .view-picker{flex:none}
      :host([data-open]) .details{flex:none;padding:4px}
      :host([data-open]) .tool-group{margin-top:0;padding-top:0;border-top:0}
      .search-field{position:relative;margin-top:4px}
      .search-field svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:18px;height:18px;color:#54616c;pointer-events:none}
      .search-field input{margin-top:0;padding-left:38px;min-height:40px}
      .review-toggle{display:inline-flex;align-items:center;gap:10px;padding:2px 0;border:0;background:transparent}
      .drag-handle{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;margin-right:8px;border:0;cursor:grab;touch-action:none;user-select:none;vertical-align:middle}
      .drag-handle:active{cursor:grabbing}
      :host([data-open]) .drag-handle{position:absolute;top:18px;left:16px;margin:0}
      :host([data-open]) .panel-header{padding-left:38px}
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
      :host([data-open]) section{border-radius:12px;padding-bottom:28px}
      .resize-handle{position:absolute;right:5px;bottom:5px;z-index:2;width:24px;height:24px;padding:0;border:0;background:transparent;cursor:ew-resize;touch-action:none;color:#fff}
      .resize-handle svg{width:16px;height:16px;pointer-events:none}
      :host([data-open]) .details{padding:0}
      .panel-header{padding-bottom:12px;border-bottom:1px solid #ffffff40}
      .panel-header strong{font-size:17px;letter-spacing:.01em}
      .close-review{border-color:#ffffff50;border-radius:8px;background:#ffffff0d}
      .close-review:hover,.search-results button:hover{background:#ffffff20}
      input,select,.view-controls a{border-radius:6px}
      .view-picker{padding:12px;margin-bottom:16px;border:1px solid #ffffff30;border-radius:8px;background:#ffffff08}
      .navigation-heading{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#c3ccd4}
      .inspection-card{margin-top:16px;padding:16px;border:1px solid #fff;border-left:4px solid #c8102f;border-radius:8px;background:#fff;color:#17212a;box-shadow:0 2px 8px #0002}
      .identity-heading{margin:0;color:#54616c;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
      .inspection-card .module-name{margin-top:8px;font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-.02em}
      .inspection-card .part-id{padding-top:12px;margin-top:12px;border-top:1px solid #d6dde3}
      .inspection-card code{overflow-wrap:anywhere}
      .inspection-card .copy{background:#edf1f4;color:#17212a;border-color:#c3ccd4;border-radius:6px}
      .inspection-card .copy:hover:not(:disabled){background:#dce4ea}
      .copy-status:empty,.search-status:empty{display:none}
      @media print{:host{display:none}}
    </style><section aria-label="View navigation and module review tools">
      <button class="drag-handle" type="button" aria-label="Move Module Review" title="Drag to move; use arrow keys when focused"><span aria-hidden="true">⠿</span></button>
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
          <div class="inspection-card">
          <p class="identity-heading">Module identity</p>
          <p class="module-name" role="status" aria-live="polite">Hover to inspect. Click a module to pin its title and ID.</p>
          <div class="part-id"><code></code><button class="copy" type="button" aria-label="Copy part ID" title="Copy part ID" disabled><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M15 9V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h4"/></svg></button></div>
          <p class="copy-status" role="status" aria-live="polite"></p>
          </div>
        </div>
      </div>
      <button class="review-toggle" type="button" role="switch" aria-label="Module Review" aria-checked="false" aria-expanded="false" aria-controls="review-details"><span class="switch-track" aria-hidden="true"></span><span class="switch-label">Module Review: Off</span></button>
    </section><button class="resize-handle" type="button" aria-label="Resize Module Review width" title="Drag to resize; use left and right arrow keys when focused" hidden><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 13 13 3M8 13l5-5"/></svg></button><div class="outline" hidden></div>`;
    document.body.append(host);
    const toggle = shadow.querySelector('.review-toggle');
    const handle = shadow.querySelector('.drag-handle');
    const resizeHandle = shadow.querySelector('.resize-handle');
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
    let destinations = views;
    let currentView;
    if (views.length || simulatorViews.length) {
      const currentUrl = new URL(window.location.href);
      const simulatorPath = currentUrl.pathname.match(/^(.*\/views\/)([^/]+)(?:\/preview)?(?:\/index\.html|\/)?$/);
      const simulatorView = simulatorPath && simulatorViews.find(view => view.id === simulatorPath[2]);
      if (simulatorView) {
        // Simulator pages have their own inventory; do not guess live FCE mappings.
        destinations = simulatorViews.map(view => {
          const url = new URL(`${simulatorPath[1]}${view.id}/preview/`, currentUrl);
          for (const key of ['source', 'styles', 'classes']) {
            if (currentUrl.searchParams.has(key)) url.searchParams.set(key, currentUrl.searchParams.get(key));
          }
          if (!url.searchParams.has('classes')) url.searchParams.set('classes', 'new');
          url.searchParams.set('clean', '1');
          url.searchParams.set('labels', '0');
          url.searchParams.set('layout', currentUrl.searchParams.get('layout') === 'columns' ? 'columns' : view.id === 'main-view' ? 'behavior' : 'stacked');
          return { ...view, url: url.href };
        });
        currentView = simulatorView;
        viewLink.setAttribute('aria-label', 'Open selected simulator view in a new tab');
      } else if (currentUrl.pathname.startsWith('/portal/')) {
        // Keep the deployed portal origin, path and applicant context; only cmd varies.
        destinations = views.map(view => {
          const url = new URL(currentUrl.href);
          const cmd = new URL(view.url).searchParams.get('cmd');
          url.hash = '';
          url.searchParams.delete('cmd');
          if (cmd) url.searchParams.set('cmd', cmd);
          return { ...view, url: url.href };
        });
        currentView = destinations.find(view => new URL(view.url).searchParams.get('cmd') === currentUrl.searchParams.get('cmd'));
      } else {
        currentView = views.find(view => view.url === currentUrl.href);
      }
      for (const view of destinations) {
        const option = document.createElement('option');
        option.value = view.id;
        option.textContent = `${view.name}${view.inactive ? ' (inactive)' : ''}`;
        viewSelect.append(option);
      }
      if (destinations.length) {
        viewSelect.value = (currentView || destinations[0]).id;
        const syncView = () => { viewLink.href = destinations.find(view => view.id === viewSelect.value).url; };
        viewSelect.addEventListener('change', syncView);
        syncView();
      }
    }
    let enabled = false;
    let current = null;
    let pinned = false;
    let location = null;
    let drag = null;
    let panelWidth = 360;
    let resizing = null;
    function resizeTools(width) {
      const rect = host.getBoundingClientRect();
      const available = Math.max(0, window.innerWidth - rect.left - 16);
      panelWidth = Math.min(Math.max(280, width), available);
      host.style.width = `${panelWidth}px`;
      moveTools(rect.left, rect.top);
    }
    resizeHandle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || resizing) return;
      const rect = host.getBoundingClientRect();
      resizing = { id: event.pointerId, x: event.clientX, width: rect.width };
      resizeHandle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    resizeHandle.addEventListener('pointermove', event => {
      if (!resizing || event.pointerId !== resizing.id) return;
      resizeTools(resizing.width + event.clientX - resizing.x);
    });
    function endResize(event) {
      if (!resizing || event.pointerId !== resizing.id) return;
      resizing = null;
      if (resizeHandle.hasPointerCapture(event.pointerId)) resizeHandle.releasePointerCapture(event.pointerId);
    }
    resizeHandle.addEventListener('pointerup', endResize);
    resizeHandle.addEventListener('pointercancel', endResize);
    resizeHandle.addEventListener('lostpointercapture', () => { resizing = null; });
    resizeHandle.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = event.shiftKey ? 40 : 10;
      resizeTools(host.getBoundingClientRect().width + (event.key === 'ArrowRight' ? step : -step));
    });
    function moveTools(left, top) {
      const rect = host.getBoundingClientRect();
      location = {
        left: Math.max(0, Math.min(left, window.innerWidth - rect.width)),
        top: Math.max(0, Math.min(top, window.innerHeight - rect.height)),
      };
      Object.assign(host.style, { left: `${location.left}px`, top: `${location.top}px`, bottom: 'auto' });
    }
    handle.addEventListener('pointerdown', event => {
      if (event.button !== 0 || drag) return;
      const rect = host.getBoundingClientRect();
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, left: rect.left, top: rect.top };
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    handle.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      moveTools(drag.left + event.clientX - drag.x, drag.top + event.clientY - drag.y);
    });
    function endDrag(event) {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    }
    handle.addEventListener('pointerup', endDrag);
    handle.addEventListener('pointercancel', endDrag);
    handle.addEventListener('lostpointercapture', () => { drag = null; });
    handle.addEventListener('keydown', event => {
      const direction = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!direction) return;
      event.preventDefault();
      const rect = host.getBoundingClientRect();
      const step = event.shiftKey ? 40 : 10;
      moveTools(rect.left + direction[0] * step, rect.top + direction[1] * step);
    });
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
        ? { top: '', bottom: '16px', left: '16px', width: `${panelWidth}px`, maxWidth: 'calc(100vw - 32px)' }
        : { top: '', bottom: '16px', left: '16px', width: '', maxWidth: 'calc(100vw - 32px)' });
      toggle.querySelector('.switch-label').textContent = `Module Review: ${enabled ? 'On' : 'Off'}`;
      toggle.setAttribute('aria-checked', String(enabled));
      toggle.setAttribute('aria-expanded', String(enabled));
      details.hidden = !enabled;
      panelHeader.hidden = !enabled;
      toggle.hidden = enabled;
      resizeHandle.hidden = !enabled;
      viewPicker.hidden = !enabled || !destinations.length;
      if (location) moveTools(location.left, location.top);
      if (!enabled) { current = null; pinned = false; outline.hidden = true; }
      try { localStorage.setItem('slate-module-review', String(enabled)); } catch { /* Shared storage can be unavailable in Slate. */ }
      try { sessionStorage.setItem('slate-module-review', String(enabled)); } catch { /* Tab storage is optional. */ }
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
    window.addEventListener('resize', () => { if (location) moveTools(location.left, location.top); });
    let savedState = null;
    try { savedState = localStorage.getItem('slate-module-review'); } catch { /* Fall back to this tab. */ }
    if (savedState === null) {
      try { savedState = sessionStorage.getItem('slate-module-review'); } catch { /* Default off without storage. */ }
    }
    setEnabled(savedState === 'true');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
