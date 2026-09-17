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
- `src/scss/accessibility.scss`: accessibility overrides, included last in the combined stylesheet.
- `src/js/app.js`: documented application entry point, navigation functions, and Northeastern library loader.

Include a component with `<!-- component: navigation.html -->`. Paths are relative to `src/_includes`. This deliberately distinct syntax leaves `{{ variables }}` and `{% liquid tags %}` untouched, including Slate-owned include tags. Do not add Liquid raw wrappers for the local build.

## Copying into Slate

After `npm run build`:

- `dist/index.html` is the complete preview.
- `dist/slate/header.html` contains the assembled header, navigation, and account menu.
- `dist/slate/footer.html` contains the complete footer.
- `dist/slate/navigation.html` and `account-menu.html` are alternative smaller exports for separately managed Slate regions. Do not paste them again alongside the complete header.
- `dist/slate/content.html` is the sample main content, including the skip-link target `main-content`.
- `dist/css/grad-admissions.css` is the complete production stylesheet for direct pasting into Slate.
- `dist/css/`, `dist/js/`, and `dist/images/` contain the assets to upload.

Copy the exported file contents, not browser-rendered text. Adjust relative asset URLs to their uploaded Slate locations. For a direct paste, copy all of `dist/css/grad-admissions.css` into Slate’s CSS area (without `<style>` tags). It includes shared, module, and accessibility styles in order. Alternatively, upload that file and link to it as a stylesheet. Paste the single deferred app.js tag once. The preview's skip link needs a `main-content` target in Slate as well.

Live Slate data and server-owned routes cannot execute in the local static preview. Liquid remains visible in source until Slate renders it. Generated `dist/` and dependencies are ignored by Git; edit `src/`, then rebuild.

The former root index.html and css/js source locations have moved into src. There is one editable source for each module; generated files now live only in dist.

## Adding JavaScript features

Keep custom JavaScript in `src/js/app.js`. Each feature gets a documented `initFeature()` function with private state and named event handlers. Call it from `initApp()`, guard against missing markup, and avoid attaching duplicate listeners. Document purpose, required elements, and any focus or accessibility behavior beside each function.

Upload `dist/js/app.js` and use the single tag in `dist/slate/scripts.html` (adjust its URL to the uploaded asset). The app loads the two existing Northeastern libraries dynamically in order; do not paste their tags separately. This meets the one-pasted-tag workflow, but still makes two external library requests and creates script elements at runtime. Slate must permit those existing CDN URLs.

## Slate simulator

Run `npm run dev`, then open **`/views/`** on the localhost URL. The existing `/` landing page and header/footer exports are unchanged.

The simulator contains all 217 audited modules across 11 views. Each preview stacks `.part` containers inside Slate's `.part_rows_container`, preserving audited IDs, order, and original classes. The preview canvas is one iframe to isolate development controls from portal CSS; modules inside it share a single document, just as in Slate. **Open preview** gives you that document without the inspector. **Clean view ↗** opens a separate tab with the same selected modules, classes, and layout, hiding part labels, outlines, Liquid notices, and missing-widget placeholders. The clean URL can be bookmarked; it records the selected parts. Missing widgets remain blank and unresolved Liquid is still not evaluated.

### Inspect and compose a view

- Search by module name, type, notes, or part ID. Expand **Audit & source** for status, original/proposed classes, notes, source path, and original HTML.
- Check modules to choose the visible subset. Selection persists in this browser per view. **Select all** selects every module in the current view, including inactive modules and modules hidden by inspector filters. **Clear selection** deselects everything; **Select active** selects only audit-active modules.
- Main View initially selects the 15 part IDs observed in the supplied rendered page. **Select parts from supplied page** restores that subset. Only those IDs were retained from the capture, not its applicant/session data. This is a visibility subset, not a reproduction of its applicant values.
- **Active** is the audit's configuration status, not an applicant visibility rule. Selecting all active modules may show contradictory content.
- **Original audit classes** is the default. **Proposed audit classes** substitutes the proposed column, including blank values; it does not imply that audit recommendations have been adopted in production.
- **Slate behavior · vanilla JS** is the default for Main View; other views default to **Slate stack**. Layout and class choices persist per view. **CSS column experiment** groups selected left/right parts into independent stacks, then lays out the two stacks with CSS grid. Full-width parts stay between column segments in audit order. The preview assembly uses JavaScript to group parts; it does not execute the legacy column-moving scripts or claim to reproduce the deployed layout.
- Hide part labels or choose tablet/mobile canvas widths to inspect styling.

