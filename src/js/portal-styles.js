/** Slate framework snapshots plus build.xslt styles, isolated to the preview. */
export const portalStylesheets = [
  '/simulator/styles/slate-framework-base.css',
  '/simulator/styles/slate-portal-base.css',
  '/simulator/styles/slate-render.css',
  '/simulator/styles/slate-layout.css',
  ...[
  'build-fonts.css',
  'build.css',
  'index.css',
  'tailwind.css',
  'build-mobile-global.css',
  ].map(file => `https://enroll-northeastern-edu.cdn.technolutions.net/shared/${file}`),
];

export function loadPortalStyles(document) {
  // Keep the supplied order and insert before local design/preview CSS.
  const anchor = document.head.querySelector('link[rel="stylesheet"]');
  for (const href of portalStylesheets) {
    if ([...document.head.querySelectorAll('link[data-portal-style]')].some(link => link.getAttribute('href') === href)) continue;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.setAttribute('data-portal-style', '');
    link.addEventListener('error', () => {
      link.dataset.loadError = 'true';
      console.error(`[Slate simulator] Portal stylesheet failed to load: ${href}`);
    }, { once: true });
    document.head.insertBefore(link, anchor);
  }
}

/** Legacy sources always stay isolated from the redesign skin. */
export function configurePreviewStyles(document, params) {
  const legacy = params.get('source') === 'legacy';
  const mode = params.get('styles') || (legacy ? 'legacy' : 'design');
  for (const link of document.head.querySelectorAll('link[data-design-style], link[href="/css/grad-admissions.css"]')) link.remove();
  if (legacy || mode === 'portal' || mode === 'legacy') loadPortalStyles(document);
  if (!legacy && mode !== 'legacy') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/grad-admissions.css';
    link.setAttribute('data-design-style', '');
    document.head.append(link);
  }
}
