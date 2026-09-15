/** Development controls only. Selection is local to this browser and view. */
const workspace = document.querySelector('[data-view]');
if (workspace) initSimulator().catch(error => {
  document.querySelector('#view-summary').textContent = `Could not load audit: ${error.message}`;
});
async function initSimulator() {
  const response = await fetch('/simulator/data.json');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const {views, capturedParts} = await response.json();
  const view = views.find(v => v.slug === workspace.dataset.view);
  const $ = id => document.getElementById(id);
  const key = `slate-simulator:${view.slug}`;
  const settingsKey = `${key}:settings`;
  try {
    const settings = JSON.parse(localStorage.getItem(settingsKey));
    for (const [id, value] of Object.entries(settings || {})) {
      const control = $(id);
      if (control?.options && [...control.options].some(option => option.value === value)) control.value = value;
    }
  } catch { /* Settings storage is optional. */ }
  let selected = new Set(capturedParts[view.slug] || view.modules.filter(m => m.status === 'Active').map(m=>m.partId));
  try { const saved = JSON.parse(localStorage.getItem(key)); if (Array.isArray(saved)) selected = new Set(saved); } catch { /* Storage is optional. */ }
  for (const v of views) $('view-picker').add(new Option(`${v.name} (${v.modules.length})`,v.slug,false,v.slug===view.slug));
  $('view-picker').addEventListener('change', e => location.assign(`/views/${e.target.value}/`));
  $('view-summary').textContent = `${view.modules.length} audited parts · ${view.modules.filter(m=>m.needsCapture).length} awaiting capture`;
  const cards = [];
  for (const module of view.modules) {
    const card = document.createElement('article'); card.className = 'sim-module';
    const label = document.createElement('label');
    const check = document.createElement('input'); check.type='checkbox'; check.checked=selected.has(module.partId);
    check.addEventListener('change', () => { check.checked ? selected.add(module.partId) : selected.delete(module.partId); updatePreview(); });
    const title = document.createElement('span'); title.textContent=`${module.order}. ${module.name}`;
    label.append(check,title);
    const meta = document.createElement('p'); meta.className='sim-meta';
    meta.textContent=`${module.status} · ${module.type}${module.needsCapture ? ' · Needs capture' : module.hasFixture ? ' · Captured markup' : ''}`;
    const details = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent='Audit & source'; details.append(summary);
    const fields = {
      'Part ID':module.partId, 'Original classes':module.originalClasses||'(none)',
      'Proposed classes':module.newClasses||'(none)', 'JS audit':module.js||'(not marked)',
      'Audit notes':module.notes||'(none)', 'Workbook row':module.sourceRow,
      'Sanitized source':module.source||'No source file', 'Legacy source':module.legacySource||'No legacy file', 'Capture file':module.fixture,
      'Sanitized preview substitution':module.replacement ? `Shared ${module.replacement}; original source retained` : 'None',
    };
    const dl=document.createElement('dl');
    for (const [key,value] of Object.entries(fields)) { const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=key;dd.textContent=value;dl.append(dt,dd); }
    details.append(dl);
    const source = document.createElement('details'), sourceTitle=document.createElement('summary'),pre=document.createElement('pre');
    sourceTitle.textContent='Sanitized source HTML'; pre.textContent=module.sourceHtml||'(no source)'; source.append(sourceTitle,pre);details.append(source);
    const legacySource=document.createElement('details'),legacyTitle=document.createElement('summary'),legacyPre=document.createElement('pre');
    legacyTitle.textContent='Legacy original HTML';legacyPre.textContent=module.legacyHtml||'(no legacy source)';legacySource.append(legacyTitle,legacyPre);details.append(legacySource);
    if(module.needsCapture) {const p=document.createElement('p');p.textContent='Inspect this part in Slate. Save its rendered inner HTML at the capture path above, then rebuild. Use fictional applicant data.';details.append(p);}
    card.append(label,meta,details);$('module-list').append(card);cards.push({card,check,module,meta});
  }
  function filter() {
    const query=$('module-search').value.toLowerCase(), mode=$('module-filter').value;
    for(const {card,module:m} of cards) card.hidden= !`${m.name} ${m.partId} ${m.type} ${m.notes}`.toLowerCase().includes(query) || (mode==='capture'&&!($('module-source').value==='legacy' ? m.type!=='Static Content' : m.needsCapture)) || (mode==='active'&&m.status!=='Active') || (mode==='inactive'&&m.status!=='Inactive');
  }
  function select(ids) {selected=new Set(ids);for(const {check,module} of cards)check.checked=selected.has(module.partId);updatePreview();}
  function updatePreview() {
    const legacy=$('module-source').value==='legacy';
    $('view-summary').textContent=`${view.modules.length} audited parts · ${legacy ? 'Legacy originals (captures and shared replacements off)' : 'Sanitized modules (captures and shared replacements on)'}`;
    for(const {module,meta} of cards) meta.textContent=`${module.status} · ${module.type} · ${legacy ? (!module.legacySource ? 'Missing legacy file' : module.type!=='Static Content' ? 'Widget markup unavailable' : 'Legacy original') : module.needsCapture ? 'Needs capture' : module.hasFixture ? 'Captured markup' : 'Sanitized'}`;
    try {
      localStorage.setItem(key,JSON.stringify([...selected]));
      localStorage.setItem(settingsKey,JSON.stringify({'layout-mode':$('layout-mode').value,'class-mode':$('class-mode').value,'portal-styles':$('portal-styles').value,'module-source':$('module-source').value}));
    } catch {}
    filter();
    const params=new URLSearchParams({parts:[...selected].join(','),classes:$('class-mode').value,layout:'stacked',source:$('module-source').value,styles:$('portal-styles').value,labels:$('show-labels').checked?'1':'0'});
    const url=`/views/${view.slug}/preview/?${params}`;
    $('portal-preview').src=url;$('open-preview').href=url;
    const cleanParams=new URLSearchParams(params);
    cleanParams.set('layout',$('layout-mode').value);
    cleanParams.set('labels','0');
    cleanParams.set('clean','1');
    $('clean-preview').href=`/views/${view.slug}/preview/?${cleanParams}`;
  }
  $('module-search').addEventListener('input',filter);$('module-filter').addEventListener('change',filter);
  $('select-all').addEventListener('click',()=>select(view.modules.map(m=>m.partId)));
  $('select-active').addEventListener('click',()=>select(view.modules.filter(m=>m.status==='Active').map(m=>m.partId)));
  $('select-none').addEventListener('click',()=>select([]));
  $('select-capture')?.addEventListener('click',()=>select(capturedParts[view.slug]||[]));
  for(const id of ['class-mode','layout-mode','show-labels','portal-styles','module-source'])$(id).addEventListener('change',updatePreview);
  $('preview-width').addEventListener('change',e=>{$('portal-preview').dataset.width=e.target.value;});
  updatePreview();
}
