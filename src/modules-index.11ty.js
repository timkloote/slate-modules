import { liveViewPicker } from '../scripts/live-views.js';
import { documentPage } from '../scripts/simulator.js';
export const data = { permalink: 'modules/index.html' };
export default function () {
  return documentPage('Module library — Slate simulator', `
<header class="sim-bar"><strong>Module library</strong><nav aria-label="Tools"><a href="/views/">View simulator</a><a href="/">Landing page</a></nav>${liveViewPicker()}</header>
<main class="module-library">
  <aside class="module-browser" aria-label="Find modules">
    <h1>One module at a time.</h1>
    <p class="sim-hint">Compare the original and modern versions, then find other modules that share their classes.</p>
    <label for="catalog-search">Search modules, classes, or IDs</label><input id="catalog-search" type="search" placeholder="Try messaging-block or checklist">
    <label for="catalog-view">Portal view</label><select id="catalog-view"><option value="">All views</option></select>
    <label for="catalog-family">Component class</label><select id="catalog-family"><option value="">All components</option></select>
    <p id="catalog-count" role="status">Loading catalog…</p>
    <nav id="catalog-list" aria-label="Modules"></nav>
  </aside>
  <section class="module-review" aria-label="Module comparison">
    <div class="module-heading"><div><p id="module-location" class="sim-hint"></p><h2 id="module-title">Select a module</h2></div><div class="sim-actions"><button id="module-prev" type="button">Previous</button><button id="module-next" type="button">Next</button></div></div>
    <p id="module-identity" class="module-identity"></p>
    <div class="module-controls"><label for="module-width">Preview width</label><select id="module-width"><option value="fit">Fit each panel</option><option value="390">Mobile · 390px</option><option value="768">Tablet · 768px</option><option value="1200">Desktop · 1200px</option></select><a id="module-in-view" href="/views/">Open view simulator</a></div>
    <p class="sim-hint">Each preview has its own CSS environment. Legacy includes original styles; modern includes grad admissions CSS. Liquid tags and values stay intact, shown in subtle italic text. Nothing is evaluated; live widgets need captured markup. Standard links open in a new tab; Liquid-dependent links need Slate.</p>
    <div class="module-comparison">
      ${['legacy', 'modern'].map(mode => `<section class="module-version" aria-labelledby="${mode}-heading">
        <div class="module-version-heading"><h3 id="${mode}-heading">${mode === 'legacy' ? 'Legacy' : 'Modern'}</h3><a id="${mode}-open" target="_blank" rel="noopener">Open preview ↗</a></div>
        <p id="${mode}-classes" class="module-classes"></p>
        <div class="module-preview-frame"><div class="module-viewport"><iframe id="${mode}-preview" title="${mode} module preview" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe></div>
          <div id="${mode}-visibility" class="module-visibility" role="status" hidden><strong>Hidden at this preview width</strong><p id="${mode}-visibility-text"></p><button id="${mode}-resize" type="button" hidden></button></div>
        </div>
        <p id="${mode}-status" class="sim-hint" role="status"></p>
        <details><summary>Stylesheets applied</summary><ul id="${mode}-styles" class="module-style-list"></ul></details>
        <details class="module-source"><summary>Inspect source code</summary><p id="${mode}-path" class="module-identity"></p><button type="button" id="${mode}-copy">Copy source</button><pre><code id="${mode}-code"></code></pre></details>
        ${mode === 'modern' ? '<details class="module-source"><summary>Inspect effective preview markup</summary><p class="sim-hint">Includes the shared header/footer or rendered capture when one is used.</p><pre><code id="modern-effective"></code></pre></details>' : ''}
      </section>`).join('')}
    </div>
    <details class="module-notes"><summary>Workbook notes and mapping</summary><p id="module-notes"></p></details>
    <section class="module-related" aria-labelledby="related-heading"><h3 id="related-heading">Related modules</h3><p class="sim-hint">Matches across all views by component class or module name. Layout classes alone do not count as a match.</p><div id="related-modules"></div></section>
  </section>
</main>`, 'module-library');
}
