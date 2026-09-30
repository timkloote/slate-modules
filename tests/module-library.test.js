import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML, DOMParser } from 'linkedom';
import { inventory } from '../scripts/simulator.js';
import { catalogModules, componentClasses, filterModules, relatedModules } from '../src/js/module-catalog.js';
import { initModulePreview, moduleVisibilityNote } from '../src/js/module-preview.js';
import { initModuleLibrary, statusBadge } from '../src/js/module-library.js';
import libraryPage from '../src/modules-index.11ty.js';
import previewPage from '../src/module-preview.11ty.js';
import { portalStylesheets } from '../src/js/portal-styles.js';

class PreviewParser extends DOMParser {
  parseFromString(html, type) { return super.parseFromString(/<html\b/i.test(html) ? html : `<html><head></head><body>${html}</body></html>`, type); }
}
async function withGlobals(replacements, callback) {
  const before = Object.fromEntries(Object.keys(replacements).map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  try {
    for (const [key, value] of Object.entries(replacements)) Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    return await callback();
  } finally {
    for (const [key, descriptor] of Object.entries(before)) if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
const data = inventory();
const modules = catalogModules(data.views);

test('updated names and reordered workbook rows retain original modern and legacy source identities', () => {
  const transactions = data.views.find(view => view.slug === 'transactions').modules;
  assert.equal(transactions[0].name, 'Document Head');
  assert.match(transactions[0].source, /02-styles\.html$/);
  assert.match(transactions[0].legacySource, /02-styles\.html$/);
  assert.equal(transactions[1].name, 'Header');
  assert.match(transactions[1].source, /01-header-deposited\.html$/);
  assert.equal(transactions[1].replacement, 'header');
  assert.equal(modules.find(module => module.legacyName === 'DOM').replacement, 'footer');
  assert.equal(modules.length, 217);
});

test('related modules cross views using component classes, not layout or script markers', () => {
  const selected = modules.find(module => module.newClasses === 'col-left messaging-block');
  const matches = relatedModules(selected, modules);
  assert.ok(matches.length > 5);
  assert.ok(matches.some(({ module }) => module.viewSlug !== selected.viewSlug));
  assert.ok(matches.every(({ module }) => module.partId !== selected.partId && componentClasses(module).includes('messaging-block')));
  assert.deepEqual(relatedModules({ partId: 'a', name: 'Alpha', newClasses: 'col-left has-js' }, [{ partId: 'b', name: 'Beta', newClasses: 'col-left has-js' }]), []);
  assert.equal(filterModules(modules, { query: 'Document Head', view: 'transactions' }).length, 1);
  assert.ok(filterModules(modules, { query: 'Styles', view: 'transactions' }).some(module => module.name === 'Document Head'));
});

async function preview(module, source, fixtureData = data) {
  const { document } = parseHTML(previewPage());
  const reports = [];
  await withGlobals({ document, DOMParser: PreviewParser, location: { search: `?part=${module.partId}&source=${source}`, origin: 'http://localhost' }, parent: { postMessage: report => reports.push(report) }, fetch: async () => ({ ok: true, json: async () => fixtureData }) }, initModulePreview);
  return { document, reports };
}

test('legacy and modern previews load isolated style environments and exactly one selected part', async () => {
  const module = modules.find(module => module.viewSlug === 'main-view' && module.order === 10);
  const legacy = await preview(module, 'legacy');
  const modern = await preview(module, 'modern');
  for (const { document } of [legacy, modern]) {
    assert.equal(document.querySelectorAll('.part_rows_container > .part').length, 1);
    assert.ok(document.getElementById(module.partId));
    assert.deepEqual([...document.querySelectorAll('link[data-portal-style]')].map(link => link.getAttribute('href')), portalStylesheets);
    assert.equal(document.querySelector('.part script'), null);
  }
  assert.equal(legacy.document.querySelector('link[href="/css/grad-admissions.css"]'), null);
  assert.ok(legacy.document.querySelector('link[href*="bootstrap"]'));
  assert.ok(legacy.document.querySelector('style'));
  assert.ok(legacy.document.getElementById(module.partId).classList.contains('leftcolumn'));
  assert.ok(modern.document.querySelector('link[href="/css/grad-admissions.css"]'));
  assert.equal(modern.document.querySelector('link[href*="bootstrap"]'), null);
  assert.equal(modern.document.querySelector('style'), null);
  assert.ok(modern.document.getElementById(module.partId).classList.contains('col-left'));
  assert.match(legacy.reports.at(-1).inherited[0], /01-styles/);
});

test('module preview preserves inert form markup and gives explicit missing-widget feedback', async () => {
  const module = { partId: 'part-test', name: 'Test', type: 'Static Content', originalClasses: 'old', newClasses: 'new', source: 'test.html', legacySource: 'legacy.html', html: '<form action="/submit"><input value="keep"><button onclick="alert(1)">Go</button><script>alert(1)</script></form>', legacyHtml: '', needsCapture: false };
  const fixtureData = { views: [{ modules: [module] }] };
  const { document } = await preview(module, 'modern', fixtureData);
  assert.equal(document.querySelector('form').getAttribute('action'), null);
  assert.equal(document.querySelector('button').getAttribute('onclick'), null);
  assert.equal(document.querySelector('.part script'), null);
  assert.ok(document.querySelector('input').disabled);
  const widget = modules.find(module => module.needsCapture);
  const missing = await preview(widget, 'modern');
  assert.match(missing.document.querySelector('.part').textContent, /rendered markup is not available/);
});

test('library deep links, search, next navigation, related links, code, and width controls work together', async () => {
  const { document, Event } = parseHTML(libraryPage());
  for (const select of document.querySelectorAll('select')) {
    let value = select.querySelector('option')?.value || '';
    Object.defineProperty(select, 'value', { get: () => value, set: next => { value = [...select.options].some(option => option.value === next) ? next : ''; } });
  }
  const selected = modules.find(module => module.viewSlug === 'main-view' && module.order === 10);
  const locations = [];
  const events = {};
  await withGlobals({ document, window: { addEventListener(type, handler) { events[type] = handler; } }, location: { search: `?part=${selected.partId}&width=390`, pathname: '/modules/' }, history: { replaceState: (_, __, url) => locations.push(url) }, fetch: async () => ({ ok: true, json: async () => data }) }, async () => {
    await initModuleLibrary();
    const get = id => document.getElementById(id);
    assert.equal(get('module-title').textContent, selected.name);
    assert.equal(get('modern-code').textContent, selected.sourceHtml);
    assert.equal(get('legacy-code').textContent, selected.legacyHtml);
    assert.equal(get('modern-preview').style.width, '390px');
    assert.match(get('legacy-preview').src, /source=legacy/);
    const report = { type: 'module-preview', partId: selected.partId, mode: 'legacy', visibility: 'Hidden by CSS. Choose Desktop · 1200px.', suggestedWidth: '1200', notes: [], styles: [], inherited: [], inlineStyles: 0 };
    events.message({ data: report, source: get('legacy-preview').contentWindow });
    assert.equal(get('legacy-visibility').hidden, false);
    assert.match(get('legacy-resize').textContent, /Desktop/);
    get('legacy-resize').click();
    assert.equal(get('module-width').value, '1200');
    assert.equal(get('legacy-preview').style.width, '1200px');
    assert.equal(get('modern-preview').style.width, '1200px');
    events.message({ data: { ...report, visibility: '', suggestedWidth: '' }, source: get('legacy-preview').contentWindow });
    assert.equal(get('legacy-visibility').hidden, true);
    get('catalog-search').value = 'col-left messaging-block';
    get('catalog-search').dispatchEvent(new Event('input'));
    assert.ok(get('catalog-list').querySelectorAll('a').length > 1);
    get('module-next').click();
    assert.notEqual(get('module-title').textContent, selected.name);
    const related = get('related-modules').querySelector('a');
    const target = related.dataset.part;
    related.click();
    assert.equal(get('module-identity').textContent, target);
    assert.match(locations.at(-1), new RegExp(target));
    get('catalog-search').value = 'nothing matches this module';
    get('catalog-search').dispatchEvent(new Event('input'));
    assert.match(get('catalog-list').textContent, /No matching/);
    assert.ok(get('module-next').disabled);
  });
});


test('audit badges distinguish active and inactive modules with text and color classes', () => {
  const { document } = parseHTML('<html><body></body></html>');
  for (const status of ['Active', 'Inactive']) {
    const badge = statusBadge(document, status);
    assert.equal(badge.textContent, status);
    assert.ok(badge.classList.contains(`module-status--${status.toLowerCase()}`));
  }
});

test('Military Checklist keeps legacy desktop behavior and explains a hidden preview', async () => {
  const module = modules.find(module => module.viewSlug === 'main-view' && module.order === 108);
  const { document } = await preview(module, 'legacy');
  const part = document.getElementById(module.partId);
  assert.equal(module.status, 'Inactive');
  assert.match(part.textContent, /U.S. Military Applicants/);
  assert.ok(part.classList.contains('desktop'));
  assert.match(moduleVisibilityNote(part, () => ({ display: 'none' }), 700), /Desktop · 1200px/);
  assert.equal(moduleVisibilityNote(part, () => ({ display: 'block', visibility: 'visible' }), 1200), '');
});


test('module links open real destinations while Liquid and executable links stay disabled', async () => {
  const module = { partId: 'links', name: 'Links', type: 'Static Content', originalClasses: '', newClasses: '', source: 'links.html', needsCapture: false,
    html: '<a href="https://www.northeastern.edu/">External</a><a href="?cmd=options">Options</a><a href="/account/password">Account</a><a href="mailto:test@example.com">Email</a><a href="{{ link }}">Liquid</a><a href="javascript:alert(1)">Script</a>' };
  const { document } = await preview(module, 'modern', { views: [{ modules: [module] }] });
  const links = [...document.querySelectorAll('.part a')];
  assert.equal(links[0].href, 'https://www.northeastern.edu/');
  assert.equal(links[1].href, 'https://enroll.northeastern.edu/portal/app_status_sandbox?cmd=options');
  assert.equal(links[2].href, 'https://enroll.northeastern.edu/account/password');
  assert.equal(links[3].href, 'mailto:test@example.com');
  for (const link of links.slice(0, 4)) {
    assert.equal(link.target, '_blank');
    assert.equal(link.rel, 'noopener noreferrer');
  }
  assert.equal(links[4].getAttribute('href'), null);
  assert.match(links[4].title, /Liquid/);
  assert.equal(links[5].getAttribute('href'), null);
});
