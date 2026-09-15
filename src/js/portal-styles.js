/** Optional build.xslt stylesheet environment, isolated to the preview document. */
export const portalStylesheets = [
  'build-fonts.css',
  'build.css',
  'index.css',
  'tailwind.css',
  'build-mobile-global.css',
].map(file => `https://enroll-northeastern-edu.cdn.technolutions.net/shared/${file}`);

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