### Sources and audit updates

- `src/simulator/audit.json` is the workbook snapshot, with source row numbers and all audit fields. Workbook notes are retained as data; deletions and renames in those notes are not executed.
- `scripts/import-slate-audit.py` imports the supplied workbook using Python's standard library, without modifying it. To refresh:

  ```sh
  python3 scripts/import-slate-audit.py /absolute/path/to/slate-module-inventory.xlsx
  ```

- `scripts/simulator.js` maps each audit view and numeric order to `src/modules/<view>/<order>-*.html`. Ambiguous file matches fail the build. Missing sources are recorded in the inspector.
- Local shared header substitutions apply to audited Header modules. DOM modules that contain a footer use the shared footer in the preview. This replaces their legacy layout/footer locally; original source stays available in the inspector. Views without those parts get no automatic header/footer shell.
- `src/simulator/captured-parts.json` defines the observed Main View subset.

### Styling and behavior

The proposed classes in `src/simulator/audit.json` match column H (**New CSS Class Names**) of the revised inventory. Copy the entire space-separated value into Slate's module **Class Name** field; the classes belong on Slate's generated `.part` wrapper, not the static content's `<body>`. Select **Proposed audit classes** in the simulator to preview them.

Layout follows original class evidence: `leftcolumn` becomes `col-left`, `rightcolumn` becomes `col-right`, and `maincolumn` becomes `full-width`. A blank original layout stays unassigned. Each module also has a component group based on its content, such as `messaging-block`, `form-action`, or `checklist`. `has-js` marks JavaScript found in the legacy source, including script tags, inline handlers, JavaScript URLs, and commented-out scripts; it does not enable JavaScript. The workbook's separate original JS column remains unchanged; column H contains the complete proposed class list.

`src/scss/modules.scss` contains declaration-free `.part.<class>` hooks for these proposals, retained in the compiled CSS with comments. Add component styling there as modules are reviewed. The class proposals do not execute deletion or renaming suggestions from workbook notes.

Edit `src/scss/slate.scss` and `src/js/app.js` for production work. Both views load the production CSS; only Clean view loads app.js after assembling the selected parts. Shared header controls remain interactive; destination links are prevented from navigating. The existing application entry point loads its Northeastern dependencies as usual.

`src/scss/simulator.scss`, `src/scss/simulator-preview.scss`, and `src/js/simulator*.js` belong only to the development interface. Do not paste these into Slate. No source modules or audit notes are rewritten during preview generation.

The simulator strips imported scripts, embedded styles, and event handlers. It does not run Slate's `FW` APIs, evaluate Liquid, submit forms, or reproduce server-side visibility. Unresolved Liquid is flagged; use rendered fixtures for an accurate state. The legacy extracted module styles are not available here, and Slate's framework/Bootstrap/Tailwind cascade is not bundled. This establishes the wrapper and content environment for new styling, not a pixel-identical copy of the old portal.

### Add rendered markup for blank widgets

Fourteen audited parts are non-static widgets. They display **Rendered markup needed** until you add a fixture at:

```
src/simulator/fixtures/<view-slug>/<part_id>.html
```

The inspector shows the exact path for every part. Copy that part's rendered inner HTML from Slate, replace personal data with fictional values, and save the file. A complete single `.part` wrapper is also accepted. Refresh after the rebuild; the inspector will show **Captured markup**. Fixtures override only previews and can also replace static modules whose Liquid needs a resolved example. See `src/simulator/fixtures/README.md`.

