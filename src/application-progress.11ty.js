export const data = { permalink: 'drafts/application-progress/index.html' };
export default function () {
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Application progress · Team review</title><link rel="stylesheet" href="../../css/application-progress.css"></head><body>
<main>
<section class="review-controls" aria-label="Mockup controls"><div><label for="scenario">Review a scenario</label><select id="scenario"></select></div></section>
<section class="tracker" aria-labelledby="tracker-title"><div class="tracker-heading"><div><p class="eyebrow">Your next chapter</p><h2 id="tracker-title">Track your application</h2></div></div><p class="tracker-intro">Follow your progress and explore each step for more information.</p><ol id="steps" aria-label="Application progress"></ol><div id="step-detail" class="step-detail" aria-live="polite"></div></section>

<section class="state-key" aria-label="Status key"><span data-state="complete">Complete</span><span data-state="current">Current step</span><span data-state="action">Action required</span><span data-state="upcoming">Not yet available</span><span data-state="waived">Waived</span><span data-state="skipped">Not applicable</span></section>
</main><script type="module" src="../../js/application-progress.js"></script></body></html>`;
}
