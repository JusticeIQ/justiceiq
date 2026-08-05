# API Specification (JusticeChamp ⇄ JusticeIQ)

Illustrative endpoint contracts for the integration described in `docs/INTEGRATION_SPEC.md`. These
are **not implemented as live network endpoints in this MVP** — the demo simulates the same actions
through `src/lib/store.tsx` functions, noted next to each endpoint below. In production these would
be implemented as Next.js Route Handlers (`src/app/api/.../route.ts`) or Supabase Edge Functions,
authenticated with `JUSTICECHAMP_WEBHOOK_SECRET`.

## Create referral

`POST /api/referrals`
Called by JusticeChamp when a consumer requests a consultation.

```json
{
  "sourceClaimId": "claim-pi-1",
  "sourceConsentId": "consent-882",
  "consumerName": "Jordan Reyes",
  "category": "personal_injury",
  "subtype": "Motor vehicle accident",
  "jurisdiction": "California",
  "incidentDate": "2026-05-14",
  "assessment": { "claimReadiness": 78, "evidenceStrength": 72, "urgency": "moderate", "...": "..." },
  "incidentOverview": "...", "keyDates": [], "parties": "...", "chronology": "...",
  "documents": [{ "name": "police_report.pdf", "category": "Police report" }],
  "timeline": [{ "date": "2026-05-14", "title": "Collision occurs" }]
}
```
Response: `201 Created` with the new `referrals.id`. Demo equivalent: `createReferral`-shaped seed
entries in `demo-data.ts` (`ref-1`, `ref-2`).

## Retrieve referral

`GET /api/referrals/:id`
Used by JusticeChamp to display current status/assignment to the consumer, and internally by
JusticeIQ. Demo equivalent: `useAppState().getReferral(id)`.

## Update referral status

`PATCH /api/referrals/:id/status`
```json
{ "status": "accepted", "declineReason": null }
```
Pushed from JusticeIQ → JusticeChamp whenever a lawyer changes status, so the consumer dashboard
reflects it. Demo equivalent: `updateReferralStatus`, `declineReferral`.

## Request more information

`POST /api/referrals/:id/request-info`
```json
{ "missingItems": ["Photos of the location", "Store incident report"], "message": "..." }
```
Surfaces a document/information request in the consumer's JusticeChamp Documents page. Demo
equivalent: `updateReferralStatus(id, "more_info_requested")` plus a note.

## Share selected documents

`POST /api/referrals/:id/documents/share`
```json
{ "documentIds": ["rd-1", "rd-2"], "sharedWith": "firm" }
```
Consent-scoped; only documents the consumer has already made available to this firm may be shared
further (e.g. with an expert). Demo equivalent: referral `documents` are pre-attached at intake.

## Schedule consultation

`POST /api/referrals/:id/consultation`
```json
{ "proposedTimes": ["2026-08-06T16:00:00Z"], "meetingType": "video", "lawyerId": "tm-3", "preparationInstructions": "..." }
```
Also creates a `calendar_events` row in JusticeIQ. Demo equivalent: `scheduleConsultation`.

## Convert referral to matter

`POST /api/referrals/:id/convert`
```json
{ "matterName": "...", "responsibleLawyerId": "tm-2", "clientEmail": "...", "stage": "Intake" }
```
JusticeIQ-internal (does not call back to JusticeChamp), but the resulting `matters.id` is
recommended to be pushed back via *Send client notification* below so the consumer knows their
matter is open. Demo equivalent: `convertReferralToMatter`.

## Send client notification

`POST /api/notifications/send`
```json
{ "consumerClaimId": "claim-pi-1", "message": "Your matter has been opened with Delgado Chandra & Kim LLP.", "type": "referral" }
```
Calls into JusticeChamp's notification system so status changes are visible to the consumer without
consumer-side polling. Demo equivalent: `logActivity` + `notifications` array in the store.

## Error handling & idempotency

All `POST`/`PATCH` endpoints should accept an `Idempotency-Key` header (e.g. the JusticeChamp claim
ID + action) so retried webhook deliveries don't create duplicate referrals or duplicate calendar
events. Not implemented in this MVP since there is no live network layer yet.
