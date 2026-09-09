import { mkdir, writeFile } from 'node:fs/promises';
import * as sass from 'sass';

export default function (eleventyConfig) {
  eleventyConfig.addWatchTarget('src/_includes/');
  eleventyConfig.addWatchTarget('src/scss/');
  eleventyConfig.addPassthroughCopy({ 'src/js': 'js', images: 'images' });
  eleventyConfig.on('eleventy.before', async () => {
    await mkdir('dist/css', { recursive: true });
    for (const [source, output, style] of [
      ['slate', 'slate', 'expanded'],
      ['slate', 'slate.min', 'compressed'],
      ['accessibility', 'accessibility', 'expanded'],
    ]) {
      const result = sass.compile(`src/scss/${source}.scss`, { style });
      await writeFile(`dist/css/${output}.css`, result.css);
    }
  });
  return {
    dir: { input: 'src', includes: '_includes', output: 'dist' },
    templateFormats: ['11ty.js'],
    htmlTemplateEngine: false,
    markdownTemplateEngine: false,
  };
}
