-- JusticeIQ production database schema (PostgreSQL / Supabase)
-- Run in the Supabase SQL editor, or via `supabase db push`.
-- Designed so a future JusticeChamp consumer database can securely
-- connect to JusticeIQ through shared referral and consent records
-- (see referrals.source_claim_id / source_consent_id and
-- docs/INTEGRATION_SPEC.md for the proposed API contract). JusticeChamp
-- and JusticeIQ are treated as separate services/databases in this
-- design; source_claim_id is a foreign reference to JusticeChamp's own
-- `claims.id`, not a same-database foreign key.

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------
-- Firms, offices, users, roles
-- ---------------------------------------------------------------------

create table if not exists public.firms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  practice_areas text[] not null default '{}',
  jurisdictions text[] not null default '{}',
  firm_size text,
  primary_administrator_id uuid,
  languages text[] not null default '{}',
  minimum_case_criteria text,
  conflict_screening_procedure text,
  consultation_availability text,
  notification_preferences text[] not null default '{}',
  subscription_tier text not null default 'basic' check (subscription_tier in ('basic','bronze','silver','gold','platinum')),
  created_at timestamptz not null default now()
);

create table if not exists public.offices (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  name text not null,
  address text,
  jurisdiction text
);

-- Supabase Auth manages auth.users; this table stores JusticeIQ-specific
-- profile and role data, scoped to a single firm per user in this MVP.
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  firm_id uuid not null references public.firms(id) on delete cascade,
  full_name text not null,
  email text not null,
  title text,
  role text not null check (role in ('firm_admin','partner','lawyer','paralegal','intake_coordinator','legal_assistant','read_only_analyst')),
  practice_areas text[] not null default '{}',
  jurisdictions text[] not null default '{}',
  languages text[] not null default '{}',
  active boolean not null default true,
  capacity int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_firm on public.user_profiles(firm_id);

-- Static reference table describing what each role can do; enforced in
-- application logic and mirrored by RLS policies below.
create table if not exists public.permissions (
  id uuid primary key default uuid_generate_v4(),
  role text not null,
  permission_key text not null,
  allowed boolean not null default false,
  unique (role, permission_key)
);

-- ---------------------------------------------------------------------
-- Referral preferences, referrals, notes, conflict checks, consultations
-- ---------------------------------------------------------------------

create table if not exists public.referral_preferences (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  practice_area text not null,
  jurisdiction text not null,
  min_claim_readiness_score int default 0,
  languages text[] not null default '{}',
  default_owner_id uuid references public.user_profiles(id)
);

