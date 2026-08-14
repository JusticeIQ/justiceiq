# Production-Readiness Roadmap

## Near-term (post-MVP)

- Wire `src/lib/store.tsx` actions to real Supabase queries/mutations behind the same function
  signatures, so demo mode and production mode share one component layer
- Implement the JusticeChamp integration described in `docs/INTEGRATION_SPEC.md` /
  `docs/API_SPEC.md` as real Next.js Route Handlers, authenticated with a shared webhook secret
- Real Supabase Auth (email/password + magic link) with `user_profiles` created via a database
  trigger on `auth.users` insert, scoped to a `firm_id` collected during `/firm-setup`
- Real file uploads to Supabase Storage (`matter-documents` bucket) with storage-level RLS
  enforcing confidentiality labels (privileged/internal-only documents excluded from any future
  client-portal storage policies)
- Real email/SMS delivery for communications, replacing the demo delivery log

## Mid-term

- Per-role RLS policies (not just firm-level isolation) matching `docs/ROLES_PERMISSIONS.md`,
  including blocking Read-Only Analyst writes at the database layer
- Real conflict-of-interest screening workflow, likely integrating a dedicated conflicts database
  rather than a name-collision heuristic
- Client portal: a scoped, read-only (initially) experience for consumers to view shared updates,
  complete requested tasks, and message their lawyer — connecting back to JusticeChamp identity
- Calendar sync with Outlook/Google Calendar (first entries on the Integrations page to become real)
- Replace the scripted AI Assistant with a real LLM-backed assistant under the same guardrails (no
  final legal decisions, no fabricated citations, no autonomous external sends), with output
  moderation, logging, and mandatory lawyer review before anything leaves the draft state
- Billing/trust-accounting integration (LawPay, QuickBooks) — reviewed for trust-accounting
  compliance before enabling real money movement

## Long-term

- Deeper SolonIQ ecosystem features: multi-firm/multi-office support beyond the current 2-office
  seed, cross-firm analytics for platform operators, and a true firm-selector (the sidebar already
  has a placeholder for this)
- Practice-management integrations (Clio, PracticePanther, Filevine, Litify) as two-way syncs, not
  just placeholders
- SOC 2 Type II readiness: formal audit logging, access reviews, incident-response runbooks
- Expanded jurisdiction and practice-area coverage beyond California personal injury/employment
- Real business-intelligence layer (the Gold/Platinum tiers already gate this feature) with
  configurable, saved report definitions rather than the four fixed reports in this MVP
