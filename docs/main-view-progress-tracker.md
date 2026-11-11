# Main View application progress tracker

Three new static-content parts, using the existing FCE `status-tracker` styling. The `00-01`, `00-02`, and `00-03` filename prefixes group the new parts without renumbering the imported modules. Filenames do not control placement in Slate.

Preview all three states at `/drafts/application-progress/`. These are drafts outside the imported audit inventory until real Slate part IDs are supplied. They do not appear in the Main View simulator or Module Review yet, and no production IDs have been invented.

## Slate setup

Place the three alternatives together below Header/Hidden Fields and above the messaging blocks in Main View. Assign each part `col-span-all status-tracker application-progress-tracker`. Paste the corresponding HTML source. Use the same stylesheet as the FCE trackers; no additional JavaScript is required.

| File | Current step | Draft workflow filter |
| --- | --- | --- |
| `00-01-application-progress-submit-your-materials.html` | Submit Your Materials | Workflow Records: App Review, Bin Column = Admissions - App Creation |
| `00-02-application-progress-application-under-review.html` | Application Under Review | Workflow Records: App Review, Bin Column IN Admissions - App Complete Check, Admissions - CPS Pending, Admissions - Final Review |
| `00-03-application-progress-decision-available.html` | Decision Available | Workflow Records: App Review, Bin Column = Admissions - Decision Published |

The draft proposes an Exists dependent subquery for Workflow Records: App Review. Scope each filter to the application currently displayed. Ensure the variants are mutually exclusive; multiple matching workflow records must not display multiple trackers. Where necessary, prioritize Decision Published over Under Review over App Creation. Do not infer decision availability from the browser or show Decision Available before the applicant can access the published decision.

The PDF labels its copy as examples and leaves decision-based next steps open. These files implement only the three initial stages; confirm copy and filters before activating. Each stage has one current step, preceding steps completed, and later steps upcoming, with accessible step labels. Slate controls visibility; CSS only presents the state.

After creating the parts, provide the original and clone IDs so the drafts can be added to the audit inventory and Module Review mapping.

## Expanded team-review mockup (November 10, 2026)

The `/drafts/application-progress/` page now supersedes the three-state preview with an eight-step interactive concept. The three `00-` files remain historical drafts, not the implementation plan for this concept. Do not split the expanded tracker into Slate parts yet.

Edit `src/js/application-progress-data.js` to change step labels, descriptions, proposed actions, and scenario status arrays. Every scenario has one status per step. Statuses are complete, current, action, upcoming, skipped, and waived. Steps can need attention independently of later completed steps, especially for revised awards. Real links and all completion/visibility rules remain pending. Buttons are explicitly mock destinations and perform no admissions actions.

The scenario selector includes all proposed phases plus revised awards, deposit waivers, no award, deny, and redirect. Its hash links can be copied and shared directly. Desktop shows a horizontal tracker, tablet wraps into two rows, and mobile shows a vertical tracker. Keyboard users can inspect every step using ordinary buttons.

Publication follows the repository's existing GitHub Pages workflow on main. No applicant data is used. The page is a review artifact, not a live applicant status display. EDGE/FastApps and exact enrollment/deposit dependencies remain open decisions.

## Grayscale wireframe

Share `/drafts/application-progress-wireframe/` for the grayscale wireframe. It uses the same page renderer, scenario data, and interactions as the styled mockup, with `application-progress-wireframe.css`. Both one-module and all-scenario displays remain available. The simulator's Explore tools menu links to both versions.
