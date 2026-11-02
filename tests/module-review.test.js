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
    for (const route of ['main-view', 'main-view/', 'main-view/index.html', 'main-view/preview', 'main-view/preview/', 'main-view/preview/index.html']) {
    const ui = openAt(`${base}/views/${route}?clean=1&parts=part_main&source=legacy&classes=original`);
    assert.equal(ui.select.querySelectorAll('option').length, 2);
    assert.equal(ui.select.value, 'main-view');
    const url = ui.change('fce-evaluation-status');
    assert.equal(url.href.startsWith(`${base}/views/fce-evaluation-status/preview/`), true);
    assert.equal(url.searchParams.get('parts'), null);
    assert.equal(url.searchParams.get('clean'), '1');
    assert.equal(url.searchParams.get('source'), 'legacy');
    assert.equal(url.searchParams.get('layout'), 'stacked');
    }
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

test('review tools drag, retain their position when toggled, and stay inside the viewport', () => {
  const { document, window } = parseHTML('<html><body></body></html>');
  window.innerWidth = 1000;
  window.innerHeight = 800;
  runInNewContext(readFileSync('src/js/module-review.js', 'utf8'), { document, window });
  const host = document.getElementById('module-review-tools');
  const shadow = host.shadowRoot;
  const handle = shadow.querySelector('.drag-handle');
  host.getBoundingClientRect = () => ({ left: parseFloat(host.style.left) || 16, top: parseFloat(host.style.top) || 700, width: 360, height: 100 });
  let captured = false;
  handle.setPointerCapture = () => { captured = true; };
  handle.hasPointerCapture = () => captured;
  handle.releasePointerCapture = () => { captured = false; };
  function pointer(type, x, y) {
    const event = new window.Event(type);
    Object.assign(event, { button: 0, pointerId: 1, clientX: x, clientY: y });
    handle.dispatchEvent(event);
  }
  pointer('pointerdown', 20, 710);
  pointer('pointermove', 220, 410);
  assert.equal(host.style.left, '216px');
  assert.equal(host.style.top, '400px');
  assert.equal(shadow.querySelector('.review-toggle').getAttribute('aria-checked'), 'false');
  pointer('pointerup', 220, 410);
  assert.equal(captured, false);
  shadow.querySelector('.review-toggle').click();
  assert.equal(host.style.left, '216px');
  shadow.querySelector('.close-review').click();
  assert.equal(host.style.top, '400px');
  pointer('pointerdown', 220, 410);
  pointer('pointermove', 2000, -1000);
  assert.equal(host.style.left, '640px');
  assert.equal(host.style.top, '0px');
  pointer('pointercancel', 2000, -1000);
  pointer('pointermove', 300, 300);
  assert.equal(host.style.left, '640px');
  const key = new window.Event('keydown');
  key.key = 'ArrowLeft';
  handle.dispatchEvent(key);
  assert.equal(host.style.left, '630px');
});

test('open review resizes from its corner and remembers width when reopened', () => {
  const { document, window } = parseHTML('<html><body></body></html>');
  window.innerWidth = 1000;
  window.innerHeight = 800;
  runInNewContext(readFileSync('src/js/module-review.js', 'utf8'), { document, window });
  const host = document.getElementById('module-review-tools');
  const shadow = host.shadowRoot;
  host.getBoundingClientRect = () => ({ left: 16, top: 100, width: parseFloat(host.style.width) || 220, height: 500 });
  const corner = shadow.querySelector('.resize-handle');
  let captured = false;
  corner.setPointerCapture = () => { captured = true; };
  corner.hasPointerCapture = () => captured;
  corner.releasePointerCapture = () => { captured = false; };
  function pointer(type, x) {
    const event = new window.Event(type);
    Object.assign(event, { button: 0, pointerId: 2, clientX: x });
    corner.dispatchEvent(event);
  }
  assert.equal(corner.hidden, true);
  shadow.querySelector('.review-toggle').click();
  assert.equal(corner.hidden, false);
  pointer('pointerdown', 376);
  pointer('pointermove', 576);
  assert.equal(host.style.width, '560px');
  pointer('pointerup', 576);
  assert.equal(captured, false);
  shadow.querySelector('.close-review').click();
  assert.equal(corner.hidden, true);
  shadow.querySelector('.review-toggle').click();
  assert.equal(host.style.width, '560px');
  pointer('pointerdown', 576);
  pointer('pointermove', 2000);
  assert.equal(host.style.width, '968px');
  pointer('pointermove', -2000);
  assert.equal(host.style.width, '280px');
  pointer('pointercancel', -2000);
  pointer('pointermove', 900);
  assert.equal(host.style.width, '280px');
  const key = new window.Event('keydown');
  key.key = 'ArrowRight';
  corner.dispatchEvent(key);
  assert.equal(host.style.width, '290px');
});