Imported relative image/media paths (for example `/icons/received.png`) resolve against `https://enroll-northeastern-edu.cdn.technolutions.net/` in both simulator modes. Shared header/footer assets stay local, and existing absolute URLs are preserved. This is a preview-only adjustment; original module source remains intact.

### Main View: vanilla JavaScript behavior

Choose **Clean view layout → Slate behavior · vanilla JS**, then open **Clean view**, to run the migration of `133-scripts.html`. Select **132. DOM** for the column destinations and **133. Scripts** to enable the behavior. The original imported scripts remain untouched and are not executed.

- `src/js/main-view-behavior.js` exports `initMainViewBehavior(root, options)`. It uses native DOM APIs, with no jQuery, Popper, or Bootstrap dependency. It runs after selected parts and captures have been inserted; repeat calls do not duplicate generated headings or form wrappers.
- In this mode, the preview restores the original DOM module's layout markup and swaps only its footer for the shared footer. A DOM capture takes precedence and must include the column containers itself.
- Both original `leftcolumn`/`rightcolumn` and proposed `col-left`/`col-right` classes are supported. The preview stylesheet supplies the responsive columns without Bootstrap.
- The port covers column moves, widget classes, label changes, form wrapping, new-tab link attributes, table class removal, application-switch headings, and the empty-payment message. It does not recreate Slate forms, Bootstrap interactions, or server behavior.
- A collapsible report lists unmatched selectors. They may refer to unselected parts, unavailable widget markup, or old part IDs. The migration preserves those IDs rather than remapping them by guesswork. Clean view hides the report and retains the selected behavior mode.
- This behavior is the default Main View layout in the simulator, and still requires the Scripts part to be selected. To adopt it in Slate, wire it into the production lifecycle after the view/widgets render; it is not automatically added to the existing app entry point or exports.

`linkedom` is a development-only test dependency used to validate DOM moves, repeat initialization, missing selectors, and payment content handling. It is not loaded by the preview or Slate.

Existing Clean view tabs retain the settings encoded in their URL. After changing simulator settings, reopen **Clean view** to get the updated URL; refreshing an old `layout=stacked` URL intentionally keeps the stack layout.

### Stacked editor versus Clean view

The simulator canvas and **Open stacked preview** always render parts in audit order, without portal app.js, DOM moves, or the CSS column experiment. **Clean view layout** affects only **Clean view**: Main View defaults to the vanilla-JS behavior there. Module selection and classes are shared, while part labels remain an editor control. Select DOM and Scripts for the clean-view column behavior.

### Portal stylesheet environment

Choose **Styles → Portal + design** to load the five supplied build.xslt stylesheet references in this order:

1. `https://enroll-northeastern-edu.cdn.technolutions.net/shared/build-fonts.css`
2. `https://enroll-northeastern-edu.cdn.technolutions.net/shared/build.css`
3. `https://enroll-northeastern-edu.cdn.technolutions.net/shared/index.css`
4. `https://enroll-northeastern-edu.cdn.technolutions.net/shared/tailwind.css`
5. `https://enroll-northeastern-edu.cdn.technolutions.net/shared/build-mobile-global.css`

They load before the local preview/design styles. This uses the order supplied for development; match the final placement of new CSS in build.xslt when deploying. The choice persists per view and carries into Clean view URLs as `styles=portal`. **Design only** remains the default. Existing Clean view tabs retain their URL settings; reopen the link after switching styles.

The simulator controls and landing page are unaffected. These are live CDN references, so network availability and upstream updates affect the preview; relative font/image URLs resolve on the CDN. Failed stylesheet loads are reported in the browser console.

The supplied `build-mobile-global.js` is not loaded: it depends on jQuery and Slate `FW.generateUuid` / `FW.Dialog.Load`. It injects mobile table labels, converts the legacy menu to a select, observes DOM changes, and modifies dialog loading at widths up to 736px. Those behaviors need a separate vanilla-JS adaptation if required; the mobile CSS alone does not reproduce them. This layer also does not include Slate's additional framework CSS, widget-injected styles, or other portal-specific assets from the rendered page.

