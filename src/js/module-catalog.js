/** Shared catalog filtering: component classes connect variants across portal views. */
const structuralClasses = new Set(['col-left', 'col-right', 'full-width', 'has-js', 'mobile', 'note']);
export function componentClasses(module) {
  return (module.newClasses || '').split(/\s+/).filter(name => name && !structuralClasses.has(name));
}
export function catalogModules(views) {
  return views.flatMap(view => view.modules.map(module => ({ ...module, viewSlug: view.slug, viewName: view.name })));
}
export function relatedModules(selected, modules) {
  const classes = componentClasses(selected);
  const normalize = name => name.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  return modules.filter(module => module.partId !== selected.partId).map(module => {
    const shared = componentClasses(module).filter(name => classes.includes(name));
    const sameName = normalize(module.name) === normalize(selected.name);
    return { module, reason: shared.length ? `Shared class: ${shared.join(', ')}` : 'Same module name', score: shared.length + (sameName ? 2 : 0) };
  }).filter(match => match.score).sort((a, b) => b.score - a.score || a.module.viewName.localeCompare(b.module.viewName) || a.module.order - b.module.order);
}
export function filterModules(modules, { query = '', view = '', family = '' } = {}) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return modules.filter(module => (!view || module.viewSlug === view) && (!family || componentClasses(module).includes(family)) && terms.every(term => `${module.name} ${module.legacyName || ''} ${module.partId} ${module.newClasses} ${module.originalClasses} ${module.viewName}`.toLowerCase().includes(term)));
}
