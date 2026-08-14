# SolonIQ™ — Lawyer Portal & Case Management MVP

SolonIQ is the professional law-firm portal connected to **JusticeChamp™ Consumer Intake**. It lets
participating lawyers and firms receive qualified referrals, review structured claim information,
communicate with clients, manage matters end to end, and generate legal-business intelligence.

> SolonIQ is a technology platform. It does not provide legal advice, does not replace a firm's
> conflict-check procedure, and does not guarantee outcomes. See `docs/SECURITY.md` for the
> pre-production compliance checklist.

## Quick start (demo mode)

The app runs fully in **seeded demo mode** with no external services required.

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, click **Continue with demo law firm** on the login page, and you'll
land in a dashboard pre-loaded with a fictional mid-sized firm, a 10-referral pipeline (including
two brand-new JusticeChamp referrals), five active matters, tasks, calendar events, and analytics.

Demo mode uses browser `localStorage` (no backend), so it works immediately without Supabase.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript** + **React 18**
- **Tailwind CSS**, with a graphite/navy/teal B2B design system in `src/components/ui.tsx`
- **Supabase** client scaffolding (`@supabase/supabase-js`, `@supabase/ssr`) for auth, Postgres, and
  file storage — wired up but optional; falls back to demo mode automatically
- Deployable to **Vercel**

## Project structure

```
justiceiq/
├── src/
│   ├── app/                        # Next.js App Router routes (see route table below)
│   ├── components/                 # Sidebar, Topbar, AppShell, MatterWorkspace, AI panel, etc.
│   └── lib/
│       ├── types.ts                # Full domain model (mirrors supabase/schema.sql)
│       ├── demo-data.ts            # Seeded fictional firm/team/referrals/matters/etc.
│       ├── store.tsx               # Client-side app state (React Context + localStorage)
│       └── supabase/               # Browser + server Supabase client factories
├── supabase/
│   ├── schema.sql                  # Full production Postgres schema + RLS policies
│   └── seed.sql                    # Reference seed data (subscription plans, task templates)
├── docs/                           # Architecture, integration spec, security, roles, API, demo
│                                    # script, test checklist, limitations, roadmap, CTO notes
├── .env.example
└── package.json
```

## Routes

| Route | Description |
|---|---|
| `/`, `/login`, `/signup`, `/forgot-password`, `/firm-setup` | Marketing page and firm auth/onboarding |
| `/dashboard` | Firm-wide dashboard: referrals, matters, deadlines, performance |
| `/referrals`, `/referrals/[referralId]` | Referral pipeline (table + Kanban) and full review workflow |
| `/matters`, `/matters/[matterId]/...` | Case list and matter workspace (12 tabs; 6 have dedicated routes) |
| `/calendar` | Firm calendar: month/week/day/deadline-list views |
| `/contacts`, `/clients` | Contact and client directories |
| `/team` | Team administration, workload, permissions matrix |
| `/tasks` | Cross-matter task list (bonus route beyond the base spec, linked from the sidebar) |
| `/reports`, `/analytics` | Operational reports and executive analytics dashboard |
| `/subscription` | Illustrative 5-tier subscription plans |
| `/settings`, `/integrations` | Firm configuration and (placeholder) third-party integrations |
| `/help`, `/demo` | Help center and an 18-step guided demo tour |

The matter workspace (`/matters/[matterId]`) has 12 conceptual tabs. Overview, Documents, Timeline,
Tasks, Communications, and Billing have dedicated routes per the spec; Client, Calendar, Notes,
Parties, Damages, and Activity Log are reachable via `?tab=` on the base matter route — all are
linked from the same tab bar, so every tab is one click away regardless of URL shape.

## How demo mode works

`src/lib/store.tsx` exposes `AppStateProvider`, a React Context store persisted to `localStorage`.
"Continue with demo law firm" seeds:

- 1 fictional firm (Delgado Chandra & Kim LLP) with 2 offices and a Gold subscription
- 6 team members covering every required role (Managing Partner, PI lawyer, Employment lawyer,
  Intake Coordinator, Paralegal, Firm Administrator)
- 10 referrals spanning all required demo scenarios (2 brand-new JusticeChamp referrals, one
  awaiting more info, one with a scheduled consultation, one accepted-ready-to-convert, one
  declined, two already converted to matters, plus an under-review and a conflict example)
- 5 active matters (2 converted from referrals, 3 independently seeded) with parties, timelines,
  documents, notes, and damages
- Tasks, calendar events, communications, notifications, and an activity log

All sample names, firms, and figures are **fictional demonstration content**.

## Connecting real Supabase (production path)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the Supabase SQL editor
3. Run `supabase/seed.sql` for reference data (subscription plans, task templates)
4. Copy `.env.example` to `.env.local` and fill in your project's URL and anon key
5. Replace `useAppState()` store calls with Supabase queries — see `docs/ARCHITECTURE.md`

See `docs/DEPLOYMENT.md` for full Supabase, Vercel, and GitHub instructions.

## JusticeChamp integration

SolonIQ is designed to receive referrals from JusticeChamp Consumer Intake via a documented API
contract — see `docs/INTEGRATION_SPEC.md` for the proposed shared data model and
`docs/API_SPEC.md` for example endpoints (create referral, update status, schedule consultation,
convert to matter, and more). In this MVP, that connection is simulated: referrals `ref-1` and
`ref-2` in the seed data represent freshly-arrived JusticeChamp referrals, and `sourceClaimId`
values (e.g. `claim-pi-1`) intentionally match the demo claim IDs used in the companion
JusticeChamp MVP to illustrate the intended cross-product linkage.

## Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture description
- [`docs/INTEGRATION_SPEC.md`](docs/INTEGRATION_SPEC.md) — JusticeChamp ⇄ SolonIQ integration spec
- [`docs/API_SPEC.md`](docs/API_SPEC.md) — example endpoints / server actions
- [`docs/SECURITY.md`](docs/SECURITY.md) — security model + pre-production compliance checklist
- [`docs/ROLES_PERMISSIONS.md`](docs/ROLES_PERMISSIONS.md) — role and permissions matrix
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — presenter-ready demo script
- [`docs/TEST_CHECKLIST.md`](docs/TEST_CHECKLIST.md) — manual QA checklist
- [`docs/LIMITATIONS.md`](docs/LIMITATIONS.md) — known MVP limitations
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — production-readiness roadmap
- [`docs/CTO_REVIEW_NOTES.md`](docs/CTO_REVIEW_NOTES.md) — notes for a technical reviewer
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — local, Supabase, Vercel, and GitHub setup

## Demo credentials

No password required — click "Continue with demo law firm" on `/login`, `/signup`, or `/demo`.
Manual email/password sign-in accepts any non-empty combination in demo mode and loads the same
seeded firm (there is no real backend to authenticate against yet).

## License / disclaimer

All firm, lawyer, client, and referral data shown is fictional demonstration content created for
this MVP. SolonIQ is not a law firm and does not provide legal advice.
