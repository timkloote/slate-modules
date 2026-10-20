/** Emphasize an Applicant ID without editing Slate's source or replacing its widgets. */
export function enhanceApplicantIds(root) {
  const visit = node => {
    if (node.nodeType === 1 && node.matches('script,style,textarea,input,select,button,a,.applicant-id,[hidden]')) return;
    if (node.nodeType === 3 && node.parentElement?.closest('.part')) {
      const pattern = /Applicant\s+ID:\s*(?:\{\{\s*per_id\s*\}\}|\d[\w-]*)/g;
      const text = node.textContent;
      const matches = [...text.matchAll(pattern)];
      if (!matches.length) return;
      const document = node.ownerDocument;
      const fragment = document.createDocumentFragment();
      let offset = 0;
      for (const match of matches) {
        fragment.append(document.createTextNode(text.slice(offset, match.index)));
        const badge = document.createElement('span');
        badge.className = 'applicant-id';
        badge.textContent = match[0];
        fragment.append(badge);
        offset = match.index + match[0].length;
      }
      fragment.append(document.createTextNode(text.slice(offset)));
      node.replaceWith(fragment);
      return;
    }
    for (const child of [...node.childNodes]) visit(child);
  };
  visit(root);
}

export function initApplicantIds(root = document) {
  enhanceApplicantIds(root);
  if (typeof MutationObserver === 'undefined') return;
  const observer = new MutationObserver(() => enhanceApplicantIds(root));
  observer.observe(root, { childList: true, subtree: true });
  return observer;
}
