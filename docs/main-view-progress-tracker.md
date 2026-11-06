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
