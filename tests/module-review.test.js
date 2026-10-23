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
  const button = shadow.querySelector('.review-toggle');
  assert.equal(document.getElementById('module-review-tools').style.getPropertyValue('z-index'), '2147483647');
  assert.equal(shadow.querySelector('.copy').disabled, true);
  assert.equal(button.getAttribute('aria-checked'), 'false');
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
  shadow.querySelector('.close-review').click(); button.click();
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
  assert.equal(button.getAttribute('aria-checked'), 'false');
  assert.equal(shadow.querySelector('.outline').hidden, true);
  assert.equal(part.outerHTML, original);
  runInNewContext(script, context);
  assert.equal(document.querySelectorAll('#module-review-tools').length, 1);
});

test('review dropdown selects the current Slate view and updates its new-tab link', async () => {
  const { liveViews } = await import('../src/js/live-views.js');
  const { document, window } = parseHTML('<html><body></body></html>');
  const script = readFileSync('src/js/module-review.js', 'utf8')
    .replace('[]; /* MODULE_REVIEW_VIEWS */', JSON.stringify(liveViews) + ';');
  // Linkedom omits the browser's select.value setter.
  const selectPrototype = Object.getPrototypeOf(document.createElement('select'));
  Object.defineProperty(selectPrototype, 'value', { configurable: true, get() { return this._value; }, set(value) { this._value = value; } });
  runInNewContext(script, {
    document, window: { location: { href: liveViews.find(view => view.id === 'letters').url }, addEventListener() {} },
    URL, Element: window.Element, sessionStorage: { getItem() {}, setItem() {} },
  });
  const shadow = document.getElementById('module-review-tools').shadowRoot;
  const picker = shadow.querySelector('.view-picker');
  const select = picker.querySelector('select');
  const link = picker.querySelector('a');
  assert.equal(picker.hidden, true);
  const toggle = shadow.querySelector('.review-toggle');
  const details = shadow.querySelector('.details');
  assert.equal(details.contains(picker), false);
  assert.equal(link.parentElement, select.parentElement);
  assert.equal(details.hidden, true);
  toggle.click();
  assert.equal(details.hidden, false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(toggle.hidden, true);
  assert.equal(document.getElementById('module-review-tools').hasAttribute('data-open'), true);
  assert.equal(shadow.querySelector('.panel-header strong').textContent, 'Module Review');
  assert.ok(shadow.querySelector('.search-field svg[aria-hidden="true"]'));
  assert.equal(shadow.querySelector('.search-field input').id, 'module-search');
  assert.equal(shadow.querySelector('.panel-header').hidden, false);
  assert.equal(picker.hidden, false);
  shadow.querySelector('.close-review').click();
  assert.equal(toggle.hidden, false);
  assert.equal(document.getElementById('module-review-tools').hasAttribute('data-open'), false);
  assert.equal(shadow.querySelector('.switch-label').textContent, 'Module Review: Off');
  assert.equal(shadow.querySelector('.panel-header').hidden, true);
  assert.equal(details.hidden, true);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
  assert.equal(picker.hidden, true);
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

test('review stays open in a new view tab and remembers closing it', () => {
  const saved = new Map();
  const script = readFileSync('src/js/module-review.js', 'utf8');
  function openView() {
    const { document, window } = parseHTML('<html><body></body></html>');
    const tabStorage = new Map();
    runInNewContext(script, {
      document, window, Element: window.Element,
      localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) },
      sessionStorage: { getItem: key => tabStorage.get(key) ?? null, setItem: (key, value) => tabStorage.set(key, value) },
    });
    return document.getElementById('module-review-tools').shadowRoot;
  }
  const first = openView();
  assert.equal(first.querySelector('.details').hidden, true);
  first.querySelector('.review-toggle').click();
  const next = openView();
  assert.equal(next.querySelector('.details').hidden, false);
  assert.equal(next.querySelector('.review-toggle').getAttribute('aria-checked'), 'true');
  next.querySelector('.close-review').click();
  assert.equal(openView().querySelector('.details').hidden, true);
});

test('review navigation stays in the simulator or current deployed Slate portal', async () => {
  const { liveViews } = await import('../src/js/live-views.js');
  const simulatorViews = [
    { id: 'main-view', name: 'Main View' },
    { id: 'fce-evaluation-status', name: 'FCE Evaluation Status' },
  ];
  function openAt(href) {
    const { document, window } = parseHTML('<html><body></body></html>');
    const prototype = Object.getPrototypeOf(document.createElement('select'));
    Object.defineProperty(prototype, 'value', { configurable: true, get() { return this._value; }, set(value) { this._value = value; } });
    const script = readFileSync('src/js/module-review.js', 'utf8')
      .replace('[]; /* MODULE_REVIEW_VIEWS */', JSON.stringify(liveViews) + ';')
      .replace('[]; /* MODULE_REVIEW_SIMULATOR_VIEWS */', JSON.stringify(simulatorViews) + ';');
    runInNewContext(script, {
      document, window: { location: { href }, addEventListener() {} }, URL,
      sessionStorage: { getItem() {}, setItem() {} },
    });
    const shadow = document.getElementById('module-review-tools').shadowRoot;
    const select = shadow.querySelector('select');
    return { select, change(value) {
      select.value = value;
      select.dispatchEvent(new window.Event('change'));
      return new URL(shadow.querySelector('.view-picker a').href);
    } };
  }
  for (const base of ['http://localhost:8080', 'https://example.github.io/slate-modules']) {
    const ui = openAt(`${base}/views/main-view/preview/?clean=1&parts=part_main&source=legacy&classes=original`);
    assert.equal(ui.select.querySelectorAll('option').length, 2);
    assert.equal(ui.select.value, 'main-view');
    const url = ui.change('fce-evaluation-status');
    assert.equal(url.href.startsWith(`${base}/views/fce-evaluation-status/preview/`), true);
    assert.equal(url.searchParams.get('parts'), null);
    assert.equal(url.searchParams.get('clean'), '1');
    assert.equal(url.searchParams.get('source'), 'legacy');
    assert.equal(url.searchParams.get('layout'), 'stacked');
  }
  for (const path of ['app_status_sandbox', 'app_status']) {
    const ui = openAt(`https://enroll.northeastern.edu/portal/${path}?cmd=letters&app=example#old`);
    assert.equal(ui.select.value, 'letters');
    const url = ui.change('information');
    assert.equal(url.pathname, `/portal/${path}`);
    assert.equal(url.searchParams.get('cmd'), 'information');
    assert.equal(url.searchParams.get('app'), 'example');
    assert.equal(url.hash, '');
    assert.equal(ui.change('main-view').searchParams.has('cmd'), false);
  }
});