test('cloned Main View IDs resolve original identities for inspect, copy, and search without changing DOM IDs', async () => {
  const { moduleReviewCatalog } = await import('../scripts/module-review-catalog.js');
  const { modules } = JSON.parse(readFileSync('src/simulator/audit.json', 'utf8'));
  const { aliases, unmapped, additionalModules = [] } = JSON.parse(readFileSync('src/simulator/module-review-aliases.json', 'utf8'));
  const catalog = moduleReviewCatalog([...modules, ...additionalModules], aliases);
  const unsubmitted = catalog['part_5e023fe5-c358-4635-9e94-806426eb8b13'];
  assert.equal(unsubmitted.view, 'Unsubmitted Applications');
  assert.equal(unsubmitted.name, 'Application Selector');
  assert.equal(unsubmitted.originalPartId, undefined);
  assert.equal(Object.keys(aliases).length, 181);
  assert.equal(new Set(Object.values(aliases)).size, 181);
  assert.equal(unmapped.length, 1);
  for (const [clone, original] of Object.entries(aliases)) {
    assert.equal(catalog[clone].view, catalog[original].view);
    assert.equal(catalog[clone].name, catalog[original].name);
    assert.equal(catalog[clone].originalPartId, original);
  }
  const enrollment = Object.keys(aliases).filter(clone => catalog[clone].view === 'Enrollment  Module');
  assert.deepEqual(enrollment.map(clone => catalog[clone].order), [1, 2, 3, 4, 5]);
  assert.equal(catalog['part_d71606b7-3e85-4470-aebc-f7c6bc81686f'].originalPartId, 'part_dfe41bc1-2cc0-4778-a32d-ffa1f8531743');
  const fce = Object.keys(aliases).filter(clone => catalog[clone].view === 'FCE Evaluation Status');
  assert.deepEqual(fce.map(clone => catalog[clone].order), Array.from({ length: 24 }, (_, i) => i + 1).filter(order => order !== 19));
  assert.equal(catalog['part_cbe79464-d5a0-4a40-a11f-b400740d160f'].originalPartId, 'part_b6ca4f02-158c-4a55-b4ab-efffebac58ee');
  assert.equal(catalog['part_7250f2e2-a751-481e-98b4-af7ab957a618'].order, 6);
  assert.equal(catalog['part_b0818bc7-ed61-4ba1-9ed0-e85d685870f0'].order, 18);
  assert.equal(catalog['part_c398c17e-7651-456e-b0ca-7ff79a2e1054'].originalPartId, 'part_2ec5856b-a01a-4549-adeb-e55cbc26f6fd');
  assert.equal(catalog['part_4f3c7a4f-d21a-47cd-939e-8fe8d2248db2'].originalPartId, 'part_62ab62e5-0524-49a2-9924-65d2bd729505');
  assert.equal(catalog['part_c398c17e-7651-456e-b0ca-7ff79a2e1054'].view, 'FCE Updates - Temp Message');
  const information = Object.keys(aliases).filter(clone => catalog[clone].view === 'Information');
  assert.deepEqual(information.map(clone => catalog[clone].order), [1, 2, 3, 4, 5]);
  assert.equal(catalog['part_64acebd1-5b83-4bac-afd5-91e2b54c6d90'].originalPartId, 'part_f987738a-63c8-455e-a77d-6592e9f82b3a');
  assert.equal(catalog['part_570f652a-b72e-414b-ad9f-907197a6adc6'].originalPartId, 'part_bdd0cd2c-3fcb-4b91-a688-5240f7cc9895');
  const letters = Object.keys(aliases).filter(clone => catalog[clone].view === 'Letters');
  assert.deepEqual(letters.map(clone => catalog[clone].order), [1, 2, 3, 4, 5]);
  assert.equal(catalog['part_093956eb-c4ab-4e44-8ebe-2f60b6f4eb82'].originalPartId, 'part_3f2442e6-56d0-4f2a-bfbb-62a534a2d6f6');
  const options = Object.keys(aliases).filter(clone => catalog[clone].view === 'Options');
  assert.deepEqual(options.map(clone => catalog[clone].order), [1, 2, 3, 4, 5, 8, 9, 12, 13, 14]);
  assert.equal(catalog['part_e1e007d9-d15c-4984-8811-c1763632bc57'].originalPartId, 'part_b7660575-3aeb-4dae-9cb9-a5842c5fb1b5');
  const transactions = Object.keys(aliases).filter(clone => catalog[clone].view === 'Transactions');
  assert.deepEqual(transactions.map(clone => catalog[clone].order), [1, 2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 15, 18, 16, 17]);
  assert.equal(catalog['part_27616a39-29a8-4468-b549-d5ef64f8d88f'].originalPartId, 'part_45a0a61b-84af-4743-9c0f-13be7f04a167');
  assert.equal(catalog['part_ffb02451-b813-4c45-a8b2-f874608baaf5'].originalPartId, 'part_b8f2b3d9-1ab3-471d-b718-ae1ccfef614d');
  const materials = Object.keys(aliases).filter(clone => catalog[clone].view === 'Materials/Checklist');
  assert.deepEqual(materials.map(clone => catalog[clone].order), [1, 2, 3, 4, 5, 6, 7]);
  assert.equal(catalog['part_84879a8d-3d03-429e-af39-9e1c2cb1239f'].originalPartId, 'part_8877aec9-c0c2-412a-920a-26f8fd9c44ab');
  assert.equal(catalog['part_bcc7a0c3-64a8-44a4-993c-0c2e17dddbe9'].originalPartId, 'part_fd0bf798-010e-4727-8ded-2bdd55db1131');
  // Same-name variants must retain their distinct inventory identities.
  assert.equal(catalog['part_ac3a76a1-55f1-4555-ab2e-d6442119c5b4'].order, 48);
  assert.equal(catalog['part_f8960b27-0606-4cbe-8bf8-969b7cf191bc'].order, 49);
  assert.equal(catalog['part_571cedc3-25d6-41b6-961a-4e28a767d9ed'].order, 72);
  assert.equal(catalog['part_a9ce89ca-8c2e-4d4b-a22a-fb21b04cacd1'].order, 73);
  const clone = 'part_ac3a76a1-55f1-4555-ab2e-d6442119c5b4';
  const original = aliases[clone];
  const { document, window } = parseHTML(`<html><body><div class="part" id="${clone}">Deposit</div><div class="part" id="${original}">Original</div></body></html>`);
  const part = document.getElementById(clone);
  const markup = part.outerHTML;
  part.getBoundingClientRect = () => ({ left: 15, top: 25, width: 200, height: 80 });
  document.getElementById(original).getBoundingClientRect = part.getBoundingClientRect;
  let copied;
  runInNewContext(readFileSync('src/js/module-review.js', 'utf8').replace('null; /* MODULE_REVIEW_CATALOG */', JSON.stringify(catalog) + ';'), {
    document, window, Element: window.Element, navigator: { clipboard: { async writeText(value) { copied = value; } } },
  });
  const shadow = document.getElementById('module-review-tools').shadowRoot;
  shadow.querySelector('.review-toggle').click();
  part.click();
  assert.equal(shadow.querySelector('.module-name').textContent, 'Main View · 48. Pay Deposit CTA');
  assert.equal(shadow.querySelector('code').textContent, original);
  assert.equal(shadow.querySelector('.clone-id').textContent, `Clone part ID: ${clone}`);
  assert.equal(shadow.querySelector('.outline').style.left, '15px');
  shadow.querySelector('.copy').click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(copied, original);
  const search = shadow.querySelector('input');
  for (const [query, count] of [[clone, 1], [original, 2], ['48', 2], ['Pay Deposit CTA', 2]]) {
    search.value = query;
    search.dispatchEvent(new window.Event('input'));
    assert.equal(shadow.querySelectorAll('.search-results button').length, count);
  }
  let scrolled = false;
  part.scrollIntoView = () => { scrolled = true; };
  shadow.querySelector('.search-results button').click();
  assert.equal(scrolled, true);
  document.getElementById(original).click();
  assert.equal(shadow.querySelector('.clone-id').hidden, true);
  assert.equal(shadow.querySelector('code').textContent, original);
  assert.equal(part.outerHTML, markup);
  assert.throws(() => moduleReviewCatalog(modules, { part_clone: 'part_missing' }), /Unknown original/);
  assert.throws(() => moduleReviewCatalog(modules, { [original]: original }), /Unknown original|conflicts/);
});
