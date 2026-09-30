/** User-supplied Slate sandbox destinations; independent of local audit view names. */
const base = 'https://enroll.northeastern.edu/portal/app_status_sandbox';
export const liveViews = [
  ['main-view', 'Main View', ''],
  ['enrollment-module', 'Enrollment Module', 'enrollment'],
  ['fce-checklist', 'FCE Checklist', 'fce_checklist'],
  ['information', 'Information', 'information'],
  ['letters', 'Letters', 'letters'],
  ['materials-checklist', 'Materials / Checklist', 'checklist'],
  ['options', 'Options', 'options'],
  ['transactions', 'Transactions', 'transactions'],
  ['unsubmitted-applications', 'Unsubmitted View', 'unsubmitted'],
  ['admissions-file-review-hub', 'Admissions File Review Hub', 'admissions_file_review', true],
  ['testing-fcechecklist', 'June 2025 Testing FCE Checklist', 'testing_fcechecklist', true],
].map(([id, name, cmd, inactive = false]) => ({ id, name, inactive, url: base + (cmd ? `?cmd=${cmd}` : '') }));

export function initLiveViewPicker(document) {
  const picker = document.querySelector('[data-live-view-picker]');
  if (!picker || picker.dataset.initialized) return;
  picker.dataset.initialized = 'true';
  const select = picker.querySelector('select');
  const link = picker.querySelector('a');
  const sync = () => {
    const view = liveViews.find(view => view.id === select.value);
    if (view) link.href = view.url;
  };
  select.addEventListener('change', sync);
  sync();
}
if (typeof document !== 'undefined') initLiveViewPicker(document);
