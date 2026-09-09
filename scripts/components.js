import { readFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

export const includes = resolve('src/_includes');

// Only these HTML comments are processed. Slate Liquid is returned verbatim.
export function component(name, ancestors = [], root = includes) {
  const file = resolve(root, name);
  const path = relative(root, file);
  if (path.startsWith('..') || isAbsolute(path)) throw new Error(`Invalid component: ${name}`);
  if (ancestors.includes(file)) throw new Error(`Circular component: ${name}`);
  return readFileSync(file, 'utf8').replace(
    /<!-- component: ([\w./-]+) -->/g,
    (_, child) => component(child, [...ancestors, file], root).trimEnd(),
  );
}
