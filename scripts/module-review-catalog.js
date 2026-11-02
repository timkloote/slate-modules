/** Review-only aliases preserve the original inventory and live DOM identities. */
export function moduleReviewCatalog(modules, aliases = {}) {
  const catalog = Object.fromEntries(modules.map(({ partId, view, order, name }) => [partId, { view, order, name }]));
  for (const [cloneId, originalPartId] of Object.entries(aliases)) {
    if (!catalog[originalPartId] || aliases[originalPartId]) throw new Error(`Unknown original module review ID: ${originalPartId}`);
    if (catalog[cloneId]) throw new Error(`Module review alias conflicts with inventory: ${cloneId}`);
    catalog[cloneId] = { ...catalog[originalPartId], originalPartId };
  }
  return catalog;
}
