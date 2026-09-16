import { loadPortalStyles } from './portal-styles.js';
import { initMainViewBehavior } from './main-view-behavior.js';

/**
 * Inert structural preview: never execute imported scripts or submit Slate forms.
 * Full-document imports become fragments inside audit-owned .part wrappers.
 * Fixtures may be inner HTML or one complete .part wrapper from DevTools.
 */
const SLATE_ASSET_BASE = 'https://enroll-northeastern-edu.cdn.technolutions.net/';

/** Imported relative assets belong to Slate; shared local components keep local paths. */
export function resolveSlateAsset(value, localAssets = false) {
  const path = value.trim();
  if (localAssets || !path || path.startsWith('#') || /\{[{%]/.test(path) || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) return value;
  return new URL(path, SLATE_ASSET_BASE).href;
}

/** Resolve CSS assets relative to the Slate host, including background images/fonts. */
export function resolveLegacyCss(css) {
  return css.replace(/url\(\s*(["']?)(.*?)\1\s*\)/gi, (match, quote, path) => {
    const resolved=resolveSlateAsset(path);
    return resolved===path ? match : `url("${resolved}")`;
  }).replace(/(@import\s+)(["'])(.*?)\2/gi, (match, prefix, quote, path) => `${prefix}${quote}${resolveSlateAsset(path)}${quote}`);
}

/** Legacy mode uses the original file, without sanitized substitutions or captures. */
export function moduleForSource(module, legacy) {
  return legacy ? {...module, html:module.legacyHtml||'', sourceHtml:module.legacyHtml||'', replacement:null, hasFixture:false, needsCapture:module.type!=='Static Content', missingSource:!module.legacySource} : module;
}

export function fragmentForPreview(html, partId, localAssets = false, preserveStyles = false) {
  const parsed = new DOMParser().parseFromString(html, 'text/html');
  parsed.querySelectorAll('script,meta,title,base,iframe,object,embed,noscript,template').forEach(el=>el.remove());
  for(const el of parsed.querySelectorAll('style,link')) {
    if(!preserveStyles || (el.localName==='link' && el.getAttribute('rel')?.toLowerCase()!=='stylesheet')) el.remove();
  }
  for(const el of parsed.querySelectorAll('*')) {
    for(const attr of [...el.attributes]) {
      if (/^on/i.test(attr.name) || (attr.name==='style' && !preserveStyles) || attr.name==='srcdoc' || attr.name.startsWith('x-') || attr.name.startsWith('data-on') || ['action','formaction','autofocus','srcset'].includes(attr.name)) el.removeAttribute(attr.name);
      if (['href','src','xlink:href'].includes(attr.name) && /^\s*(javascript|vbscript|data):/i.test(attr.value)) el.removeAttribute(attr.name);
    }
    if(preserveStyles) {
      if(el.localName==='style') el.textContent=resolveLegacyCss(el.textContent);
      if(el.hasAttribute('style')) el.setAttribute('style',resolveLegacyCss(el.getAttribute('style')));
      if(el.localName==='link' && el.hasAttribute('href')) el.setAttribute('href',resolveSlateAsset(el.getAttribute('href')));
    }
    for (const attribute of ['src', 'poster', ...(el.matches('image,use') ? ['href','xlink:href'] : [])]) {
      if (el.hasAttribute(attribute)) el.setAttribute(attribute,resolveSlateAsset(el.getAttribute(attribute),localAssets));
    }
    if(el.matches('input,select,textarea,button')) el.disabled=true;
    if(el.matches('a')) {el.removeAttribute('href');el.removeAttribute('target');}
  }
  const wrapper=parsed.getElementById(partId);
  const root=wrapper?.classList.contains('part') ? wrapper : parsed.body;
  const fragment=document.createDocumentFragment();
  if(preserveStyles) fragment.append(...parsed.head.querySelectorAll('style,link[rel="stylesheet"]'));
  fragment.append(...root.childNodes);return fragment;
}
/** Group adjacent column parts so each side stacks at its own height. */
export function groupColumnParts(container) {
  let segment;
  for (const part of [...container.children]) {
    const side=part.matches('.leftcolumn,.col-left') ? 'left' : part.matches('.rightcolumn,.col-right') ? 'right' : null;
    if (!side || part.matches('.full-width,[data-shared]')) { segment=null; continue; }
    if (!segment) {
      segment=document.createElement('div');segment.className='sim-column-segment';
      for (const column of ['left','right']) {
        const bucket=document.createElement('div');bucket.className=`sim-column-${column}`;segment.append(bucket);
      }
      part.before(segment);
    }
    segment.querySelector(`.sim-column-${side}`).append(part);
  }
}
export async function initPreview() {
 const params=new URLSearchParams(location.search);
 if(params.get('styles')==='portal') loadPortalStyles(document);
 const response=await fetch('/simulator/data.json');if(!response.ok)throw new Error(`HTTP ${response.status}`);
 const {views}=await response.json();
 const view=views.find(v=>v.slug===document.querySelector('[data-view]').dataset.view);
 const legacy=params.get('source')==='legacy';
 const selected=new Set(params.has('parts')?params.get('parts').split(','):view.modules.filter(m=>m.status==='Active').map(m=>m.partId));
 const container=document.querySelector('.part_rows_container');
 const clean=params.get('clean')==='1';
 container.classList.toggle('sim-columns',clean && params.get('layout')==='columns');
 const behavior=clean && (params.get('layout') || (view.slug==='main-view' ? 'behavior' : 'stacked'))==='behavior' && view.slug==='main-view';
 document.body.classList.toggle('sim-slate-behavior',behavior);
 document.body.classList.toggle('sim-sanitized',!legacy);
 document.body.classList.toggle('sim-legacy',legacy);
 document.body.classList.toggle('sim-clean',clean);
 document.body.classList.toggle('sim-labels',!clean && params.get('labels')!=='0');
 for(const record of view.modules.filter(m=>selected.has(m.partId))) {
  const module=moduleForSource(record,legacy);
  const part=document.createElement('div');part.id=module.partId;
  part.className=`part ${params.get('classes')==='new'?module.newClasses:module.originalClasses}`;
  part.dataset.module=module.name;part.dataset.order=module.order;
  if(module.replacement)part.dataset.shared=module.replacement;
  const label=document.createElement('div');label.className='sim-part-label';label.textContent=`${module.order}. ${module.name} · ${module.partId}`;part.append(label);
  if(module.needsCapture || module.missingSource) {
    const placeholder=document.createElement('div');placeholder.className='sim-widget-placeholder';
    const title=document.createElement('strong');title.textContent=module.missingSource ? 'Legacy source missing' : module.type;
    const text=document.createElement('p');text.textContent=module.missingSource ? 'No matching legacy file exists for this audit row.' : legacy ? 'Slate widget: rendered markup is not included in the legacy static export. Captures are available in sanitized mode.' : 'Rendered markup needed. Inspect this part in Slate and add a local capture.';
    placeholder.append(title,text);part.append(placeholder);
  } else {
    const content=fragmentForPreview(module.html,module.partId,Boolean(module.replacement && !module.hasFixture),legacy);
    if(module.replacement) {
      content.querySelectorAll('button').forEach(button=>button.disabled=false);
      content.querySelectorAll('a').forEach(link=>link.setAttribute('href','#'));
    }
    if(behavior && module.name==='DOM' && module.replacement==='footer' && !module.hasFixture) {
      const layout=fragmentForPreview(module.sourceHtml,module.partId);
      layout.querySelectorAll('footer').forEach(footer=>footer.remove());
      part.append(layout);
    }
    const hasContent=[...content.childNodes].some(node=>node.nodeType!==8 && node.textContent?.trim()) || content.querySelector('img,svg,input,select,textarea,button,table,hr');
    part.append(content);
    if(!hasContent) {const note=document.createElement('p');note.className='sim-widget-placeholder';note.textContent='No visible static content. See Audit & source for this module’s markup and notes.';part.append(note);}
    if(!module.replacement && /\{%|\{\{/.test(module.html)) {const note=document.createElement('p');note.className='sim-liquid-note';note.textContent='Unresolved Slate Liquid — conditional branches may appear together. Add a rendered fixture for accurate content.';part.prepend(note);}
  }
  container.append(part);
 }
 if(clean && params.get('layout')==='columns') groupColumnParts(container);
 if(behavior) {
  const scriptPart=view.modules.find(module=>module.order===133 && module.name==='Scripts');
  const messages=[];
  if(!scriptPart || !selected.has(scriptPart.partId)) messages.push('Select module 133 (Scripts) to run Main View behavior.');
  else {
    const result=initMainViewBehavior(container,{ignoreElement:element=>element.matches('.sim-part-label,.sim-liquid-note,.sim-widget-placeholder')});
    messages.push(...result.missing.map(selector=>`No match: ${selector}`));
  }
  if(messages.length) {
    const report=document.createElement('details');report.className='sim-behavior-report';
    const title=document.createElement('summary');title.textContent=`Slate behavior: ${messages.length} unmatched targets or setup notes`;
    const note=document.createElement('p');note.textContent='Targets may belong to unselected parts, missing widget captures, or older Slate IDs. Original selectors are preserved rather than guessed.';
    const list=document.createElement('ul');for(const message of messages){const item=document.createElement('li');item.textContent=message;list.append(item);}
    report.append(title,note,list);container.before(report);
  }
 }
 if(!container.children.length) {const p=document.createElement('p');p.className='sim-empty';p.textContent='No modules selected. Select parts in the inspector to preview this view.';container.append(p);}
 document.addEventListener('submit',e=>e.preventDefault());
 document.addEventListener('click',e=>{if(e.target.closest('a'))e.preventDefault();});
 // Load the production entry point after the assembled parts exist.
 if(clean && !legacy) {const app=document.createElement('script');app.src='/js/app.js';document.body.append(app);}
}
if(typeof document!=='undefined')initPreview().catch(error=>{document.querySelector('.part_rows_container').textContent=`Preview unavailable: ${error.message}`;});
