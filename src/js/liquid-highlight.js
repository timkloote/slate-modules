/** Display Liquid as literal text; never evaluate it or rewrite source HTML. */
const liquidPattern = /\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g;
export function highlightedLiquid(document, text) {
  const fragment = document.createDocumentFragment();
  let offset = 0;
  for (const match of text.matchAll(liquidPattern)) {
    fragment.append(document.createTextNode(text.slice(offset, match.index)));
    const token = document.createElement('span');
    const logic = match[0].startsWith('{%');
    token.className = `liquid-token liquid-token--${logic ? 'logic' : 'value'}`;
    token.title = logic ? 'Liquid logic — not evaluated in this preview' : 'Liquid value — populated by Slate';
    token.textContent = match[0];
    fragment.append(token);
    offset = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(offset)));
  return fragment;
}
export function highlightLiquidSource(element, source) {
  element.replaceChildren(highlightedLiquid(element.ownerDocument, source));
}
export function highlightLiquidPreview(root) {
  // Only visible text nodes: attributes, comments, styles, and form values stay intact.
  const visit = node => {
    if (node.nodeType === 3) {
      if (/\{%|\{\{/.test(node.textContent)) node.replaceWith(highlightedLiquid(root.ownerDocument, node.textContent));
      return;
    }
    if (node.nodeType !== 1 && node.nodeType !== 11) return;
    if (node.nodeType === 1 && node.matches('script,style,textarea,select,input,.liquid-token')) return;
    for (const child of [...node.childNodes]) visit(child);
  };
  visit(root);
}
