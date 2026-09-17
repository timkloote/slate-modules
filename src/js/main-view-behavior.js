/** Vanilla-JS migration of main-view/133-scripts.html.
 * Call after Slate has rendered the view's parts. No jQuery, Bootstrap, or FW required.
 * Returns unmatched selectors for diagnostics. Safe to call again after widget rendering.
 */
export function initMainViewBehavior(root = document, { ignoreElement = () => false } = {}) {
  const doc = root.ownerDocument || root;
  const missing = [];
  const find = selector => {
    const elements = [...root.querySelectorAll(selector)];
    if (!elements.length) missing.push(selector);
    return elements;
  };
  const create = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  // Accept original classes and the proposed audit equivalents.
  for (const [selector, destination] of [['.leftcolumn, .col-left', '#leftcolumn'], ['.rightcolumn, .col-right', '#rightcolumn']]) {
    const target = find(destination)[0];
    if (target) for (const part of root.querySelectorAll(selector)) {
      // Do not move a layout container into itself or disturb an already placed part.
      if (part !== target && !part.contains(target) && part.parentElement !== target) target.append(part);
    }
  }
  for (const widget of find('.applicant_events_widget')) {
    if (widget.querySelector('[data-slate-visit-heading]')) continue;
    const heading = create('h3', 'Visit Campus'); heading.dataset.slateVisitHeading = 'true';
    widget.prepend(heading, create('p', 'Schedule your visit to find out more about Northeastern now!'));
  }
  for (const part of find('#part_e15c84b6-a277-4315-bdb4-055b23bd7b84')) part.classList.add('whitebackground', 'checklist');
  const labels = [
    ['#part_8957922f-9774-4ff2-a799-6efef0feacf3 > div > h3', 'You Have An Admissions Decision'],
    ['#part_8957922f-9774-4ff2-a799-6efef0feacf3 > div > a', 'View Your Admissions Decision'],
    ['#part_12aaabe9-0c0e-4994-990e-f14bbdd9d2d0 > h3', 'Pay your application fee using the link below'],
    ['#form_4197824a-c8d2-4480-ad9e-fe3a6c9046d4_container button.form_button_save', 'Done for now.'],
    ['#form_4197824a-c8d2-4480-ad9e-fe3a6c9046d4_container button.form_button_submit', 'All items complete.'],
  ];
  for (const [selector, text] of labels) for (const node of find(selector)) node.textContent = text;
  for (const form of find('#part_93ad9de8-bb73-4452-b320-a89aa09af839 > div > form')) {
    if (form.parentElement.classList.contains('row')) continue;
    const row = create('div', '', 'row'); form.before(row); row.append(form);
  }
  for (const selector of [
    '#part_f5a08f49-bb47-4769-a01b-c24f273eb8e2 > table > tbody > tr > td:nth-child(2) > a',
    '#part_12aaabe9-0c0e-4994-990e-f14bbdd9d2d0 > table > tbody > tr > td:nth-child(3) > a',
    '#part_8957922f-9774-4ff2-a799-6efef0feacf3 > div > p:nth-child(3) > a',
    '#part_3ff542dd-3392-46e7-a627-521d9ad83c11 > table > tbody > tr > td:nth-child(3) > a',
  ]) for (const link of find(selector)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  for (const table of find('#content > table')) table.classList.remove('fixed');
  for (const select of find('#part_416aad3d-54b3-4596-9c3c-bf4360ffe893 > select')) {
    if (select.previousElementSibling?.hasAttribute('data-slate-switch-heading')) continue;
    const heading = create('h3', 'Switch Applications'); heading.dataset.slateSwitchHeading = 'true'; select.before(heading);
  }
  for (const payment of find('#part_2dd69944-5553-456a-8b05-4c6903e6f2be')) {
    if ([...payment.children].some(child => !ignoreElement(child))) continue;
    payment.append(create('h3', 'Payments', 'payment_sum slate-payment-heading'), create('p', 'You have no payments due at this time.'));
  }
  return { missing };
}
