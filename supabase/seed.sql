-- JusticeIQ seed data (fictional demonstration content only).
-- Run after schema.sql.
--
-- Reference data (subscription plans, task templates) does not depend on
-- a firm or authenticated user and can be seeded immediately. Firm,
-- user, referral, and matter seed data require real IDs from a firm you
-- create via the signup/firm-setup flow (user_profiles.id must match a
-- real auth.users.id created via Supabase Auth) — substitute your own
-- UUIDs where marked below, or use the app's built-in demo mode
-- (src/lib/demo-data.ts) which needs no database at all.

-- ---------------------------------------------------------------------
-- Subscription plans
-- ---------------------------------------------------------------------

insert into public.subscription_plans (id, name, monthly_price, max_users, max_referrals_per_month, max_active_matters, storage_gb, ai_assistance, workflow_automation, advanced_reporting, integrations, multi_office, custom_intake_criteria, business_intelligence) values
  ('basic', 'Basic', 0, 2, 5, 10, 5, false, false, false, false, false, false, false),
  ('bronze', 'Bronze', 149, 5, 20, 40, 25, false, true, false, false, false, true, false),
  ('silver', 'Silver', 349, 15, 60, 150, 100, true, true, true, true, false, true, false),
  ('gold', 'Gold', 749, 40, 150, 400, 500, true, true, true, true, true, true, true),
  ('platinum', 'Platinum', 1499, null, null, null, 2000, true, true, true, true, true, true, true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Example firm (replace with your own firm's UUID after signup)
-- ---------------------------------------------------------------------
-- insert into public.firms (id, name, practice_areas, jurisdictions, firm_size, languages, minimum_case_criteria, conflict_screening_procedure, consultation_availability, notification_preferences, subscription_tier)
-- values (
--   '44444444-4444-4444-4444-444444444401', 'Delgado Chandra & Kim LLP', array['personal_injury','employment'], array['California'],
--   '11-25 attorneys and staff', array['English','Spanish','Hindi','Vietnamese'],
--   'Estimated damages above $25,000, or employment matters involving termination, discrimination, or retaliation within the last 3 years.',
--   'All new referrals are screened against the firm conflict database before consultation scheduling.',
--   'Monday-Friday, 9am-5pm Pacific', array['New referral email + in-app', 'Deadline reminders 7/3/1 days out'], 'gold'
-- );

-- ---------------------------------------------------------------------
-- Task templates (firm_id left null = available to all firms as a
-- starter library; clone per-firm in the application layer on first use)
-- ---------------------------------------------------------------------

insert into public.task_templates (firm_id, name, applies_to, tasks) values
  (null, 'New personal injury file', 'personal_injury', '["Open matter file and assign matter number","Send engagement letter for signature","Request medical records authorization","Request police/incident report","Calendar statute of limitations deadline"]'),
  (null, 'New employment file', 'employment', '["Open matter file and assign matter number","Send engagement letter for signature","Request employment records and correspondence","Confirm administrative filing deadlines","Calendar filing deadline"]'),
  (null, 'Initial consultation', 'both', '["Confirm consultation time with client","Send preparation instructions","Prepare consultation question list","Record consultation outcome","Follow up within 48 hours"]'),
  (null, 'Demand package', 'both', '["Compile supporting documentation","Draft demand letter","Internal review of demand letter","Send demand letter","Calendar response follow-up date"]'),
  (null, 'Pleadings preparation', 'both', '["Draft complaint","Internal review of complaint","File complaint with court","Confirm service of process","Calendar defendant''s response deadline"]'),
  (null, 'Discovery preparation', 'both', '["Draft written discovery requests","Serve discovery requests","Calendar response deadlines","Prepare client for deposition","Review opposing party''s discovery responses"]'),
  (null, 'Mediation preparation', 'both', '["Confirm mediator and venue","Draft mediation brief","Prepare settlement range with client","Compile exhibits","Debrief client after mediation"]'),
  (null, 'File closing', 'both', '["Confirm final resolution and disbursement","Send closing letter to client","Archive matter documents","Close client portal access","Update matter status to Closed"]');

-- ---------------------------------------------------------------------
-- Example referral from JusticeChamp (replace :firm_id after creating a firm)
-- ---------------------------------------------------------------------
-- insert into public.referrals (firm_id, source, source_claim_id, consumer_name, consumer_anonymized_id, category, subtype, jurisdiction, incident_date, status, response_deadline, match_explanation, consumer_objectives)
-- values (
--   :firm_id, 'JusticeChamp Consumer Intake', 'claim-pi-1', 'Jordan Reyes', 'Consumer #48213', 'personal_injury',
--   'Motor vehicle accident', 'California', '2026-05-14', 'new', now() + interval '4 days',
--   'Matches firm practice area, jurisdiction, and case type.', 'Recover costs of medical treatment and lost wages.'
-- );
