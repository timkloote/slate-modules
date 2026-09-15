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

## Slate simulator

Run `npm run dev`, then open **`/views/`** on the localhost URL. The existing `/` landing page and header/footer exports are unchanged.

The simulator contains all 217 audited modules across 11 views. Each preview stacks `.part` containers inside Slate's `.part_rows_container`, preserving audited IDs, order, and original classes. The preview canvas is one iframe to isolate development controls from portal CSS; modules inside it share a single document, just as in Slate. **Open preview** gives you that document without the inspector. **Clean view ↗** opens a separate tab with the same selected modules, classes, and layout, hiding part labels, outlines, Liquid notices, and missing-widget placeholders. The clean URL can be bookmarked; it records the selected parts. Missing widgets remain blank and unresolved Liquid is still not evaluated.

### Inspect and compose a view

- Search by module name, type, notes, or part ID. Expand **Audit & source** for status, original/proposed classes, notes, source path, and original HTML.
- Check modules to choose the visible subset. Selection persists in this browser per view. **Select all** selects every module in the current view, including inactive modules and modules hidden by inspector filters. **Clear selection** deselects everything; **Select active** selects only audit-active modules.
- Main View initially selects the 15 part IDs observed in the supplied rendered page. **Select parts from supplied page** restores that subset. Only those IDs were retained from the capture, not its applicant/session data. This is a visibility subset, not a reproduction of its applicant values.
- **Active** is the audit's configuration status, not an applicant visibility rule. Selecting all active modules may show contradictory content.
- **Original audit classes** is the default. **Proposed audit classes** substitutes the proposed column, including blank values; it does not imply that audit recommendations have been adopted in production.
- **Slate behavior · vanilla JS** is the default for Main View; other views default to **Slate stack**. Layout and class choices persist per view. **CSS column experiment** arranges left/right classes on their shared parent; it does not execute the legacy column-moving scripts or claim to reproduce the deployed layout.
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
