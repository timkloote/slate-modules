# Rendered widget captures

Create a directory named for the view, then a file named for the exact audited part ID:

```
src/simulator/fixtures/main-view/part_92af3041-16c7-4300-9f01-b09edc8f8fd0.html
```

1. Open the appropriate applicant scenario in Slate.
2. Inspect the `.part` container identified in the simulator's **Audit & source** details.
3. Copy its rendered inner HTML. A complete single `.part` wrapper is also accepted.
4. Replace applicant names, identifiers, email addresses, values, and record-specific URLs with fictional data. Omit tracking and session data.
5. Save at the capture path shown by the inspector. The development server rebuilds; refresh the simulator to reload its audit data.

A capture overrides only that part's local preview; it does not change the imported source or production exports. Captures also work for static content containing Liquid. Keep each capture to one part. The simulator removes scripts, embedded styles, event handlers and embeds, disables form controls, and prevents navigation. Existing classes and ordinary inner element IDs remain for styling. Missing widget captures are explicit placeholders, never invented widget HTML.

This is a structure/style fixture, not a working Slate form or an HTML security sanitizer for untrusted uploads. No uploaded content is accepted by the application.
