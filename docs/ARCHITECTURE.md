# System Architecture

## Product architecture

SolonIQ closes the loop on the workflow described in the build spec:

1. A consumer submits an incident report in JusticeChamp.
2. JusticeChamp produces a structured claim summary and a preliminary claim-readiness score.
3. A matched lawyer receives the referral in SolonIQ's pipeline (`/referrals`).
4. The lawyer reviews the referral, runs a conflict check, and accepts, declines, or requests more
   information.
5. An accepted referral is converted into a matter, preserving the source referral ID.
6. The matter appears in `/matters` with a dedicated 12-tab workspace for tasks, documents,
   timeline, communications, and billing.
7. Firm leadership reviews pipeline health and operational analytics in `/analytics`.

## Technical architecture

- **Framework**: Next.js 14 App Router, TypeScript, React 18. Interactive views are Client
  Components because the MVP's data layer is local-first (see below); production would shift
  reads to Server Components backed by Supabase queries with RLS enforcing firm isolation.
- **Design system**: Tailwind CSS with a graphite/navy/teal palette (`tailwind.config.ts`) and a
  shared component library (`src/components/ui.tsx`): `Card`, `Badge`, `Button`, `ProgressBar`,
  `StatCard`, `MiniBarChart`, `MiniLineChart`, `InfoBanner`, `EmptyState`, `Spinner`. Status-specific
  badges live in `src/components/StatusBadges.tsx` (referral status, urgency, conflict status, task
  status/priority) so color and label mappings are defined once and reused everywhere.
- **App shell**: `src/components/Sidebar.tsx` + `Topbar.tsx` + `AppShell.tsx` implement the
  persistent SaaS navigation (global search input, notifications dropdown, quick-create menu, user
  profile menu) and the auth guard that redirects unauthenticated visitors to `/login`.
- **State/data layer (MVP)**: `src/lib/store.tsx` implements `AppStateProvider`, a React Context
  provider persisted to `localStorage`, exposing typed actions (`updateReferralStatus`,
  `runConflictCheck`, `scheduleConsultation`, `convertReferralToMatter`, `addTask`,
  `addMatterDocument`, `addCommunication`, etc.) consumed via `useAppState()`. This lets the entire
  platform run client-side with zero external dependencies for demos, while keeping the action
  signatures close to what a Supabase-backed implementation would need.
- **Data layer (production path)**: `src/lib/supabase/client.ts` / `server.ts` provide typed
  Supabase client factories reading `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  with a clean fallback to demo mode when unset (`isSupabaseConfigured`).
- **Matter workspace**: `src/components/MatterWorkspace.tsx` is a single component rendering all 12
  tabs (Overview, Client, Timeline, Documents, Tasks, Calendar, Communications, Notes, Parties,
  Damages, Billing, Activity Log), driven by an `activeTab` prop. Six thin route files
  (`/matters/[matterId]/{overview,documents,timeline,tasks,communications,billing}`) render it with
  a fixed tab; the remaining six tabs are reached via `?tab=` on the base `/matters/[matterId]`
  route. This satisfies the full spec'd tab set without 12 near-duplicate route files.
- **Seed/demo data**: `src/lib/demo-data.ts` builds the fictional firm, 6-person team, 10 referrals
  spanning every required pipeline status, 5 matters (2 converted, 3 independent), plus tasks,
  calendar events, communications, notifications, activity log, subscription tiers, and workflow
  task templates.

## Data model

See `supabase/schema.sql` for the full production schema: `firms`, `offices`, `user_profiles`,
`permissions`, `referral_preferences`, `referrals`, `claim_assessments`, `referral_documents`,
`referral_timeline_events`, `referral_notes`, `conflict_checks` (+ `conflict_check_entities`),
`consultations`, `clients`, `consent_records`, `contacts`, `matters` (+ `matter_team_members`,
`matter_parties`, `matter_notes`, `matter_timeline_events`, `damages`), `documents` (+
`document_versions`), `tasks`, `task_templates`, `calendar_events`, `communications`,
`notifications`, `subscription_plans`, `usage_records`, `activity_logs`, `analytics_events`. Row
Level Security policies scope every firm-owned table to `firm_id = current_firm_id()`, derived from
the caller's `user_profiles` row, giving firm-level data isolation by default.

## Why client-side state for the MVP?

The brief requires a demo that "remains usable when Supabase has not yet been configured." Rather
than mocking a server, the MVP uses a real, typed state container with the same shape the
production Supabase-backed data layer would need — so swapping `localStorage` for Supabase calls is
a contained change inside `src/lib/store.tsx`, not a rewrite of every page.
