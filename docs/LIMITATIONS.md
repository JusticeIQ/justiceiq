# Known MVP Limitations

- **No live backend by default.** All data lives in browser `localStorage`. Supabase scaffolding
  and a production-ready schema exist, but pages call the local `useAppState()` store, not live
  Supabase queries. Wiring this up is the top roadmap item.
- **No real JusticeChamp connection.** The referral-intake flow described in
  `docs/INTEGRATION_SPEC.md` and `docs/API_SPEC.md` is documented and mirrored in the demo data
  (`ref-1`/`ref-2` simulate freshly-arrived JusticeChamp referrals with matching claim IDs), but
  there is no live network call between the two MVPs.
- **No real authentication.** Login/signup accept any non-empty email/password and seed the same
  demo firm; there is no password hashing, verification email, or session token in this MVP.
- **No real file uploads or previews.** Document upload is simulated (captures a file name only);
  "document preview" shows metadata, not a rendered file.
- **No real email/SMS delivery.** Communications are recorded in an in-app "demo delivery log"
  rather than sent through a transactional email/SMS provider.
- **Single simulated user.** The demo always acts as Sarah Kim (Managing Partner); role-based UI
  restrictions described in `docs/ROLES_PERMISSIONS.md` are documented but not enforced per-user in
  this MVP, since there is only one active session.
- **Conflict check is simulated.** It runs a simple name-collision heuristic against seeded matter
  parties — it is a UI demonstration of the workflow, not a real conflict-of-interest system.
- **Calendar is illustrative.** Month/week/day views are hand-built (no calendar library), fixed
  around August 2026 for the seeded demo data; there's no recurring-event support.
- **Analytics are computed from seed data.** Charts are custom lightweight SVG/CSS components (no
  charting library dependency), computed client-side from the seeded dataset — not connected to any
  real usage metering.
- **Integrations page is entirely placeholders.** None of the listed third-party integrations
  (Outlook, DocuSign, LawPay, Clio, etc.) are functional; each is explicitly labeled "Planned."
- **No automated test suite.** `docs/TEST_CHECKLIST.md` provides a manual QA checklist; unit/e2e
  tests are a roadmap item.
- **Billing tab is a placeholder.** No real trust accounting, invoicing, or payment processing.
