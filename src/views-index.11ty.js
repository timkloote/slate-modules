import { inventory, escapeHtml as e, documentPage } from '../scripts/simulator.js';
export default function () {
 const {views, source} = inventory();
 return documentPage('Slate simulator', `<header class="sim-bar"><strong>Slate simulator</strong><a href="/">Landing page</a></header><main class="sim-directory"><h1>Portal views</h1><p>Audit: ${e(source)} · ${views.reduce((n,v)=>n+v.modules.length,0)} modules. Open a view to inspect its parts and build a preview.</p><div class="sim-view-grid">${views.map(v=>`<a class="sim-view-card" href="/views/${v.slug}/"><h2>${e(v.name)}</h2><p>${v.modules.length} modules · ${v.modules.filter(m=>m.needsCapture).length} awaiting capture</p><span>${e(v.status)}</span></a>`).join('')}</div></main>`, 'simulator');
}
export const data = { permalink: 'views/index.html' };
