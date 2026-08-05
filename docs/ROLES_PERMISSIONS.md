# Role & Permissions Matrix

Seven roles are modeled in `user_profiles.role` (see `src/lib/types.ts` → `UserRole`) and rendered
live on `/team`.

| Role | Typical use |
|---|---|
| Firm Administrator | Full administrative control: billing, team, settings, integrations |
| Partner | Full case and team visibility; typically excludes deep billing/security config |
| Lawyer | Owns and works referrals and matters within their practice area |
| Paralegal | Supports matters: documents, tasks, scheduling; no referral decisioning |
| Intake Coordinator | Triages new referrals; limited matter access |
| Legal Assistant | Administrative support on assigned matters |
| Read-Only Analyst | Firm-wide visibility for reporting, no edit rights |

## Permissions matrix

| Permission | Firm Admin | Partner | Lawyer | Paralegal | Intake Coordinator | Legal Assistant | Read-Only Analyst |
|---|---|---|---|---|---|---|---|
| View referrals | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Respond to referrals (accept/decline/request info) | ✓ | ✓ | ✓ | — | ✓ | — | — |
| Convert referral to matter | ✓ | ✓ | ✓ | — | — | — | — |
| Edit matters (tasks, documents, notes, timeline) | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| Delete matters | ✓ | ✓ | — | — | — | — | — |
| Manage billing | ✓ | ✓ | — | — | — | — | — |
| Manage team & permissions | ✓ | — | — | — | — | — | — |
| View analytics | ✓ | ✓ | ✓ | — | — | — | ✓ |
| Export data | ✓ | ✓ | — | — | — | — | — |

This matrix is also rendered live at `/team` (bottom of page) so it stays visible during a demo.

## Enforcement model

- **This MVP**: permissions are illustrative only; the demo does not gate UI by role since there is
  a single simulated "logged in" user (Sarah Kim, Managing Partner) for demo purposes.
- **Production**: enforce this matrix in two layers —
  1. **UI layer**: hide/disable actions the current user's role does not permit.
  2. **Database layer**: Supabase RLS policies keyed off `user_profiles.role`, so permission
     enforcement does not depend on the client behaving correctly. `supabase/schema.sql` includes a
     `permissions` reference table and firm-isolation policies as the foundation for this; per-role
     policies (e.g. blocking a Read-Only Analyst from `insert`/`update`/`delete`) are a roadmap item
     — see `docs/ROADMAP.md`.
