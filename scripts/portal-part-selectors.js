/** Match original and cloned parts with identical ID specificity, including inside :has(). */
export function expandPortalPartSelectors(css, aliases) {
  const clones = new Map();
  for (const [clone, original] of Object.entries(aliases)) {
    const ids = clones.get(original) || [];
    ids.push(clone);
    clones.set(original, ids);
  }
  // Compiled Sass has flat rules. Only transform selector preludes, never declarations,
  // URLs, or content strings. Every alternative remains an ID selector.
  return css.replace(/([^{}]+)\{/g, (rule, selector) => `${selector.replace(/#(part_[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})\b/g,
    (match, original) => clones.has(original)
      ? `:is(${[original, ...clones.get(original)].map(id => `#${id}`).join(', ')})`
      : match)}{`);
}
