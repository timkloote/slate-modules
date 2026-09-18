import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML, DOMParser } from 'linkedom';
import { inventory } from '../scripts/simulator.js';
import { initPreview } from '../src/js/simulator-preview.js';

// linkedom needs a document wrapper for fragments; browsers add it automatically.
class PreviewParser extends DOMParser {
 parseFromString(html, type) {
  return super.parseFromString(/<html\b/i.test(html) ? html : `<html><head></head><body>${html}</body></html>`,type);
 }
}
async function render(search) {
 const {document}=parseHTML('<html><head></head><body><main data-view="main-view"><table><tbody><tr><td><div class="part_rows_container"></div></td></tr></tbody></table></main></body></html>');
 const replacements={document,DOMParser:PreviewParser,location:{search},fetch:async()=>({ok:true,json:async()=>inventory()})};
 const previous=Object.fromEntries(Object.keys(replacements).map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)]));
 try {
  Object.assign(globalThis,replacements);
  await initPreview();
  return document;
 } finally {
  for(const [key,descriptor] of Object.entries(previous)) {
   if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];
  }
 }
}

test('clean view assembles actual captured parts and moves modules into restored columns by default',async()=>{
 const data=inventory();
 const parts=data.capturedParts['main-view'].join(',');
 const document=await render(`?clean=1&labels=0&parts=${parts}`);
 assert.ok(document.body.classList.contains('sim-slate-behavior'));
 assert.ok(document.body.classList.contains('sim-clean'));
 assert.ok(!document.body.classList.contains('sim-labels'));
 for(const side of ['left','right']) {
  const column=document.getElementById(`${side}column`);
  assert.ok(column,`${side} destination restored`);
  const parts=[...document.querySelectorAll(`.part.${side}column`)];
  assert.ok(parts.length>0);
  for(const part of parts)assert.equal(part.parentElement,column);
 }
 assert.equal(document.querySelectorAll('footer').length,1);
});

test('explicit stack mode and deselected Scripts still disable DOM moves',async()=>{
 const data=inventory();
 const parts=data.capturedParts['main-view'];
 const stack=await render(`?clean=1&layout=stacked&parts=${parts.join(',')}`);
 assert.equal(stack.getElementById('leftcolumn'),null);
 const script=data.views.find(v=>v.slug==='main-view').modules.find(m=>m.order===133);
 const disabled=await render(`?clean=1&layout=behavior&parts=${parts.filter(id=>id!==script.partId).join(',')}`);
 assert.equal(disabled.getElementById('leftcolumn').children.length,0);
 assert.match(disabled.querySelector('.sim-behavior-report').textContent,/Select module 133/);
});

test('CSS column experiment stacks each side independently and keeps full-width parts between segments',async()=>{
 const modules=inventory().views.find(v=>v.slug==='main-view').modules;
 const selected=[5,6,55,56,62,67,69,109];
 const parts=modules.filter(module=>selected.includes(module.order)).map(module=>module.partId).join(',');
 const document=await render(`?clean=1&layout=columns&parts=${parts}`);
 const container=document.querySelector('.part_rows_container');
 const segments=[...container.querySelectorAll(':scope > .sim-column-segment')];
 assert.equal(segments.length,2);
 assert.deepEqual([...segments[0].querySelector('.sim-column-left').children].map(part=>Number(part.dataset.order)),[5,6,62]);
 assert.deepEqual([...segments[0].querySelector('.sim-column-right').children].map(part=>Number(part.dataset.order)),[55,56]);
 assert.equal(Number(container.children[1].dataset.order),67);
 assert.deepEqual([...segments[1].querySelector('.sim-column-left').children].map(part=>Number(part.dataset.order)),[69]);
 assert.deepEqual([...segments[1].querySelector('.sim-column-right').children].map(part=>Number(part.dataset.order)),[109]);
});

