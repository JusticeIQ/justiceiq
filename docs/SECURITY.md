# Security Model & Professional Responsibility Notes

## Current MVP posture

- **Client-side demo data only.** In demo mode, all firm/referral/matter data lives in the
  browser's `localStorage` under one namespaced key and never leaves the device.
- **No secrets in the client bundle.** `.env.example` separates `NEXT_PUBLIC_*` values (safe for
  the browser) from `SUPABASE_SERVICE_ROLE_KEY` and `JUSTICECHAMP_WEBHOOK_SECRET` (server-only,
  never imported into any client component).
- **Auth scaffolding** in `src/lib/supabase/client.ts` / `server.ts` is structured for Supabase
  Auth (`@supabase/ssr`) with the modern `getAll`/`setAll` cookie API.

## Production security requirements (see supabase/schema.sql)

- **Row Level Security (RLS)** is enabled on every firm-owned table, scoped through a
  `current_firm_id()` helper function that resolves the caller's firm from their `user_profiles`
  row. This gives **firm-level data isolation** by default — one firm's referrals, matters, and
  clients are never visible to another firm's users.
- **Matter-level and document-level permissions.** `documents.confidentiality` distinguishes
  `standard`, `confidential`, `privileged`, and `internal_only` records, and `client_visible`
  gates what a future client portal can show. Enforcing these distinctions at the RLS layer (not
  just in the UI) is called out as a roadmap item in `docs/ROADMAP.md` — the MVP currently applies
  them in application logic only.
- **Role-based access control.** Seven roles (Firm Administrator, Partner, Lawyer, Paralegal,
  Intake Coordinator, Legal Assistant, Read-Only Analyst) are modeled in `user_profiles.role`; see
  `docs/ROLES_PERMISSIONS.md` for the full permissions matrix, also rendered live on `/team`.
- **Conflict-check procedures.** The in-app conflict check (`/referrals/[id]`, "Run Conflict
  Check") is explicitly labeled throughout the UI as a simulated screening aid that does **not**
  replace the firm's formal, attorney-supervised conflict procedure.
- **Consent tracking.** `consent_records` tracks granted/declined consent, including a
  `source_consent_id` for consent that originated in JusticeChamp, per `docs/INTEGRATION_SPEC.md`.
- **Audit logs.** `activity_logs` records key actions per firm/user/matter/referral. Full
  immutable, tamper-evident audit logging (e.g. via append-only tables or an external log sink) is
  a roadmap item, not yet implemented.
- **Secure file access.** `documents.storage_path` is designed to reference objects in a private
  Supabase Storage bucket (`matter-documents`), scoped by firm and matter via storage-level RLS.
- **Session security.** Supabase Auth sessions are JWT-based with configurable expiry. Production
  configuration should set an idle/absolute session timeout appropriate for a legal-data product.
- **Multi-factor authentication** is a placeholder in this MVP (mentioned in Settings → Security)
  and is not implemented.
- **Data export & deletion.** Export (Reports → CSV) is simulated; a real data-deletion workflow
  (cascading through `on delete cascade` relationships already defined in the schema) is a roadmap
  item.
- **Retention settings** are not yet configurable; the schema supports adding a
  `retention_policy` table without breaking existing relationships.

## Pre-production compliance checklist

This MVP does **not** satisfy every professional-responsibility, privacy, or regulatory obligation
a real law firm platform would need. Before any production use, a firm and its technical team
should independently verify at least:

- [ ] Conflict-of-interest screening meets the firm's jurisdiction-specific ethical obligations
      (the in-app check is a triage aid only)
- [ ] Client confidentiality and privilege controls are enforced at the database/storage layer, not
      just in the UI
- [ ] Data residency, retention, and deletion practices meet applicable privacy law (e.g. state
      privacy statutes, and any jurisdiction-specific bar rules on client file retention)
- [ ] Multi-factor authentication and session security meet the firm's IT security policy
- [ ] A signed data processing agreement is in place between SolonIQ, JusticeChamp, and the firm
      covering consumer data shared via the referral pipeline
- [ ] Trust-accounting and billing integrations (LawPay, QuickBooks) are reviewed for compliance
      with applicable trust-accounting rules before enabling real money movement
- [ ] An independent security review / penetration test has been completed
- [ ] Incident-response and breach-notification procedures are documented and tested
- [ ] Bar association advertising and referral rules (where applicable) have been reviewed for the
      referral-matching workflow

## Explicitly out of scope for this MVP

- Real multi-factor authentication
- SOC 2 / independent compliance certification
- Production-grade conflict-of-interest database and screening
- Real trust accounting or payment processing
- Penetration testing / third-party security audit
