import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parseHTML } from 'linkedom';
import { inventory } from '../scripts/simulator.js';
import { statusBadge } from '../src/js/module-library.js';

test('portal removals retain modern and legacy sources and distinguish inactive duplicates', () => {
  const modules = inventory().views.flatMap(view => view.modules);
  const deleted = modules.filter(module => module.deleted);
  assert.equal(deleted.length, 36);
  for (const module of deleted) {
    assert.ok(existsSync(module.source), module.name);
    assert.ok(existsSync(module.legacySource), module.name);
  }
  const transactions = modules.filter(module => module.view === 'Transactions' && module.name === 'Update Info');
  assert.equal(transactions.find(module => module.order === 5).deleted, undefined);
  assert.equal(transactions.find(module => module.order === 9).deleted, true);
  const { document } = parseHTML('<html></html>');
  const badge = statusBadge(document, 'Deleted');
  assert.equal(badge.textContent, 'Deleted');
  assert.ok(badge.classList.contains('module-status--deleted'));
});
