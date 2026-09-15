import { inventory, escapeHtml as e, documentPage } from '../scripts/simulator.js';
export default class {
  data() { return { pagination: { data: 'simulatorViews', size: 1, alias: 'view' }, simulatorViews: inventory().views, permalink: ({view}) => `views/${view.slug}/index.html` }; }
  render({ view }) {
    return documentPage(`${view.name} — Slate simulator`, `
    <header class="sim-bar"><a href="/views/">Slate simulator</a><a href="/">Landing page</a></header>
    <main class="sim-workspace" data-view="${e(view.slug)}">
      <aside class="sim-inspector">
        <label for="view-picker">View</label><select id="view-picker"></select>
        <h1>${e(view.name)}</h1>
        <p id="view-summary"></p>
        <label for="module-search">Find a module or part ID</label><input id="module-search" type="search" placeholder="Search the audit">
        <label for="module-filter">Show in inspector</label><select id="module-filter"><option value="all">All modules</option><option value="capture">Needs rendered markup</option><option value="active">Active in audit</option><option value="inactive">Inactive in audit</option></select>
        <div class="sim-actions"><button id="select-all">Select all</button><button id="select-active">Select active</button><button id="select-none">Clear selection</button></div>
        ${view.slug === 'main-view' ? '<button id="select-capture">Select parts from supplied page</button>' : ''}
        <p class="sim-hint">Active status does not include Slate’s applicant visibility rules. Choose the parts to preview.</p>
        <div id="module-list"></div>
      </aside>
      <section class="sim-preview" aria-label="Portal preview">
        <div class="sim-toolbar">
          <label>Classes <select id="class-mode"><option value="original">Original audit classes</option><option value="new">Proposed audit classes</option></select></label>
          <label>Clean view layout <select id="layout-mode"><option value="stacked">Slate stack</option>${view.slug === 'main-view' ? '<option value="behavior" selected>Slate behavior · vanilla JS</option>' : ''}<option value="columns">CSS column experiment</option></select></label>
          <label>Width <select id="preview-width"><option value="full">Full</option><option value="tablet">Tablet · 768px</option><option value="mobile">Mobile · 390px</option></select></label>
          <label><input id="show-labels" type="checkbox" checked> Part labels</label>
          <a id="open-preview" target="_blank" rel="noopener">Open stacked preview</a>
          <a id="clean-preview" target="_blank" rel="noopener" title="Open selected modules without inspector labels or notices">Clean view ↗</a>
        </div>
        <p class="sim-notice">This canvas stacks selected modules in audit order without portal JavaScript. Clean view applies its selected layout and vanilla-JS behavior. Liquid and live forms remain inactive.</p>
        <div class="sim-canvas"><iframe id="portal-preview" title="${e(view.name)} portal preview" sandbox="allow-scripts allow-same-origin"></iframe></div>
      </section>
    </main>`, 'simulator');
  }
}
