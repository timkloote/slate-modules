# Slate rendered-markup capture checklist

Reviewed all 217 audited modules against their current source HTML. 16 modules need rendered widget markup; none currently has a separate simulator fixture. Audit status describes configuration, not applicant visibility.

Copy the rendered inner HTML of the exact `.part` after Slate finishes loading the widget. Save a local capture at the fixture path below; this overrides the preview without changing production module sources. A complete single `.part` wrapper also works. Replace applicant data with fictional values and omit session/tracking data. Capture conditional states separately where the widget changes (for example pending/paid payments or required/completed checklist items).

## Active modules in active views — capture first

### Main View — 62. Payment Due

- Type: Payments; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/62-payment-due.html`
- Slate part ID: `part_2dd69944-5553-456a-8b05-4c6903e6f2be`
- Capture: `src/simulator/fixtures/main-view/part_2dd69944-5553-456a-8b05-4c6903e6f2be.html`

### Main View — 83. Missing SSN form

- Type: Form; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/83-missing-ssn-form.html`
- Slate part ID: `part_5adcf777-b965-4a07-b86e-f3a7b348bcbe`
- Capture: `src/simulator/fixtures/main-view/part_5adcf777-b965-4a07-b86e-f3a7b348bcbe.html`

### Main View — 121. Materials

- Type: Materials; module: Active; view: Active.
- Finding: Introductory copy exists; widget controls are missing.
- Source: `src/modules/main-view/121-materials.html`
- Slate part ID: `part_8103fc67-9d64-48b7-aa61-77d188ed5aa0`
- Capture: `src/simulator/fixtures/main-view/part_8103fc67-9d64-48b7-aa61-77d188ed5aa0.html`

### FCE Evaluation Status — 1. Application Selector

- Type: Application Selector; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/fce-evaluation-status/01-application-selector.html`
- Slate part ID: `part_e9259ead-7c1c-4422-81fc-004443d6a34b`
- Capture: `src/simulator/fixtures/fce-evaluation-status/part_e9259ead-7c1c-4422-81fc-004443d6a34b.html`

### FCE Evaluation Status — 24. FCE Section

- Type: Checklist By Section; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/fce-evaluation-status/24-fce-section.html`
- Slate part ID: `part_483d8f66-ee83-4087-a86a-deed4df54016`
- Capture: `src/simulator/fixtures/fce-evaluation-status/part_483d8f66-ee83-4087-a86a-deed4df54016.html`

### FCE Updates - Temp Message — 2. Uploader

- Type: Materials; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/fce-updates-temp-message/02-uploader.html`
- Slate part ID: `part_62ab62e5-0524-49a2-9924-65d2bd729505`
- Capture: `src/simulator/fixtures/fce-updates-temp-message/part_62ab62e5-0524-49a2-9924-65d2bd729505.html`

### Options — 4. Forms Widget-Admitted

- Type: Form Checklist; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/options/04-forms-widget-admitted.html`
- Slate part ID: `part_c7a0422a-9d72-4d15-9381-7e0482476e6e`
- Capture: `src/simulator/fixtures/options/part_c7a0422a-9d72-4d15-9381-7e0482476e6e.html`

### Options — 5. Decision - Not Received

- Type: Decisions; module: Active; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/options/05-decision-not-received.html`
- Slate part ID: `part_0a68edc0-af9c-4690-926c-530ad50ff3fe`
- Capture: `src/simulator/fixtures/options/part_0a68edc0-af9c-4690-926c-530ad50ff3fe.html`

## Inactive modules or views — capture only if still needed

### Main View — 68. Payment - App Fee

- Type: Payments; module: Inactive; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/68-payment-app-fee.html`
- Slate part ID: `part_2fde12d9-8fba-460f-8b76-70710cd5982e`
- Capture: `src/simulator/fixtures/main-view/part_2fde12d9-8fba-460f-8b76-70710cd5982e.html`

### Main View — 84. CPS Video

