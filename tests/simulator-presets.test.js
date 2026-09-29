import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { parseHTML } from 'linkedom';
import Views from '../src/views.11ty.js';

const script = readFileSync(new URL('../src/js/simulator.js', import.meta.url), 'utf8');

for (const slug of ['main-view', 'information']) {
  test(`presets apply, restore, and recognize custom settings in ${slug}`, async () => {
    const view = { slug, name: slug, modules: [] };
    const saved = new Map();
    async function open() {
      const { document, Event } = parseHTML(new Views().render({ view }));
      // Supply browser select behavior missing from linkedom.
      for (const select of document.querySelectorAll('select')) {
        let value = select.querySelector('option[selected]')?.value || select.querySelector('option')?.value || '';
        Object.defineProperty(select, 'value', { get: () => value, set: next => {
          value = [...select.options].some(option => option.value === next) ? next : '';
        } });
        select.add = option => select.append(option);
      }
      function Option(label, value) {
        const option = document.createElement('option');
        option.textContent = label;
        option.value = value;
        return option;
      }
      await runInNewContext(script.replace('if (workspace) initSimulator().catch', 'if (false) initSimulator().catch') + '\ninitSimulator();', {
        document, Option, URLSearchParams,
        fetch: async () => ({ ok: true, json: async () => ({ views: [view], capturedParts: {} }) }),
        localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) },
      });
      const get = id => document.getElementById(id);
      const change = (id, value) => { get(id).value = value; get(id).dispatchEvent(new Event('change')); };
      return { get, change };
    }
    for (const preset of ['redesign', 'legacy']) {
      const { get, change } = await open();
      change('view-preset', preset);
      assert.equal(get('view-preset').value, preset);
      assert.equal(get('layout-mode').value, slug === 'main-view' ? 'behavior' : 'stacked');
      assert.equal(get('module-source').value, preset === 'legacy' ? 'legacy' : 'sanitized');
      assert.equal((await open()).get('view-preset').value, preset);
      change('preview-width', 'mobile');
      assert.equal(get('view-preset').value, 'custom');
      change('preview-width', 'full');
      assert.equal(get('view-preset').value, preset);
    }
  });
}
