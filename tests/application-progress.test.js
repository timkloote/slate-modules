import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { parseHTML } from 'linkedom';

test('application progress drafts have mutually exclusive states and accessible current steps', () => {
 const files = readdirSync('src/modules/main-view').filter(file => file.startsWith('00-')).sort();
 assert.equal(files.length, 3);
 for (const [stage, file] of files.entries()) {
  const html = readFileSync(`src/modules/main-view/${file}`, 'utf8');
  const { document } = parseHTML(html);
  const cells = [...document.querySelectorAll('td')];
  assert.equal(cells.length, 3);
  assert.equal(document.querySelectorAll('[aria-current="step"]').length, 1);
  cells.forEach((cell, i) => {
   assert.equal(cell.className, i < stage ? 'complete' : i === stage ? 'current' : 'not_current');
   assert.match(cell.getAttribute('aria-label'), /Completed|Current step|Upcoming/);
  });
  assert.equal(document.querySelector('table').getAttribute('aria-label'), 'Application progress');
  assert.ok(document.querySelector('p').textContent.length > 30);
  assert.equal(document.querySelectorAll('script').length, 0);
 }
});
