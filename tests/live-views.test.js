import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { liveViews, initLiveViewPicker } from '../src/js/live-views.js';
import { liveViewPicker } from '../scripts/live-views.js';

test('live destinations retain all supplied commands and inactive labels', () => {
  assert.deepEqual(liveViews.map(view => new URL(view.url).searchParams.get('cmd')), [null, 'enrollment', 'fce_checklist', 'information', 'letters', 'checklist', 'options', 'transactions', 'unsubmitted', 'admissions_file_review', 'testing_fcechecklist']);
  assert.deepEqual(liveViews.filter(view => view.inactive).map(view => view.id), ['admissions-file-review-hub', 'testing-fcechecklist']);
  assert.ok(liveViews.every(view => new URL(view.url).origin === 'https://enroll.northeastern.edu'));
});
test('picker preselects matching view and changes the new-tab link without navigating', () => {
  const { document, Event } = parseHTML(`<html><body>${liveViewPicker('letters')}</body></html>`);
  const select = document.querySelector('select');
  let value = select.querySelector('[selected]').value;
  Object.defineProperty(select, 'value', { get: () => value, set: next => value = next });
  initLiveViewPicker(document);
  const link = document.querySelector('a');
  assert.match(link.href, /cmd=letters$/);
  select.value = 'testing-fcechecklist';
  select.dispatchEvent(new Event('change'));
  assert.match(link.href, /cmd=testing_fcechecklist$/);
  assert.equal(link.target, '_blank');
  assert.equal(link.rel, 'noopener noreferrer');
});
