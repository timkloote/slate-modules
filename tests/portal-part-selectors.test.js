import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as sass from 'sass';
import { parseHTML } from 'linkedom';
import { expandPortalPartSelectors } from '../scripts/portal-part-selectors.js';

const { aliases } = JSON.parse(readFileSync('src/simulator/module-review-aliases.json', 'utf8'));

test('every mapped production CSS ID includes clone IDs at the same specificity', () => {
  const source = sass.compile('src/scss/grad-admissions.scss').css;
  const css = expandPortalPartSelectors(source, aliases);
  const originalIds = new Set(source.match(/part_[0-9a-f-]{36}/g));
  let mapped = 0;
  for (const original of originalIds) {
    const clones = Object.keys(aliases).filter(clone => aliases[clone] === original);
    if (!clones.length) continue;
    mapped++;
    const selector = `:is(${[original, ...clones].map(id => `#${id}`).join(', ')})`;
    assert.ok(css.includes(selector), original);
    const { document } = parseHTML(`<html><body>${[original, ...clones].map(id => `<div id="${id}"></div>`).join('')}</body></html>`);
    assert.equal(document.querySelectorAll(selector).length, clones.length + 1);
  }
  assert.equal(mapped, 31);
  const fceId = 'part_e9259ead-7c1c-4422-81fc-004443d6a34b';
  const cloneId = Object.keys(aliases).find(clone => aliases[clone] === fceId);
  assert.ok(css.includes(`:has(> .part_rows_container > :is(#${fceId}, #${cloneId}))`));
});

test('selector expansion preserves declarations and unmapped IDs and supports multiple clones', () => {
  const original = 'part_11111111-1111-1111-1111-111111111111';
  const clones = ['part_22222222-2222-2222-2222-222222222222', 'part_33333333-3333-3333-3333-333333333333'];
  const selector = `:is(#${original}, #${clones[0]}, #${clones[1]})`;
  const declarations = `content: "#${original}"; background: url("#${original}");`;
  const css = `@media (min-width: 1px) { #${original} a::after { ${declarations} } #unmapped { color: red; } }`;
  assert.equal(expandPortalPartSelectors(css, Object.fromEntries(clones.map(clone => [clone, original]))),
    `@media (min-width: 1px) { ${selector} a::after { ${declarations} } #unmapped { color: red; } }`);
});
