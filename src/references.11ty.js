import { documentPage, escapeHtml as e } from '../scripts/simulator.js';
import { readFileSync } from 'node:fs';
export const data = { permalink: 'references/index.html' };
export default function () {
 const pages = JSON.parse(readFileSync('src/references/catalog.json', 'utf8'));
 return documentPage('Design references — Slate simulator', `
<header class="sim-bar"><strong>Design references</strong><nav aria-label="Tools"><a href="/modules/">Module library</a> · <a href="/views/">View simulator</a></nav></header>
<main class="reference-layout"><aside class="reference-browser"><h1>Northeastern website references</h1><p class="sim-hint">40 captured pages for reviewing layouts, typography, and module patterns. These are static screenshots captured September 17, 2026.</p>
<label for="reference-search">Search pages and section headings</label><input type="search" id="reference-search" placeholder="Try tuition, cards, or support">
<label for="reference-category">Page type</label><select id="reference-category"><option value="">All page types</option>${[...new Set(pages.map(p=>p.category))].sort().map(c=>`<option>${e(c)}</option>`).join('')}</select>
<p id="reference-count" role="status"></p><div id="reference-list">${pages.map(p=>`<button type="button" class="reference-card" data-reference="${e(p.id)}"><img src="${e(p.thumbnail)}" loading="lazy" decoding="async" alt=""><span>${e(p.title)}<small>${e(p.category)}</small></span></button>`).join('')}</div></aside>
<section class="reference-review" aria-label="Screenshot viewer"><div class="reference-toolbar"><h2 id="reference-title">Select a page</h2><div class="sim-actions"><button id="reference-prev">Previous</button><button id="reference-next">Next</button><label for="reference-size">Screenshot width</label><select id="reference-size"><option value="fit">Fit panel</option><option value="1440">Original · 1440px</option></select><a id="reference-original" target="_blank" rel="noopener">Open original ↗</a><a id="reference-live" target="_blank" rel="noopener">Visit website ↗</a></div><p id="reference-meta" class="sim-hint"></p></div><div class="reference-canvas" tabindex="0" aria-label="Scrollable full page screenshot"><img id="reference-image" alt=""></div></section></main>`, 'references');
}
