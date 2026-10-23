/** Build each destination from its own saved simulator selection and settings. */
export function cleanViewUrl(view, storage) {
  const key = `slate-simulator:${view.slug}`;
  let parts = view.parts;
  let settings = {};
  try {
    const saved = JSON.parse(storage.getItem(key));
    if (Array.isArray(saved)) parts = saved;
    settings = JSON.parse(storage.getItem(`${key}:settings`)) || {};
  } catch { /* Use defaults when browser storage is unavailable. */ }
  const source = settings['module-source'] === 'legacy' ? 'legacy' : 'sanitized';
  const layout = settings['layout-mode'];
  const params = new URLSearchParams({
    parts: parts.join(','),
    classes: settings['class-mode'] === 'original' ? 'original' : 'new',
    layout: ['stacked', 'columns', ...(view.slug === 'main-view' ? ['behavior'] : [])].includes(layout) ? layout : view.slug === 'main-view' ? 'behavior' : 'stacked',
    source,
    styles: source === 'legacy' ? 'legacy' : ['legacy', 'design', 'portal'].includes(settings['portal-styles']) ? settings['portal-styles'] : 'portal',
    labels: '0', clean: '1',
  });
  return `/views/${view.slug}/preview/?${params}`;
}

if (typeof document !== 'undefined') {
  const button = document.querySelector('[data-all-clean-views]');
  button?.addEventListener('click', () => {
    const views = JSON.parse(button.dataset.allCleanViews);
    // Keep every open inside the user click so browsers can allow multiple tabs.
    for (const view of views) {
      const tab = window.open(cleanViewUrl(view, { getItem: key => localStorage.getItem(key) }), '_blank');
      if (tab) tab.opener = null;
    }
    document.querySelector('[data-clean-views-status]').textContent = 'If some tabs did not open, allow pop-ups for this site and try again.';
  });
}