- Type: Portfolio; module: Inactive; view: Active.
- Finding: Introductory copy exists; widget controls are missing.
- Source: `src/modules/main-view/84-cps-video.html`
- Slate part ID: `part_cf758676-27db-4ad6-b91a-f0b683e0aa70`
- Capture: `src/simulator/fixtures/main-view/part_cf758676-27db-4ad6-b91a-f0b683e0aa70.html`

### Main View — 86. INACTIVE (OLD): Self-Service Checklist (All Except DMSB)

- Type: Form; module: Inactive; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/86-inactive-old-self-service-checklist-all-except-dmsb.html`
- Slate part ID: `part_28712cd8-e911-4f49-9b7b-f9b12da1ec4d`
- Capture: `src/simulator/fixtures/main-view/part_28712cd8-e911-4f49-9b7b-f9b12da1ec4d.html`

### Main View — 87. INACTIVE (OLD): Self-Service Checklist (DMSB Only)

- Type: Form; module: Inactive; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/87-inactive-old-self-service-checklist-dmsb-only.html`
- Slate part ID: `part_95765b67-d072-475d-ac0c-d9a40dbe49cd`
- Capture: `src/simulator/fixtures/main-view/part_95765b67-d072-475d-ac0c-d9a40dbe49cd.html`

### Main View — 107. Checklist Standard

- Type: Checklist; module: Inactive; view: Active.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/main-view/107-checklist-standard.html`
- Slate part ID: `part_5d6fe731-71dc-4aca-b688-03a9bcdff1ad`
- Capture: `src/simulator/fixtures/main-view/part_5d6fe731-71dc-4aca-b688-03a9bcdff1ad.html`

### Admissions File Review Hub — 1. Application Selector

- Type: Application Selector; module: Active; view: Inactive.
- Finding: Blank body or placeholder text only; rendered widget structure is missing.
- Source: `src/modules/admissions-file-review-hub/01-application-selector.html`
- Slate part ID: `part_d3d805c8-16a2-45fd-b65d-c3ecfd6e8937`
- Capture: `src/simulator/fixtures/admissions-file-review-hub/part_d3d805c8-16a2-45fd-b65d-c3ecfd6e8937.html`

### Materials/Checklist — 5. Materials

- Type: Materials; module: Active; view: Inactive.
- Finding: Introductory copy exists; widget controls are missing.
- Source: `src/modules/materials-checklist/05-materials.html`
- Slate part ID: `part_fd0bf798-010e-4727-8ded-2bdd55db1131`
- Capture: `src/simulator/fixtures/materials-checklist/part_fd0bf798-010e-4727-8ded-2bdd55db1131.html`

### Main View — 54. Payments-App Payment

- Type: Static Content; module: Inactive; view: Active.
- Finding: Placeholder text only; audit labels this Static Content.
- Source: `src/modules/main-view/54-payments-app-payment.html`
- Slate part ID: `part_d2ef2420-4148-42db-a1d6-dcea999cb83a`
- Capture: `src/simulator/fixtures/main-view/part_d2ef2420-4148-42db-a1d6-dcea999cb83a.html`

## Already has rendered widget markup

Main View — 89. Next Steps to Enrollment (College-Specific Logic on Form) contains a rendered form, inputs, labels, fieldset and buttons. It is marked non-static in the audit, but it is not a missing-markup module. The simulator still considers non-static modules without fixtures “needs capture,” so that indicator alone is not sufficient.

## Other sparse modules — not missing Slate widgets

- Main View — 7. Messaging Block - Pre-Admit and Deny (London): empty body, inactive. Restore copy if this module will be reused.
- Main View — 58. Photo Section Desktop / 59. Photo Section Mobile: empty photo containers without an image in the source. Inspect the rendered appearance if these are intended to display photography; a background image may come from styles instead of HTML.
- Main View — 130. College Category Test: Liquid output only, inactive debug module.
- Main View — 5. Hidden Fields: intentionally empty content body.
- Document Head / Styles, Javascript, Jill Chatbot, Space, divider and DOM/layout parts are infrastructure, scripts, spacing or containers; an empty or sparse body is not evidence of a missing static content capture.

Existing Liquid-driven static tables, document links, application selectors, and messages already have structure. A resolved Slate fixture can improve their previews, but they are not missing-markup widgets.
