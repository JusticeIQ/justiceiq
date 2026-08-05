# CTO Technical Review Notes

Notes for a prospective CTO or senior technical hire evaluating this codebase.

## What's real vs. simulated

Read `docs/LIMITATIONS.md` first — it's the honest list. In short: the **UI, component
architecture, data model, and workflow logic are real and functional**; the **backend is
simulated** (client-side store instead of live Supabase, no live JusticeChamp network call, no
real file/email delivery). This is a deliberate MVP tradeoff, not corner-cutting hidden from
reviewers — the schema and integration spec were designed first, and the store's action signatures
were written to match what those real implementations would need.

## Why this architecture should extend cleanly

- `src/lib/types.ts` is the single source of truth for the domain model and directly mirrors
  `supabase/schema.sql` table-for-table. A reviewer can diff the two and see they agree.
- `src/lib/store.tsx` isolates all state mutation behind named functions
  (`updateReferralStatus`, `convertReferralToMatter`, `addMatterDocument`, ...). Swapping the
  `localStorage` persistence for Supabase `insert`/`update` calls does not require touching any
  page or component — only this one file.
- The matter workspace (`MatterWorkspace.tsx`) renders 12 tabs from one component and one
  `activeTab` prop, avoiding 12 near-duplicate page implementations that would drift out of sync.
- RLS policies in `schema.sql` are written against a `current_firm_id()` helper rather than
  repeating the same subquery in every policy, making firm-isolation auditable in one place.

## Where I'd push back in a real design review

- **Client-side-only demo mode is a good MVP shortcut but not a scaling story.** Referral/matter
  volume, real-time updates across team members, and audit-log integrity all need a real backend
  before this goes further than a demo.
- **The conflict check is a toy heuristic.** It's honestly labeled as such in the UI and docs, but
  a real implementation needs its own data model (opposing-party history across all matters, not
  just a name string match) — flagged explicitly in `docs/ROADMAP.md`.
- **Single-tenant assumption in the UI.** The schema supports multiple firms cleanly via
  `firm_id`, but the UI currently assumes one active firm per session (no firm switcher is wired
  up yet, only a placeholder). That's fine for this MVP's audience (one firm at a time) but would
  need real firm-switching before supporting platform operators who manage multiple firms.
- **No tests.** For a legal-data product, I'd want contract tests around the JusticeChamp
  integration endpoints before writing a single UI test — status/consent handling is the highest
  blast-radius surface area.

## Suggested first three engineering tickets after this MVP

1. Stand up the real `POST /api/referrals` Route Handler per `docs/API_SPEC.md`, backed by
   Supabase, with an idempotency key and signature verification — this de-risks the core
   value proposition (automated referral intake) before anything else.
2. Migrate `store.tsx`'s referral and matter actions to Supabase, keeping demo mode alive via a
   `NEXT_PUBLIC_FORCE_DEMO_MODE` flag for sales demos that shouldn't touch a real database.
3. Add RLS-level role enforcement (not just firm isolation) so the permissions matrix in
   `docs/ROLES_PERMISSIONS.md` is actually enforced server-side, not just hidden in the UI.
