# Slate modules

Eleventy assembles reusable HTML fragments into a local preview and copy/paste exports. Slate Liquid is preserved verbatim; it is never rendered by Eleventy.

## Local development

Use Node.js 20 or newer.

```sh
npm install
npm run dev
```

Open the localhost URL printed by Eleventy. Changes to components, SCSS, and JavaScript rebuild the preview. Use `npm run build` for exports and `npm test` for Liquid-preservation checks.

## Where to edit

- `src/_includes/page.html`: full preview document, composing the modules.
- `src/_includes/header.html`: header branding and navigation wrapper.
- `src/_includes/navigation.html`: primary links.
- `src/_includes/account-menu.html`: dropdown, Back button, heading, and account links.
- `src/_includes/footer.html`: location, policy, social, and cookie links.
- `src/_includes/content.html`: sample preview main content.
- `src/_includes/icons/`: shared SVG fragments.
- `src/_includes/styles.html` and `scripts.html`: asset references; the script export contains one app.js tag.
- `src/scss/slate.scss`: styles with media queries nested within their regions.
- `src/scss/accessibility.scss`: existing accessibility styles, loaded after slate.css.
- `src/js/app.js`: documented application entry point, navigation functions, and Northeastern library loader.

Include a component with `<!-- component: navigation.html -->`. Paths are relative to `src/_includes`. This deliberately distinct syntax leaves `{{ variables }}` and `{% liquid tags %}` untouched, including Slate-owned include tags. Do not add Liquid raw wrappers for the local build.

## Copying into Slate

After `npm run build`:

- `dist/index.html` is the complete preview.
- `dist/slate/header.html` contains the assembled header, navigation, and account menu.
- `dist/slate/footer.html` contains the complete footer.
- `dist/slate/navigation.html` and `account-menu.html` are alternative smaller exports for separately managed Slate regions. Do not paste them again alongside the complete header.
- `dist/slate/content.html` is the sample main content, including the skip-link target `main-content`.
- `dist/slate/styles.html` and `scripts.html` contain the asset tags.
- `dist/css/`, `dist/js/`, and `dist/images/` contain the assets to upload.

Copy the exported file contents, not browser-rendered text. Adjust relative asset URLs to their uploaded Slate locations. Load styles in the exported order and paste the single deferred app.js tag once. The preview's skip link needs a `main-content` target in Slate as well.

Live Slate data and server-owned routes cannot execute in the local static preview. Liquid remains visible in source until Slate renders it. Generated `dist/` and dependencies are ignored by Git; edit `src/`, then rebuild.

The former root index.html and css/js source locations have moved into src. There is one editable source for each module; generated files now live only in dist.

## Adding JavaScript features

Keep custom JavaScript in `src/js/app.js`. Each feature gets a documented `initFeature()` function with private state and named event handlers. Call it from `initApp()`, guard against missing markup, and avoid attaching duplicate listeners. Document purpose, required elements, and any focus or accessibility behavior beside each function.

Upload `dist/js/app.js` and use the single tag in `dist/slate/scripts.html` (adjust its URL to the uploaded asset). The app loads the two existing Northeastern libraries dynamically in order; do not paste their tags separately. This meets the one-pasted-tag workflow, but still makes two external library requests and creates script elements at runtime. Slate must permit those existing CDN URLs.
