import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';

test('review toggles, copies identity, handles clipboard failure and unknown IDs, and preserves markup', async () => {
  const { document, window } = parseHTML('<html><body><div class="part col-left messaging-block" id="part_example"><div><p>Greetings <a href="/test">Link</a></p></div></div><div class="part" id="part_unknown">Other</div></body></html>');
  const part = document.getElementById('part_example');
  const original = part.outerHTML;
  part.getBoundingClientRect = () => ({ left: 10, top: 20, width: 300, height: 100 });
  document.getElementById('part_unknown').getBoundingClientRect = part.getBoundingClientRect;
  const storage = new Map();
  const script = readFileSync('src/js/module-review.js', 'utf8').replace('null; /* MODULE_REVIEW_CATALOG */', JSON.stringify({ part_example: { view: 'Main View', order: 8, name: 'Law welcome' } }) + ';');
  let copied;
  const clipboard = { writeText: async text => { copied = text; } };
  const context = { document, window, navigator: { clipboard }, Element: window.Element, sessionStorage: { getItem: key => storage.get(key), setItem: (key, value) => storage.set(key, value) } };
  runInNewContext(script, context);
  const shadow = document.getElementById('module-review-tools').shadowRoot;
  const button = shadow.querySelector('button');
  assert.equal(document.getElementById('module-review-tools').style.getPropertyValue('z-index'), '2147483647');
  assert.equal(shadow.querySelector('.copy').disabled, true);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  button.click();
  const search = shadow.querySelector('input');
  let scrolled = false;
  part.scrollIntoView = () => { scrolled = true; };
  search.value = '8';
  search.dispatchEvent(new window.Event('input'));
  assert.equal(shadow.querySelectorAll('.search-results button').length, 1);
  shadow.querySelector('.search-results button').click();
  assert.equal(scrolled, true);
  assert.equal(shadow.querySelector('code').textContent, 'part_example');
  search.value = 'law welcome';
  search.dispatchEvent(new window.Event('input'));
  assert.equal(shadow.querySelectorAll('.search-results button').length, 1);
  search.value = 'does not exist';
  search.dispatchEvent(new window.Event('input'));
  assert.match(shadow.querySelector('.search-status').textContent, /No matching/);
  // Resume the existing hover and pin checks from an unpinned state.
  button.click(); button.click();
  part.querySelector('a').dispatchEvent(new window.Event('pointerover', { bubbles: true }));
  assert.equal(shadow.querySelector('[role="status"]').textContent, 'Main View · 8. Law welcome');
  assert.equal(shadow.querySelector('code').textContent, 'part_example');
  assert.equal(shadow.querySelector('.outline').hidden, false);
  part.querySelector('p').click();
  part.dispatchEvent(new window.Event('pointerout', { bubbles: true }));
  document.getElementById('part_unknown').dispatchEvent(new window.Event('pointerover', { bubbles: true }));
  assert.equal(shadow.querySelector('code').textContent, 'part_example');
  assert.equal(shadow.querySelector('.outline').hidden, false);
  // The displayed identity remains available when moving to the copy control.
  document.body.dispatchEvent(new window.Event('pointerover', { bubbles: true }));
  shadow.querySelector('.copy').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copied, 'part_example');
  assert.equal(shadow.querySelector('.copy').getAttribute('aria-label'), 'Copy part ID');
  assert.equal(shadow.querySelector('.copy').parentElement.className, 'part-id');
  assert.equal(shadow.querySelector('.copy').textContent, '');
  assert.ok(shadow.querySelector('.copy svg'));
  assert.match(shadow.querySelector('.copy-status').textContent, /Copied/);
  clipboard.writeText = async () => { throw new Error('Denied'); };
  shadow.querySelector('.copy').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.match(shadow.querySelector('.copy-status').textContent, /copy it manually/);
  document.getElementById('part_unknown').dispatchEvent(new window.Event('focusin', { bubbles: true }));
  assert.equal(shadow.querySelector('code').textContent, 'part_example');
  document.getElementById('part_unknown').click();
  assert.match(shadow.querySelector('[role="status"]').textContent, /not in the current inventory/);
  const escape = new window.Event('keydown');
  escape.key = 'Escape'; document.dispatchEvent(escape);
  assert.equal(button.getAttribute('aria-pressed'), 'false');
  assert.equal(shadow.querySelector('.outline').hidden, true);
  assert.equal(part.outerHTML, original);
  runInNewContext(script, context);
  assert.equal(document.querySelectorAll('#module-review-tools').length, 1);
});

test('review shares live destinations, selects the current Slate view, and updates its new-tab link', async () => {
  const { liveViews } = await import('../src/js/live-views.js');
  const { document, window } = parseHTML('<html><body></body></html>');
  const script = readFileSync('src/js/module-review.js', 'utf8')
    .replace('[]; /* MODULE_REVIEW_VIEWS */', JSON.stringify(liveViews) + ';');
  // Linkedom omits the browser's select.value setter.
  const createElement = document.createElement.bind(document);
  const selectPrototype = Object.getPrototypeOf(createElement('select'));
  Object.defineProperty(selectPrototype, 'value', { configurable: true, get() { return this._value; }, set(value) { this._value = value; } });
  runInNewContext(script, {
    document, window: { location: { href: liveViews.find(view => view.id === 'letters').url }, addEventListener() {} },
    URL, Element: window.Element, sessionStorage: { getItem() {}, setItem() {} },
  });
  const shadow = document.getElementById('module-review-tools').shadowRoot;
  const picker = shadow.querySelector('.view-picker');
  const select = picker.querySelector('select');
  const link = picker.querySelector('a');
  assert.equal(picker.hidden, false);
  assert.equal(select.querySelectorAll('option').length, liveViews.length);
  assert.equal(select.value, 'letters');
  assert.equal(link.href, liveViews.find(view => view.id === 'letters').url);
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'noopener noreferrer');
  select.value = 'testing-fcechecklist';
  select.dispatchEvent(new window.Event('change'));
  assert.equal(link.href, liveViews.find(view => view.id === 'testing-fcechecklist').url);
  assert.match(select.lastElementChild.textContent, /inactive/);
});
