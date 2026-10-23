import { mkdir, writeFile, readFile } from 'node:fs/promises';
import * as sass from 'sass';
import { readdirSync } from 'node:fs';
import { liveViews } from './src/js/live-views.js';

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget('src/_includes/');
  eleventyConfig.addWatchTarget('src/scss/');
  eleventyConfig.addWatchTarget('src/modules/');
  eleventyConfig.addWatchTarget('src/legacy/modules/');
  eleventyConfig.addWatchTarget('src/simulator/');
  // The review script is generated below with its navigation destinations.
  // Never copy its empty source placeholders over the generated asset in serve mode.
  for (const file of readdirSync('src/js')) {
    if (file !== 'module-review.js') eleventyConfig.addPassthroughCopy({ [`src/js/${file}`]: `js/${file}` });
  }
  eleventyConfig.addWatchTarget('src/js/module-review.js');
  eleventyConfig.addWatchTarget('src/js/live-views.js');
  eleventyConfig.addPassthroughCopy({ 'src/references': 'references', 'src/simulator/styles': 'simulator/styles', images: 'images', 'grad-admissions/images': 'grad-admissions/images' });
  // Temporary, standalone review asset: include every ID, including inactive parts.
  eleventyConfig.on('eleventy.after', async () => {
    const source = await readFile('src/js/module-review.js', 'utf8').catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (!source) return;
    const audit = JSON.parse(await readFile('src/simulator/audit.json', 'utf8'));
    const catalog = Object.fromEntries(audit.modules.map(({ partId, view, order, name }) => [partId, { view, order, name }]));
    await writeFile('dist/js/module-review.js', source.replace('null; /* MODULE_REVIEW_CATALOG */', `${JSON.stringify(catalog)}; /* MODULE_REVIEW_CATALOG */`).replace('[]; /* MODULE_REVIEW_VIEWS */', `${JSON.stringify(liveViews)}; /* MODULE_REVIEW_VIEWS */`));
  });
  eleventyConfig.on('eleventy.before', async () => {
    await mkdir('dist/css', { recursive: true });
    for (const [source, output, style] of [
      ['grad-admissions', 'grad-admissions', 'expanded'],
      ['simulator', 'simulator', 'expanded'],
      ['simulator-preview', 'simulator-preview', 'expanded'],
      ['module-preview', 'module-preview', 'expanded'],
    ]) {
      const result = sass.compile(`src/scss/${source}.scss`, { style });
      await writeFile(`dist/css/${output}.css`, result.css);
      if (output === 'grad-admissions') {
        await mkdir('css', { recursive: true });
        await writeFile('css/grad-admissions-test.css', result.css);
        await writeFile('dist/css/grad-admissions-test.css', result.css);
      }
    }
  });
  return {
    dir: { input: 'src', includes: '_includes', output: 'dist' },
    templateFormats: ['11ty.js'],
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
}
