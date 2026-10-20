import test from 'node:test';
import assert from 'node:assert/strict';
import {parseHTML} from 'linkedom';
import {enhanceApplicantIds} from '../src/js/applicant-id.js';

test('Applicant IDs become standalone text without altering surrounding links or controls', () => {
  const {document} = parseHTML(`<html><body><div class="part">
    <p>See <a href="/college">your college</a>. Transcript request: Applicant ID: {{per_id}}<br>Keep this number.</p>
    <div>Applicant ID: 001234567</div><input value="Applicant ID: 123">
    <script>const sample = 'Applicant ID: 456';</script>
    </div><p>Applicant ID: 999</p></body></html>`);
  const link = document.querySelector('a');
  const input = document.querySelector('input');
  const before = document.body.textContent;
  enhanceApplicantIds(document);
  assert.deepEqual([...document.querySelectorAll('.applicant-id')].map(el=>el.textContent), ['Applicant ID: {{per_id}}','Applicant ID: 001234567']);
  assert.equal(document.body.textContent,before);
  assert.equal(document.querySelector('a'),link);
  assert.equal(document.querySelector('input'),input);
  const html = document.body.innerHTML;
  enhanceApplicantIds(document);
  assert.equal(document.body.innerHTML,html);
});
