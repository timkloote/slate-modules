import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { component } from '../scripts/components.js';

const app = readFileSync(new URL('../src/js/app.js', import.meta.url), 'utf8');

test('Slate export contains a single deferred app script', () => {
  const html = component('scripts.html');
  assert.equal((html.match(/<script\b/g) || []).length, 1);
  assert.match(html, /src="js\/app.js" defer/);
});

test('app waits for markup, tolerates absent navigation, and loads libraries once in order', async () => {
  const scripts = [];
  let ready;
  const document = {
    readyState: 'loading', scripts,
    querySelector: () => null,
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
