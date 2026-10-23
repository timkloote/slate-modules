import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanViewUrl } from '../src/js/clean-views.js';
import directory from '../src/views-index.11ty.js';
import { parseHTML } from 'linkedom';
import { inventory } from '../scripts/simulator.js';

test('bulk clean views include every audited view with defaults and per-view saved settings', () => {
  const { document } = parseHTML(directory());
  const views = JSON.parse(document.querySelector('[data-all-clean-views]').dataset.allCleanViews);
  assert.equal(views.length, inventory().views.length);
  const storage = { getItem: () => null };
  for (const view of views) {
    const url = new URL(cleanViewUrl(view, storage), 'https://example.com');
    assert.equal(url.pathname, `/views/${view.slug}/preview/`);
    assert.equal(url.searchParams.get('clean'), '1');
    assert.equal(url.searchParams.get('labels'), '0');
    assert.equal(url.searchParams.get('layout'), view.slug === 'main-view' ? 'behavior' : 'stacked');
    assert.equal(url.searchParams.get('parts'), view.parts.join(','));
  }
  const saved = { getItem: key => JSON.stringify(key.endsWith(':settings') ? { 'module-source': 'legacy', 'layout-mode': 'columns', 'class-mode': 'original' } : []) };
  const url = new URL(cleanViewUrl(views[0], saved), 'https://example.com');
  assert.equal(url.searchParams.get('parts'), '');
  assert.equal(url.searchParams.get('source'), 'legacy');
  assert.equal(url.searchParams.get('styles'), 'legacy');
  assert.equal(url.searchParams.get('layout'), 'columns');
  assert.equal(url.searchParams.get('classes'), 'original');
  assert.doesNotThrow(() => cleanViewUrl(views[0], { getItem() { throw new Error('Unavailable'); } }));
});
