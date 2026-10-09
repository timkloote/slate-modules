import { liveViewPicker } from '../scripts/live-views.js';
import { inventory, escapeHtml as e, documentPage } from '../scripts/simulator.js';
const help = (name, items) => `<details class="sim-help"><summary aria-label="Help for ${name}" title="Help for ${name}">ⓘ</summary><div class="sim-help-content"><strong>${name}</strong><dl>${items.map(([option, description]) => `<dt>${option}</dt><dd>${description}</dd>`).join('')}</dl></div></details>`;
export default class {
  data() { return { pagination: { data: 'simulatorViews', size: 1, alias: 'view' }, simulatorViews: inventory().views, permalink: ({view}) => `views/${view.slug}/index.html` }; }
  render({ view }) {
    return documentPage(`${view.name} — Slate simulator`, `
    <header class="sim-bar"><a href="/views/">Slate simulator</a><a href="/modules/">Module library</a><a href="/references/">References</a><a href="/photography/">Photography</a><a href="/">Landing page</a>${liveViewPicker(view.slug)}</header>
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
          <div class="sim-control"><label>Preset <select id="view-preset"><option value="custom">Custom</option><option value="redesign">Portal redesign</option><option value="legacy">Legacy portal</option></select></label>${help('Preset', [['Portal redesign', `Sanitized modules, Portal + design styles, proposed audit classes, ${view.slug === 'main-view' ? 'Slate behavior · vanilla JS' : 'Slate stack'} layout, full width.`], ['Legacy portal', `Legacy originals, original portal styles without redesign CSS, original audit classes, ${view.slug === 'main-view' ? 'Slate behavior · vanilla JS' : 'Slate stack'} layout, full width.`], ['Custom', 'Shown automatically when the settings below do not match a preset. Your last settings are remembered per view.']])}</div>
          <a id="clean-preview" target="_blank" rel="noopener" title="Open selected modules without inspector labels or notices">Clean view ↗</a>
          <details class="sim-options"><summary>Preview options</summary><div class="sim-options-controls">
          <div class="sim-control"><label>Modules <select id="module-source"><option value="sanitized">Sanitized</option><option value="legacy">Legacy originals</option></select></label>${help('Modules', [['Sanitized', 'Cleaned module HTML, new shared header and footer, and available rendered captures. Module CSS and scripts are stripped.'], ['Legacy originals', 'Original module HTML, header, footer, and module CSS. Rendered captures are not substituted; original scripts remain inactive.']])}</div>
          <div class="sim-control"><label>Styles <select id="portal-styles"><option value="legacy">Original portal only</option><option value="design">Design only</option><option value="portal">Portal + design</option></select></label>${help('Styles', [['Original portal only', 'Loads the original portal styles without redesign CSS. Used by the Legacy portal preset.'], ['Design only', 'Loads local redesign CSS for sanitized modules. Legacy originals never load redesign CSS.'], ['Portal + design', 'Loads two Slate base stylesheets, Slate render.css and layout.css, and five Northeastern stylesheets before the local redesign CSS. Redesign CSS applies only to sanitized modules.']])}</div>
          <div class="sim-control"><label>Classes <select id="class-mode"><option value="original">Original audit classes</option><option value="new">Proposed audit classes</option></select></label>${help('Classes', [['Original audit classes', 'Uses the wrapper classes recorded on the original Slate parts.'], ['Proposed audit classes', 'Uses the suggested wrapper classes from the audit, including col-left and col-right.']])}</div>
          <div class="sim-control"><label>Clean view layout <select id="layout-mode"><option value="stacked">Slate stack</option>${view.slug === 'main-view' ? '<option value="behavior" selected>Slate behavior · vanilla JS</option>' : ''}<option value="columns">CSS column experiment</option></select></label>${help('Clean view layout', [['Slate stack', 'Keeps selected parts in audit order, one after another.'], ...(view.slug === 'main-view' ? [['Slate behavior · vanilla JS', 'Runs the recreated Main View column moves and other adjustments. Select the DOM and Scripts parts.']] : []), ['CSS column experiment', 'Groups selected left/right parts into independent stacks, then uses CSS grid for the two columns. Full-width parts stay between groups.'], ['Where it applies', 'This setting affects Clean view only. The simulator canvas and Open stacked preview always stay stacked.']])}</div>
          <div class="sim-control"><label>Width <select id="preview-width"><option value="full">Full</option><option value="tablet">Tablet · 768px</option><option value="mobile">Mobile · 390px</option></select></label>${help('Width', [['Full', 'Uses all available simulator canvas width.'], ['Tablet · 768px', 'Shows the canvas at 768 pixels wide.'], ['Mobile · 390px', 'Shows the canvas at 390 pixels wide.'], ['Where it applies', 'Changes the simulator canvas only; Clean view opens in its own browser tab.']])}</div>
          <label><input id="show-labels" type="checkbox" checked> Part labels</label>
          <a id="open-preview" target="_blank" rel="noopener">Open stacked preview</a>
          </div></details>
        </div>
        <details class="sim-notice"><summary>About this preview</summary><p>The canvas stacks selected modules in audit order. Clean view applies the selected layout. Legacy originals use original portal CSS without grad-admissions.css; sanitized modules can load the redesign CSS. Liquid, legacy scripts, and live forms remain inactive.</p></details>
        <div class="sim-canvas"><iframe id="portal-preview" title="${e(view.name)} portal preview" sandbox="allow-scripts allow-same-origin"></iframe></div>
      </section>
    </main>`, 'simulator');
  }
}