### Production stylesheet organization

For external stylesheet development, each build also writes `css/grad-admissions-test.css` so it can be committed and pushed to GitHub. Edit the SCSS sources below, run `npm run build`, and commit the refreshed CSS file. This file is generated; direct edits will be overwritten on the next build.

The build also writes `dist/css/grad-admissions-test.css` for the existing GitHub Pages deployment workflow. Once deployed, link it in Slate with `<link rel="stylesheet" href="https://timkloote.github.io/slate-modules/css/grad-admissions-test.css?v=1">`. Update the version query when publishing a new revision to request a fresh URL. Cache behavior still depends on the host and Slate.

- `src/scss/slate.scss`: shared CSS custom properties, fonts, base styles, header/footer.
- `src/scss/modules.scss`: content module styles, including the existing FCE tracker and empty-payment heading. Use shared values directly, e.g. `color: var(--red)` or `max-width: var(--wrapperWidth)`. No import of slate.scss is needed.
- `src/scss/accessibility.scss`: accessibility overrides, loaded last.

`npm run build` produces one expanded production stylesheet: `dist/css/grad-admissions.css`. The `src/scss/grad-admissions.scss` entry point combines **slate.scss → modules.scss → accessibility.scss**, keeping the source files separate for editing. Copy the complete CSS file into Slate’s CSS area, or upload it and link to it as a stylesheet. The landing page, stacked simulator, and Clean view all load this same bundle. Font imports and font/image URLs retain their existing external dependencies. The tracker remains removed from the landing page; its styles are retained for module use.

### Compare sanitized and legacy modules

Use **Modules → Legacy originals** to preview `src/legacy/modules/` instead of `src/modules/`. All 217 legacy files are mapped to the same audit rows, part IDs, order, and selectable wrapper classes. The source choice persists per view and is included in stacked and Clean view links as `source=legacy`.

- **Sanitized** retains the existing workflow: shared new header/footer substitutions, optional rendered captures, and stripped module CSS/scripts.
- **Legacy originals** uses the original files, including the original header/footer and DOM layout. Inline `style` attributes, `<style>` blocks from both head and body, and stylesheet links are retained. Module style dependencies load when that module is selected. Relative CSS asset URLs and stylesheet paths resolve against the Slate CDN.
- Legacy mode bypasses rendered capture overrides; non-static widgets remain explicit placeholders. A missing legacy source is reported, never silently replaced with sanitized markup. **Audit & source** exposes both source paths and both HTML versions.
- The simulator canvas remains stacked with no portal JavaScript. Clean view can run the existing vanilla Main View migration against the legacy DOM if DOM and Scripts are selected. Original scripts, inline event handlers, embedded frames, and live form/navigation behavior remain disabled. The new header's app.js is not loaded with legacy markup.
- **Styles → Portal + design** remains independent and adds the five supplied portal CSS files. Local design CSS remains loaded in either source mode, so legacy mode is a comparison/compatibility surface, not a pixel-identical historical screenshot. Legacy module styles occur inside the parts after the document's linked CSS and can override it, including through inline styles and `!important`.

Changes under `src/legacy/modules/` trigger development rebuilds. Refresh the simulator and reopen Clean view to load updated source/settings. Neither source directory is rewritten by the simulator. Legacy-only Bootstrap interactions, Slate APIs, and unresolved Liquid still require separate work or validation in Slate.

Temporary part borders now live in `src/scss/modules.scss`: `[id^="part_"] { border: 1px solid var(--light-gray); }`. Replace or remove this rule as module styling progresses; legacy CSS may override it.

The vanilla-JS column moves run for either source in Clean view, but the simulator’s fallback grid, spacing, and column widths apply only to sanitized modules. Legacy mode uses the original Bootstrap `.row` / `.col-md-6` layout; keep the legacy Styles module selected to load its Bootstrap CSS.
