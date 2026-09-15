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
