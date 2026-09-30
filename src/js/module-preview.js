import { highlightLiquidPreview } from './liquid-highlight.js';
import { loadPortalStyles } from './portal-styles.js';
import { fragmentForPreview, moduleForSource } from './simulator-preview.js';

/** Legacy Styles parts supply shared CSS without executing their embedded scripts. */
export function legacyStyleModules(view) {
  return view.modules.filter(module => (module.legacyName || module.name) === 'Styles' && module.legacyHtml);
}
export function appendLegacyStyles(document, view, selectedId) {
  const sources = [];
  for (const module of legacyStyleModules(view)) {
    if (module.partId === selectedId) continue;
    const fragment = fragmentForPreview(module.legacyHtml, module.partId, false, true);
    const nodes = fragment.querySelectorAll('style,link[rel="stylesheet"]');
    if (nodes.length) sources.push(module.legacySource);
    document.head.append(...nodes);
  }
  return sources;
}
/** Explain responsive CSS hiding without changing the original module styles. */
export function moduleVisibilityNote(part, computedStyle, width) {
  if (!computedStyle) return '';
  const style = computedStyle(part);
  if (style.display !== 'none' && style.visibility !== 'hidden' && style.visibility !== 'collapse') return '';
  const hint = part.classList.contains('desktop')
    ? 'This module has the desktop class. Choose Desktop · 1200px to inspect it.'
    : part.classList.contains('mobile')
      ? 'This module has the mobile class. Choose Mobile · 390px to inspect it.'
      : 'Inspect its source and applied styles for visibility rules.';
  return `Hidden by CSS at this preview width (${width}px). ${hint} Audit Active/Inactive status does not hide previews.`;
}

export async function initModulePreview() {
  const params = new URLSearchParams(location.search);
  const legacy = params.get('source') === 'legacy';
  loadPortalStyles(document);
  if (!legacy) {
    const link = document.createElement('link');
    link.rel = 'stylesheet'; link.href = '/css/grad-admissions.css';
    document.head.append(link);
  }
  const response = await fetch('/simulator/data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { views } = await response.json();
  const view = views.find(view => view.modules.some(module => module.partId === params.get('part')));
  const record = view?.modules.find(module => module.partId === params.get('part'));
  if (!record) throw new Error('This module ID is not in the current catalog.');
  const inherited = legacy ? appendLegacyStyles(document, view, record.partId) : [];
  const module = moduleForSource(record, legacy);
  const part = document.createElement('div');
  part.id = record.partId;
  part.className = `part ${legacy ? record.originalClasses : record.newClasses}`;
  const notes = [];
  if (module.needsCapture || module.missingSource || (!legacy && !record.source && !record.hasFixture && !record.replacement)) {
    notes.push(module.missingSource ? 'Legacy file missing.' : module.needsCapture ? 'Live Slate widget: rendered markup is not available for this version.' : 'Modern file missing.');
    const message = document.createElement('p'); message.className = 'module-preview-message'; message.textContent = notes.join(' '); part.append(message);
  } else {
    part.append(fragmentForPreview(module.html, module.partId, Boolean(module.replacement && !module.hasFixture), legacy, true));
    highlightLiquidPreview(part);
    if (/\{%|\{\{/.test(module.html)) notes.push('Liquid is highlighted, not evaluated; conditional content may appear together. Attribute expressions remain visible in the source panel.');
    if (module.hasFixture) notes.push('Showing captured rendered markup.');
    if (module.replacement) notes.push(`Showing the shared ${module.replacement}.`);
    if (!part.textContent.trim() && !part.querySelector('img,svg,input,select,textarea,button,table,hr')) notes.push('No visible content: this module may contain only styles, scripts, or hidden fields.');
  }
  document.querySelector('.part_rows_container').append(part);
  document.title = `${legacy ? 'Legacy' : 'Modern'} — ${record.name}`;
  document.addEventListener('submit', event => event.preventDefault());
  const report = () => {
    const styles = [...document.querySelectorAll('link[rel="stylesheet"]')].map(link => ({ href: link.href, failed: link.dataset.loadError === 'true' }));
    const visibility = moduleVisibilityNote(part, typeof getComputedStyle === 'function' ? getComputedStyle : null, globalThis.innerWidth);
    parent.postMessage({ type: 'module-preview', partId: record.partId, mode: legacy ? 'legacy' : 'modern', visibility, suggestedWidth: visibility ? (part.classList.contains('desktop') ? '1200' : part.classList.contains('mobile') ? '390' : '') : '', notes: [...(visibility ? [visibility] : []), ...notes], styles, inherited, inlineStyles: document.querySelectorAll('style').length }, location.origin);
  };
  for (const link of document.querySelectorAll('link[rel="stylesheet"]')) {
    link.addEventListener('error', () => { link.dataset.loadError = 'true'; report(); });
    link.addEventListener('load', report);
  }
  globalThis.window?.addEventListener('resize', report);
  globalThis.window?.addEventListener('load', report);
  report();
}
if (typeof document !== 'undefined' && document.getElementById('module-preview-root')) initModulePreview().catch(error => {
  document.getElementById('module-preview-root').textContent = `Preview unavailable: ${error.message}`;
});
