# BBONE interface coverage

The existing React routes now render working screens instead of PlannedPage placeholders. API state, validation, errors, empty results, role guards and pagination share small components in `shared/components/ui/Workflow.jsx` and `DataTable.jsx`.

| Area           | Screens and behavior                                                                                                                                                                                                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Home/catalogue | Revised care banner; search bar; paginated catalogue; product detail and guest basket; clinic profiles, services and booking links; article detail rendered as safe text.                                                                                                                                                                              |
| Identity       | Login, registration, verification, password recovery and reset; MFA code accepted by login. Tokens remain in memory.                                                                                                                                                                                                                                   |
| Screening      | Region selection, server-approved questions, conditional answers, explicit consent, anonymous result, optional account claim and sharing consent.                                                                                                                                                                                                      |
| Booking        | Clinic, service, date, available slot, authenticated hold, patient details and confirmation. Rescheduling uses the existing appointment version and requires a reason.                                                                                                                                                                                 |
| Commerce       | Editable guest/account basket, explicit merge, authoritative quote, coupon removal/retry, recipient and delivery details, COD or simulated VietQR, order detail/cancellation, protected QR image and explicit simulation controls, shipment timeline.                                                                                                  |
| Account        | Profile editing, address add/edit/remove, favorites, notifications/read status, paginated appointments/orders/screening history and shared signed encounter records.                                                                                                                                                                                   |
| Staff          | Work overview, appointment status/filter/detail, operational notes/events, patient contact directory, desk booking, manager slot creation, doctor-only records and signing, manager reports.                                                                                                                                                           |
| Admin          | Actual dashboard metrics; users and explicit replacement of access assignments; clinic/service/product catalogue and stock adjustments; draft articles and revisions; order processing/COD reconciliation/completion; shipment creation and allowed simulated transitions; audit, outbox retry, current runtime policy, period reports/authorized CSV. |

## Boundaries

- The backend controls authorization, transitions, inventory, deadlines and concurrency. Failed writes do not produce success messages. Repeated attempts at the same idempotent command retain their request key.
- No health rules, diagnoses, medication lists or analytic metrics are fabricated. Screening remains unavailable while its backend feature is disabled or no approved definition exists. Prescribing still requires its separately configured backend signing workflow.
- Published article edits create a revision rather than overwrite published content. The current backend has no pending-revision list/detail endpoint: review coordination still uses the returned revision identifiers. This is not presented as an implemented review inbox.
- The runtime policy API exposes the effective policy but does not expose the BusinessSetting concurrency version needed for subsequent edits; its screen is read-only.
- Provider-based Google/Apple sign-in, real email/SMS delivery, real payment and carrier integrations require configured providers. They are not simulated as successful external integrations.
- This is a responsive web interface; a native iOS/Android application is separate work.

## Validation

- `npm run check`: ESLint, API-client/workflow tests and production build.
- `npx astryx doctor --built .`: no failed checks; legacy raw-element/style and font-service diagnostics remain warnings.
- 26 authenticated read checks against the running local PostgreSQL API passed for Customer, Admin, Receptionist, Doctor and Reviewer. Each test session was logged out.
- Browser verification covers the banner, search/filter result, booking selection, account navigation, dashboard and shipment detail, with desktop/mobile layout checks. No real purchase, delivery or clinical record was created for visual verification.

## Theme/CSS maintenance

`layers.css` must be imported before other styles. Tailwind's base reset precedes Astryx component styles; utilities remain last. Generated theme JS/CSS and the generated app theme module are excluded from Prettier so formatting does not invalidate CLI build freshness. Customize the source theme, rebuild it, then run `theme use bbone`; do not edit generated artifacts.
