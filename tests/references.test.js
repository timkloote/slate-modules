import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import render from '../src/references.11ty.js';
import { filterReferences, initReferences } from '../src/js/references.js';
const pages = JSON.parse(readFileSync('src/references/catalog.json', 'utf8'));
test('all 40 references include original screenshots and thumbnails', () => {
 assert.equal(pages.length, 40);
 assert.equal(new Set(pages.map(p => p.id)).size, 40);
 for (const p of pages) {
  assert.ok(existsSync(`src${p.thumbnail}`));
  const png = readFileSync(`src${p.screenshot}`);
  assert.equal(png.readUInt32BE(16), 1440);
  assert.equal(png.readUInt32BE(20), p.height);
 }
});
test('reference search includes section headings and combines page type', () => {
 const p = pages.find(p => p.headings.length > 1);
 assert.ok(filterReferences(pages, p.headings[1], p.category).includes(p));
 assert.equal(filterReferences(pages, 'nonexistent-phrase-xyz', '').length, 0);
});
test('reference viewer supports deep links, navigation, width and empty searches', () => {
 const { document } = parseHTML(render());
 const category = document.getElementById('reference-category');
 Object.defineProperty(category, 'value', { value: '', writable: true });
 const size = document.getElementById('reference-size');
 Object.defineProperty(size, 'value', { value: 'fit', writable: true });
 let updated;
 const win = { location: { href: `https://example.test/references/?page=${pages[1].id}` }, history: { replaceState(a,b,url) { updated = url; } } };
 initReferences(pages, document, win);
 assert.equal(document.getElementById('reference-image').getAttribute('src'), pages[1].screenshot);
 document.getElementById('reference-next').click();
 assert.equal(updated.searchParams.get('page'), pages[2].id);
 size.value = '1440'; size.dispatchEvent(new document.defaultView.Event('change'));
 assert.equal(document.getElementById('reference-image').style.width, '1440px');
 const search = document.getElementById('reference-search');
 search.value = 'nonexistent-phrase-xyz'; search.dispatchEvent(new document.defaultView.Event('input'));
 assert.match(document.getElementById('reference-count').textContent, /0 of 40/);
 assert.ok(document.getElementById('reference-next').disabled);
 assert.ok([...document.querySelectorAll('[data-reference]')].every(c => c.hidden));
});