create table if not exists public.referrals (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  -- External reference into the JusticeChamp consumer database. Not a
  -- same-database FK; validated and synced via the integration API.
  source text not null default 'JusticeChamp Consumer Intake',
  source_claim_id text,
  source_consent_id text,
  consumer_name text not null,
  consumer_anonymized_id text not null,
  category text not null check (category in ('personal_injury','employment')),
  subtype text,
  jurisdiction text,
  incident_date date,
  submitted_at timestamptz not null default now(),
  status text not null default 'new' check (status in (
    'new','under_review','more_info_requested','consultation_requested','consultation_scheduled',
    'accepted','declined','conflict','referred_elsewhere','converted'
  )),
  assigned_lawyer_id uuid references public.user_profiles(id),
  response_deadline timestamptz,
  match_explanation text,
  consumer_objectives text,
  incident_overview text,
  parties text,
  chronology text,
  injuries_or_consequences text,
  medical_or_workplace_response text,
  financial_losses text,
  witnesses text,
  potential_deadline_concerns text,
  decline_reason text,
  decline_detail text,
  converted_matter_id uuid,
  consent_to_share boolean not null default false,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_firm on public.referrals(firm_id);
create index if not exists idx_referrals_status on public.referrals(status);
create index if not exists idx_referrals_source_claim on public.referrals(source_claim_id);

create table if not exists public.claim_assessments (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  claim_readiness int not null,
  information_completeness int not null,
  evidence_strength int not null,
  timeline_clarity int not null,
  document_availability int not null,
  urgency text not null check (urgency in ('low','moderate','high')),
  ai_confidence int not null,
  identified_uncertainties jsonb not null default '[]',
  suggested_consultation_questions jsonb not null default '[]',
  generated_at timestamptz not null default now()
);

create table if not exists public.referral_documents (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  name text not null,
  category text,
  description text,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.referral_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  people_involved text,
  significance text not null default 'medium' check (significance in ('low','medium','high'))
);

create table if not exists public.referral_notes (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  author_id uuid not null references public.user_profiles(id),
  body text not null,
  visibility text not null default 'internal' check (visibility in ('internal','team')),
  created_at timestamptz not null default now()
);

create table if not exists public.conflict_checks (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid references public.referrals(id) on delete cascade,
  matter_id uuid,
  status text not null default 'not_started' check (status in ('not_started','in_progress','clear','potential_conflict','conflict_confirmed')),
  run_at timestamptz,
  run_by uuid references public.user_profiles(id)
);

create table if not exists public.conflict_check_entities (
  id uuid primary key default uuid_generate_v4(),
  conflict_check_id uuid not null references public.conflict_checks(id) on delete cascade,
  name text not null,
  role text not null check (role in ('consumer','opposing_party','employer','insurer','witness','related_organization')),
  status text not null default 'not_started' check (status in ('not_started','in_progress','clear','potential_conflict','conflict_confirmed'))
);

create table if not exists public.consultations (
  id uuid primary key default uuid_generate_v4(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  lawyer_id uuid references public.user_profiles(id),
  proposed_times timestamptz[] not null default '{}',
  confirmed_time timestamptz,
  meeting_type text not null check (meeting_type in ('phone','video','in_person')),
  preparation_instructions text,
  status text not null default 'proposed' check (status in ('proposed','confirmed','completed','cancelled','rescheduled')),
  outcome text check (outcome in ('retained','follow_up_required','declined_by_firm','declined_by_consumer','referred_elsewhere','pending_documents')),
  outcome_notes text
);

-- ---------------------------------------------------------------------
-- Clients, contacts
-- ---------------------------------------------------------------------

create table if not exists public.clients (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  address text,
  relationship_owner_id uuid references public.user_profiles(id),
  portal_status text not null default 'not_created' check (portal_status in ('not_created','invited','active')),
  created_at timestamptz not null default now()
);

create table if not exists public.consent_records (
  id uuid primary key default uuid_generate_v4(),
  client_id uuid references public.clients(id) on delete cascade,
  -- External reference to a JusticeChamp consent record, when the
  -- consent originated from the consumer app rather than JusticeIQ.
  source_consent_id text,
  label text not null,
  granted boolean not null,
  recorded_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  name text not null,
  organization text,
  role text,
  email text,
  phone text,
  address text,
  jurisdiction text,
  notes text,
  communication_preference text
);

create table if not exists public.contact_matters (
  contact_id uuid not null references public.contacts(id) on delete cascade,
  matter_id uuid not null,
  primary key (contact_id, matter_id)
);

-- ---------------------------------------------------------------------
-- Matters
-- ---------------------------------------------------------------------

create table if not exists public.matters (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_number text not null,
  source_referral_id uuid references public.referrals(id),
  client_id uuid not null references public.clients(id),
  matter_name text not null,
  category text not null check (category in ('personal_injury','employment')),
  practice_area text,
  responsible_lawyer_id uuid references public.user_profiles(id),
  stage text not null default 'Intake',
  status text not null default 'active' check (status in ('active','on_hold','closed')),
  open_date date not null default current_date,
  next_deadline date,
  next_deadline_label text,
  risk_status text not null default 'on_track' check (risk_status in ('on_track','attention','at_risk')),
  case_goals text,
  next_recommended_action text,
  retainer_status text not null default 'not_signed' check (retainer_status in ('not_signed','signed','pending')),
  consent_status text not null default 'pending' check (consent_status in ('granted','pending','declined')),
  client_portal_status text not null default 'not_created' check (client_portal_status in ('not_created','invited','active')),
  jurisdiction text,
  last_activity_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.matters add constraint uq_matter_number_per_firm unique (firm_id, matter_number);
create index if not exists idx_matters_firm on public.matters(firm_id);

create table if not exists public.matter_team_members (
  matter_id uuid not null references public.matters(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  primary key (matter_id, user_id)
);

create table if not exists public.matter_parties (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  name text not null,
  role text not null check (role in ('client','opposing_party','employer','insurer','defence_lawyer','witness','medical_provider','expert','other')),
  contact_info text
);

create table if not exists public.matter_notes (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  author_id uuid references public.user_profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.matter_timeline_events (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  event_date date not null,
  title text not null,
  description text,
  people_involved text,
  significance text not null default 'medium' check (significance in ('low','medium','high'))
);

create table if not exists public.damages (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  category text not null,
  description text,
  amount numeric(12,2) not null default 0
);

-- ---------------------------------------------------------------------
-- Documents (matter-level; storage bucket "matter-documents")
-- ---------------------------------------------------------------------

create table if not exists public.documents (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  storage_path text,
  name text not null,
  folder text,
  category text,
  uploaded_by uuid references public.user_profiles(id),
  confidentiality text not null default 'standard' check (confidentiality in ('standard','confidential','privileged','internal_only')),
  client_visible boolean not null default false,
  tags text[] not null default '{}',
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.document_versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references public.documents(id) on delete cascade,
  storage_path text not null,
  version_number int not null default 1,
  uploaded_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Tasks & workflow templates
-- ---------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  matter_id uuid not null references public.matters(id) on delete cascade,
  title text not null,
  assignee_id uuid references public.user_profiles(id),
  due_date date,
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'not_started' check (status in ('not_started','in_progress','waiting','complete','cancelled')),
  description text,
  checklist jsonb not null default '[]',
  dependency_task_id uuid references public.tasks(id),
  reminder_at timestamptz,
  related_document_id uuid references public.documents(id),
  created_by uuid references public.user_profiles(id),
  completion_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_matter on public.tasks(matter_id);
create index if not exists idx_tasks_assignee on public.tasks(assignee_id);

create table if not exists public.task_templates (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid references public.firms(id) on delete cascade,
  name text not null,
  applies_to text not null default 'both' check (applies_to in ('personal_injury','employment','both')),
  tasks jsonb not null default '[]'
);

-- ---------------------------------------------------------------------
-- Calendar, communications, notifications
-- ---------------------------------------------------------------------

create table if not exists public.calendar_events (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid references public.matters(id) on delete cascade,
  referral_id uuid references public.referrals(id) on delete cascade,
  title text not null,
  type text not null check (type in (
    'consultation','limitation_period','court_deadline','filing_deadline','medical_appointment',
    'client_meeting','discovery','mediation','hearing','trial','internal_review','follow_up'
  )),
  event_date date not null,
  event_time time,
  lawyer_id uuid references public.user_profiles(id),
  description text
);

create table if not exists public.communications (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  matter_id uuid references public.matters(id) on delete cascade,
  referral_id uuid references public.referrals(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  type text not null check (type in ('secure_message','email_log','phone_note','consultation_note','internal_comment','document_request','automated_reminder')),
  from_label text,
  to_label text,
  subject text,
  body text,
  team_member_id uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  message text not null,
  type text not null default 'system' check (type in ('referral','deadline','task','message','system')),
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Subscription, usage, activity, analytics
-- ---------------------------------------------------------------------

create table if not exists public.subscription_plans (
  id text primary key,
  name text not null,
  monthly_price numeric(10,2) not null default 0,
  max_users int,
  max_referrals_per_month int,
  max_active_matters int,
  storage_gb int,
  ai_assistance boolean not null default false,
  workflow_automation boolean not null default false,
  advanced_reporting boolean not null default false,
  integrations boolean not null default false,
  multi_office boolean not null default false,
  custom_intake_criteria boolean not null default false,
  business_intelligence boolean not null default false
);

create table if not exists public.usage_records (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  referrals_received int not null default 0,
  active_matters int not null default 0,
  storage_used_gb numeric(10,2) not null default 0
);

create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  user_id uuid references public.user_profiles(id),
  matter_id uuid references public.matters(id) on delete set null,
  referral_id uuid references public.referrals(id) on delete set null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default uuid_generate_v4(),
  firm_id uuid not null references public.firms(id) on delete cascade,
  event_name text not null,
  properties jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row Level Security — firm-level isolation + matter/referral scoping
-- ---------------------------------------------------------------------

alter table public.user_profiles enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_notes enable row level security;
alter table public.conflict_checks enable row level security;
alter table public.consultations enable row level security;
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.matters enable row level security;
alter table public.matter_notes enable row level security;
alter table public.documents enable row level security;
alter table public.tasks enable row level security;
alter table public.calendar_events enable row level security;
alter table public.communications enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;

-- Helper: resolve the calling user's firm_id from their profile.
create or replace function public.current_firm_id() returns uuid
language sql stable as $$
  select firm_id from public.user_profiles where id = auth.uid();
$$;

create policy "profile is firm-scoped" on public.user_profiles
  for select using (firm_id = public.current_firm_id());
create policy "profile self-update" on public.user_profiles
  for update using (id = auth.uid());

create policy "referrals are firm-isolated" on public.referrals
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());
create policy "referral notes follow referral firm" on public.referral_notes
  for all using (exists (select 1 from public.referrals r where r.id = referral_id and r.firm_id = public.current_firm_id()));
create policy "conflict checks follow referral firm" on public.conflict_checks
  for all using (referral_id is null or exists (select 1 from public.referrals r where r.id = referral_id and r.firm_id = public.current_firm_id()));
create policy "consultations follow referral firm" on public.consultations
  for all using (exists (select 1 from public.referrals r where r.id = referral_id and r.firm_id = public.current_firm_id()));

create policy "clients are firm-isolated" on public.clients
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());
create policy "contacts are firm-isolated" on public.contacts
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());

create policy "matters are firm-isolated" on public.matters
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());
create policy "matter notes follow matter firm" on public.matter_notes
  for all using (exists (select 1 from public.matters m where m.id = matter_id and m.firm_id = public.current_firm_id()));
create policy "documents follow matter firm" on public.documents
  for all using (exists (select 1 from public.matters m where m.id = matter_id and m.firm_id = public.current_firm_id()));
create policy "tasks follow matter firm" on public.tasks
  for all using (exists (select 1 from public.matters m where m.id = matter_id and m.firm_id = public.current_firm_id()));

create policy "calendar events are firm-isolated" on public.calendar_events
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());
create policy "communications are firm-isolated" on public.communications
  for all using (firm_id = public.current_firm_id()) with check (firm_id = public.current_firm_id());
create policy "notifications are self-accessible" on public.notifications
  for all using (user_id = auth.uid());
create policy "activity logs are firm-isolated" on public.activity_logs
  for select using (firm_id = public.current_firm_id());

-- Matter-level and document confidentiality permissions (e.g. hiding
-- privileged/internal-only documents from certain roles, or scoping a
-- read-only analyst to aggregate views) are enforced in application
-- logic on top of these firm-level policies in this MVP. Production
-- hardening should add role-aware policies per docs/SECURITY.md.

-- ---------------------------------------------------------------------
-- Storage (run once)
-- ---------------------------------------------------------------------
-- insert into storage.buckets (id, name, public) values ('matter-documents', 'matter-documents', false)
--   on conflict (id) do nothing;
-- Configure storage RLS so only members of the owning firm can read/write
-- objects under matter-documents/{firm_id}/{matter_id}/..., and so
-- privileged/internal-only documents are excluded from any future
-- client-portal storage policies.
