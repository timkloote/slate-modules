import { highlightLiquidSource } from './liquid-highlight.js';
import { catalogModules, componentClasses, filterModules, relatedModules } from './module-catalog.js';

export function statusBadge(document, status) {
  const badge = document.createElement('span');
  badge.className = `module-status module-status--${status === 'Active' ? 'active' : status === 'Inactive' ? 'inactive' : 'unknown'}`;
  badge.textContent = status;
  return badge;
}

export async function initModuleLibrary() {
  const $ = id => document.getElementById(id);
  const response = await fetch('/simulator/data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const { views } = await response.json();
  const modules = catalogModules(views);
  let selected, filtered = modules;
  const option = (value, text) => { const node = document.createElement('option'); node.value = value; node.textContent = text; return node; };
  for (const view of views) $('catalog-view').append(option(view.slug, view.name));
  for (const family of [...new Set(modules.flatMap(componentClasses))].sort()) $('catalog-family').append(option(family, family));
  function stateToUrl() {
    const params = new URLSearchParams();
    if (selected) params.set('part', selected.partId);
    for (const [key, id] of [['q', 'catalog-search'], ['view', 'catalog-view'], ['family', 'catalog-family'], ['width', 'module-width']]) if ($(id).value && $(id).value !== 'fit') params.set(key, $(id).value);
    history.replaceState(null, '', `${location.pathname}?${params}`);
  }
  function applyWidth() {
    for (const mode of ['legacy', 'modern']) $(mode + '-preview').style.width = $('module-width').value === 'fit' ? '100%' : `${$('module-width').value}px`;
  }
  function moduleLink(module, detail) {
    const link = document.createElement('a');
    link.href = `/modules/?part=${encodeURIComponent(module.partId)}`;
    link.className = 'module-catalog-item';
    link.dataset.part = module.partId;
    const title = document.createElement('strong'); title.textContent = module.name;
    const meta = document.createElement('span'); meta.textContent = detail || `${module.viewName} · ${module.order}`;
    meta.append(' · ', statusBadge(document, module.status));
    link.append(title, meta);
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); select(module);
    });
    return link;
  }
  function updateNavigation() {
    const index = filtered.indexOf(selected);
    $('module-prev').disabled = index <= 0;
    $('module-next').disabled = index < 0 || index >= filtered.length - 1;
    for (const link of $('catalog-list').querySelectorAll('a')) {
      if (link.dataset.part === selected?.partId) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    }
  }
  function filter() {
    filtered = filterModules(modules, { query: $('catalog-search').value, view: $('catalog-view').value, family: $('catalog-family').value });
    $('catalog-count').textContent = `${filtered.length} of ${modules.length} modules`;
    $('catalog-list').replaceChildren(...filtered.map(module => moduleLink(module)));
    if (!filtered.length) $('catalog-list').textContent = 'No matching modules. Try another name, class, or view.';
    updateNavigation(); stateToUrl();
  }
  function select(module) {
    selected = module;
    $('module-title').textContent = module.name;
    $('module-location').replaceChildren(`${module.viewName} · Module ${module.order} · `, statusBadge(document, module.status), ` · ${module.type}`);
    $('module-identity').textContent = module.partId;
    $('module-in-view').href = `/views/${module.viewSlug}/`;
    $('module-notes').textContent = `${module.notes || 'No workbook notes.'} Workbook row ${module.sourceRow}. Legacy name: ${module.legacyName || module.name}. Source filenames retain their original numbering.`;
    highlightLiquidSource($('modern-effective'), module.html);
    for (const mode of ['legacy', 'modern']) {
      const legacy = mode === 'legacy';
      $(mode + '-classes').textContent = `Classes: part ${legacy ? module.originalClasses : module.newClasses}`;
      $(mode + '-path').textContent = (legacy ? module.legacySource : module.source) || 'Source file unavailable';
      highlightLiquidSource($(mode + '-code'), legacy ? module.legacyHtml : module.sourceHtml);
      $(mode + '-copy').textContent = 'Copy source';
      $(mode + '-status').textContent = 'Loading preview…';
      $(mode + '-visibility').hidden = true;
      $(mode + '-resize').hidden = true;
      $(mode + '-styles').replaceChildren();
      const url = `/modules/preview/?${new URLSearchParams({ part: module.partId, source: mode })}`;
      $(mode + '-open').href = url;
      $(mode + '-preview').src = url;
    }
    const related = relatedModules(module, modules);
    $('related-modules').replaceChildren(...related.map(({ module, reason }) => moduleLink(module, `${module.viewName} · ${reason}`)));
    if (!related.length) $('related-modules').textContent = 'No other modules share this component class or name.';
    updateNavigation(); stateToUrl();
  }
  for (const id of ['catalog-view', 'catalog-family']) $(id).addEventListener('change', filter);
  $('catalog-search').addEventListener('input', filter);
  $('module-width').addEventListener('change', () => { applyWidth(); stateToUrl(); });
  $('module-prev').addEventListener('click', () => { const index = filtered.indexOf(selected); if (index > 0) select(filtered[index - 1]); });
  $('module-next').addEventListener('click', () => { const index = filtered.indexOf(selected); if (index >= 0 && index < filtered.length - 1) select(filtered[index + 1]); });
  for (const mode of ['legacy', 'modern']) $(mode + '-copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($(mode + '-code').textContent); $(mode + '-copy').textContent = 'Copied'; }
    catch { $(mode + '-copy').textContent = 'Select and copy the code below'; }
  });
  for (const mode of ['legacy', 'modern']) $(mode + '-resize').addEventListener('click', () => {
    const width = $(mode + '-resize').dataset.width;
    if (!['390', '1200'].includes(width)) return;
    $('module-width').value = width;
    applyWidth(); stateToUrl();
  });
  window.addEventListener('message', event => {
    const data = event.data;
    if (event.origin !== location.origin || data?.type !== 'module-preview' || data.partId !== selected?.partId || !['legacy', 'modern'].includes(data.mode) || event.source !== $(data.mode + '-preview').contentWindow) return;
    $(data.mode + '-visibility').hidden = !data.visibility;
    $(data.mode + '-visibility-text').textContent = data.visibility || '';
    const resize = $(data.mode + '-resize');
    resize.hidden = !data.visibility || !['390', '1200'].includes(data.suggestedWidth);
    resize.dataset.width = data.suggestedWidth || '';
    resize.textContent = data.suggestedWidth === '1200' ? 'Switch to Desktop · 1200px' : 'Switch to Mobile · 390px';
    $(data.mode + '-status').textContent = data.notes.join(' ') || 'Static preview. Scripts and form actions are disabled.';
    const lines = data.styles.map(style => `${style.failed ? 'Failed to load: ' : ''}${style.href}`);
    lines.push(...data.inherited.map(path => `Shared legacy Styles module: ${path}`));
    if (data.inlineStyles) lines.push(`${data.inlineStyles} embedded style block(s) from legacy source.`);
    $(data.mode + '-styles').replaceChildren(...lines.map(text => { const li = document.createElement('li'); li.textContent = text; return li; }));
  });
  const params = new URLSearchParams(location.search);
  for (const [key, id] of [['q', 'catalog-search'], ['view', 'catalog-view'], ['family', 'catalog-family'], ['width', 'module-width']]) {
    const value = params.get(key);
    if (value !== null && (!$(id).options || [...$(id).options].some(option => option.value === value))) $(id).value = value;
  }
  applyWidth(); filter();
  select(modules.find(module => module.partId === params.get('part')) || filtered.find(module => componentClasses(module).includes('messaging-block')) || filtered[0] || modules[0]);
}
if (typeof document !== 'undefined' && document.getElementById('catalog-list')) initModuleLibrary().catch(error => {
  document.getElementById('catalog-count').textContent = `Could not load modules: ${error.message}`;
});
