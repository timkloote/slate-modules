import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';
import { component } from '../scripts/components.js';

const app = readFileSync(new URL('../src/js/grad-admissions.js', import.meta.url), 'utf8');

test('Slate export contains a single deferred app script', () => {
  const html = component('scripts.html');
  assert.equal((html.match(/<script\b/g) || []).length, 1);
  assert.match(html, /src="js\/grad-admissions.js" defer/);
});

test('app waits for markup, tolerates absent navigation, and loads libraries once in order', async () => {
  const scripts = [];
  let ready;
  const document = {
    readyState: 'loading', scripts,
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    addEventListener(event, handler) {
      assert.equal(event, 'DOMContentLoaded');
      ready = handler;
    },
    createElement() {
      const handlers = {};
      return { addEventListener(event, handler) { handlers[event] = handler; }, handlers };
    },
    head: { append(script) { scripts.push(script); script.handlers.load(); } },
  };
  runInNewContext(app, { document, console });
  assert.equal(scripts.length, 0);
  ready();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(scripts.length, 2);
  assert.match(scripts[0].src, /global-elements/);
  assert.match(scripts[1].src, /kernl-ui/);
  document.readyState = 'complete';
  runInNewContext(app, { document, console });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(scripts.length, 2);
});

test('production app groups columns, preserves widgets and full-width order, and is repeatable', () => {
  const { document } = parseHTML(`<html><head></head><body>
    <div class="part_rows_container">
      <div class="part portal-header" id="header"></div>
      <div class="part col-left" id="left"><input value="saved"></div>
      <div class="part col-right" id="right"></div>
      <div class="part col-left" id="left2"></div>
      <div class="part full-width col-left" id="wide"></div>
      <div class="part col-right" id="right2"></div>
      <div class="part portal-footer" id="footer"></div>
    </div>
  </body></html>`);
  const input = document.querySelector('input');
  let clicks = 0;
  input.addEventListener('click', () => clicks++);
  // Libraries are already loaded; exercise only local startup.
  for (const src of ['https://global-packages.cdn.northeastern.edu/global-elements/dist/js/index.umd.js', 'https://global-packages.cdn.northeastern.edu/kernl-ui/dist/js/index.umd.js']) {
    const script = document.createElement('script'); script.src = src; document.head.append(script);
  }
  Object.defineProperty(document, 'scripts', { get: () => [...document.querySelectorAll('script')] });
  const run = () => runInNewContext(app, { document, console });
  run();
  const container = document.querySelector('.part_rows_container');
  assert.deepEqual([...container.children].map(node => node.id || node.className), ['header', 'portal-columns', 'wide', 'portal-columns', 'footer']);
  assert.deepEqual([...container.querySelector('.portal-columns__left').children].map(node => node.id), ['left', 'left2']);
  assert.equal(document.getElementById('right').parentElement.className, 'portal-columns__right');
  assert.equal(document.querySelector('input'), input);
  input.click();
  assert.equal(clicks, 1);
  const html = container.innerHTML;
  run();
  assert.equal(container.innerHTML, html);
});