test('simulator stays stacked and loads no portal JS even with a behavior or columns URL',async()=>{
 const parts=inventory().capturedParts['main-view'].join(',');
 for(const layout of ['behavior','columns']) {
  const document=await render(`?layout=${layout}&parts=${parts}`);
  const container=document.querySelector('.part_rows_container');
  assert.equal(document.getElementById('leftcolumn'),null);
  assert.equal(container.classList.contains('sim-columns'),false);
  assert.equal(document.body.classList.contains('sim-slate-behavior'),false);
  assert.deepEqual([...container.children].map(part=>part.id),inventory().views.find(v=>v.slug==='main-view').modules.filter(m=>parts.split(',').includes(m.partId)).map(m=>m.partId));
  assert.equal(document.querySelector('script[src="/js/app.js"]'),null);
 }
});

test('portal stylesheet option applies in both stacked and clean views and is off by default',async()=>{
 for(const mode of ['', '&clean=1']) {
  const enabled=await render(`?parts=&styles=portal${mode}`);
  assert.equal(enabled.querySelectorAll('link[data-portal-style]').length,5);
  assert.equal(enabled.querySelector('script[src*="build-mobile-global"]'),null);
  const disabled=await render(`?parts=${mode}`);
  assert.equal(disabled.querySelectorAll('link[data-portal-style]').length,0);
 }
});

test('legacy preview keeps original head CSS, stylesheet links, inline styles, and header',async()=>{
 const main=inventory().views.find(v=>v.slug==='main-view');
 const parts=main.modules.filter(m=>[1,4,6].includes(m.order)).map(m=>m.partId).join(',');
 const legacy=await render(`?source=legacy&parts=${parts}`);
 assert.match(legacy.querySelector('style').textContent,/h1/);
 assert.ok(legacy.querySelector('link[href="https://enroll-northeastern-edu.cdn.technolutions.net/shared/build-fonts.css"]'));
 assert.equal(legacy.querySelector('.dashborder').getAttribute('style'),'padding: 0!important;');
 assert.ok(legacy.querySelector('nav.navbar'));
 assert.equal(legacy.querySelector('[data-shared="header"]'),null);
 assert.equal(legacy.querySelector('script,iframe,[onclick],[onchange]'),null);
 assert.ok(!legacy.body.classList.contains('sim-slate-behavior'));
 const sanitized=await render(`?source=sanitized&parts=${parts}`);
 assert.equal(sanitized.querySelector('style,link[rel="stylesheet"]'),null);
 const messagingPart=sanitized.getElementById(main.modules.find(m=>m.order===6).partId);
 assert.ok(messagingPart.querySelector('p'));
 assert.equal(messagingPart.querySelector('[style]'),null);
 assert.ok(sanitized.querySelector('[data-shared="header"]'));
});

test('legacy clean view uses original DOM/footer and the vanilla behavior, without legacy scripts',async()=>{
 const parts=inventory().capturedParts['main-view'].join(',');
 const document=await render(`?source=legacy&clean=1&parts=${parts}`);
 assert.ok(document.getElementById('leftcolumn').querySelector('.part.leftcolumn'));
 assert.ok(document.getElementById('rightcolumn').querySelector('.part.rightcolumn'));
 assert.equal(document.querySelectorAll('footer').length,1);
 assert.equal(document.querySelector('[data-shared]'),null);
 assert.equal(document.querySelector('script,iframe,[onclick],[onchange]'),null);
});


test('fallback grid targets sanitized columns only; legacy keeps Bootstrap layout',async()=>{
 const parts=inventory().capturedParts['main-view'].join(',');
 const selector='.sim-slate-behavior.sim-sanitized .bodybackground > .module-layout__group:has(> #leftcolumn)';
 const sanitized=await render(`?source=sanitized&clean=1&parts=${parts}`);
 assert.ok(sanitized.querySelector(selector));
 const legacy=await render(`?source=legacy&clean=1&parts=${parts}`);
 assert.equal(legacy.querySelector(selector),null);
 assert.ok(legacy.body.classList.contains('sim-legacy'));
 assert.ok(legacy.getElementById('leftcolumn').classList.contains('col-md-6'));
 assert.ok(legacy.getElementById('rightcolumn').classList.contains('col-md-6'));
 assert.equal(legacy.querySelector('.part_rows_container').classList.contains('sim-columns'),false);
});
