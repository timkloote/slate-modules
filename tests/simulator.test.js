import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { inventory, escapeHtml } from '../scripts/simulator.js';
import { component } from '../scripts/components.js';

test('audit maps every imported file exactly once and keeps IDs and ordering', () => {
 const data=inventory();
 const audit=JSON.parse(readFileSync('src/simulator/audit.json','utf8'));
 const modules=data.views.flatMap(v=>v.modules);
 assert.equal(modules.length, audit.modules.length);
 assert.equal(new Set(modules.map(m=>m.partId)).size,modules.length);
 const files=readdirSync('src/modules',{withFileTypes:true}).filter(d=>d.isDirectory()).flatMap(d=>readdirSync(`src/modules/${d.name}`).filter(f=>f.endsWith('.html')).map(f=>`src/modules/${d.name}/${f}`));
 assert.deepEqual(modules.map(m=>m.source).sort(),files.sort());
 for(const view of data.views) {
  assert.deepEqual(view.modules.map(m=>m.order),view.modules.map(m=>m.order).sort((a,b)=>a-b));
  for(const m of view.modules) {
   assert.match(m.partId,/^part_[a-f0-9-]{36}$/);
   assert.equal(m.sourceHtml,readFileSync(m.source,'utf8'));
   assert.equal(m.needsCapture,m.type!=='Static Content'&&!m.hasFixture);
   const row=audit.modules.find(r=>r.partId===m.partId);
   for(const key of Object.keys(row))assert.equal(m[key],row[key]);
  }
 }
});

test('captured subset resolves only to existing Main View parts', () => {
 const {views,capturedParts}=inventory();
 const main=views.find(v=>v.slug==='main-view');
 assert.equal(capturedParts['main-view'].length,15);
 for(const id of capturedParts['main-view'])assert.ok(main.modules.some(m=>m.partId===id));
});

test('header/footer substitutions are conditional and preserve source Liquid', () => {
 const {views}=inventory();
 for(const view of views)for(const m of view.modules) {
  if(m.replacement&&!m.hasFixture)assert.equal(m.html,component(`${m.replacement}.html`).replaceAll('src="images/','src="/images/'));
  if(!m.replacement&&!m.hasFixture)assert.equal(m.html,m.sourceHtml);
 }
 assert.equal(views.find(v=>v.slug==='fce-evaluation-status').modules.some(m=>m.replacement),false);
 assert.equal(escapeHtml('<script>"&'), '&lt;script&gt;&quot;&amp;');
});
