import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';
const root='src/modules/fce-evaluation-status/';
test('tracker variants retain original cell counts, state classes and nested markup', () => {
 for(const file of readdirSync(root).filter(f=>/^\d+-tracker-/.test(f))) {
  const modern=parseHTML(readFileSync(root+file,'utf8')).document;
  const legacy=parseHTML(readFileSync('src/legacy/modules/fce-evaluation-status/'+file,'utf8')).document;
  const cells=[...modern.querySelectorAll('td')];
  assert.deepEqual(cells.map(c=>c.className), [...legacy.querySelectorAll('td')].map(c=>c.className),file);
  assert.deepEqual([...modern.querySelector('table').querySelectorAll('*')].map(n=>n.localName==='b'?'strong':n.localName),[...legacy.querySelector('table').querySelectorAll('*')].map(n=>n.localName==='b'?'strong':n.localName),file);
  for(const c of cells) { assert.match(c.textContent,/Credentials/); assert.match(c.getAttribute('aria-label'), /Completed|Current step|Upcoming/); }
  assert.equal(modern.querySelectorAll('[aria-current="step"]').length,cells.filter(c=>c.className.startsWith('current')).length);
 }
});
test('all active tracker descriptions use approved updated copy', () => {
 const expected={
  '08':'Your materials have been uploaded but have not yet been reviewed by FCE.',
  '09':'Your submitted materials are being processed for review.',
  '10':'Your credentials are currently under review.',
  '11':'Your Foreign Credential Evaluation is complete.',
  '13':'Your materials have been reviewed and you are required to take action.',
  '14':'Your submitted materials are being processed for review.',
  '15':'Your credentials are currently under review.',
  '16':'Your Foreign Credential Evaluation is complete.'
 };
 for(const [prefix,text] of Object.entries(expected)) {
  const file=readdirSync(root).find(f=>f.startsWith(prefix+'-'));
  assert.ok(readFileSync(root+file,'utf8').includes(text),file);
 }
});
