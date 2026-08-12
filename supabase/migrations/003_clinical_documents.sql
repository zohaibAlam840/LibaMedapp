-- Migration 003 — clinical documents + patient invitations
--
-- Completes the referral loop. Until now a case could reach "complete" without
-- any plan or summary ever being written: the status moved, no document existed.
--
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run (everything is IF NOT EXISTS / idempotent).

-- ── Referral: the clinical detail the wizard collects ──────────────────────
-- These were captured in the intake wizard but had nowhere to go, so the
-- receiving specialist was shown placeholder text instead of the real referral.
alter table referrals add column if not exists clinical_summary text;
alter table referrals add column if not exists clinical_history text;
alter table referrals add column if not exists urgency text
  check (urgency is null or urgency in ('routine','soon','urgent'));
alter table referrals add column if not exists patient_dob date;
alter table referrals add column if not exists patient_sex text;

-- ── Treatment plan (receiving → referring) ─────────────────────────────────
-- One current plan per referral. Costs are itemised because "no hidden fees"
-- is a public Pledge commitment, so a single total is not enough.
create table if not exists treatment_plans (
  id             uuid primary key default gen_random_uuid(),
  referral_id    uuid not null references referrals(id) on delete cascade,
  proposed_care  text not null,
  inpatient_stay text,
  cost_currency  text not null default 'GBP',
  cost_total     numeric(12,2),
  cost_items     jsonb not null default '[]',   -- [{ label, amount }]
  earliest_start date,
  notes          text,
  status         text not null default 'draft'
                 check (status in ('draft','sent')),
  submitted_by   uuid references profiles(id),
  submitted_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create unique index if not exists treatment_plans_referral_uniq
  on treatment_plans (referral_id);

-- ── Clinical summary / handback (receiving → referring) ────────────────────
-- NHS safeguard #3: the structured handback to UK care, due within 5 working
-- days of treatment completion.
create table if not exists clinical_summaries (
  id                 uuid primary key default gen_random_uuid(),
  referral_id        uuid not null references referrals(id) on delete cascade,
  treatment_performed text not null,
  follow_up          text,
  medication_changes text,
  restrictions       text,
  status             text not null default 'draft'
                     check (status in ('draft','sent')),
  submitted_by       uuid references profiles(id),
  submitted_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create unique index if not exists clinical_summaries_referral_uniq
  on clinical_summaries (referral_id);

-- ── Requests for more information (receiving → referring) ──────────────────
-- Many per referral; each is answered or withdrawn.
create table if not exists info_requests (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references referrals(id) on delete cascade,
  items        text[] not null default '{}',    -- e.g. {'Histopathology','Recent bloods'}
  note         text,
  status       text not null default 'open'
               check (status in ('open','answered')),
  requested_by uuid references profiles(id),
  answered_by  uuid references profiles(id),
  answer       text,
  created_at   timestamptz not null default now(),
  answered_at  timestamptz
);
create index if not exists info_requests_referral_idx
  on info_requests (referral_id, created_at desc);

-- ── Patient invitations ────────────────────────────────────────────────────
-- A patient is an external data subject scoped to ONE referral. The referring
-- clinician issues a single-use token; redeeming it creates the account and
-- binds it to that referral (profiles.patient_referral_id).
create table if not exists patient_invitations (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid not null references referrals(id) on delete cascade,
  email        text not null,
  token        text not null unique,
  invited_by   uuid references profiles(id),
  redeemed_at  timestamptz,
  expires_at   timestamptz not null default (now() + interval '14 days'),
  created_at   timestamptz not null default now()
);
create index if not exists patient_invitations_token_idx
  on patient_invitations (token);

-- ── RLS: enabled + default deny (service role bypasses, as elsewhere) ──────
alter table treatment_plans      enable row level security;
alter table clinical_summaries   enable row level security;
alter table info_requests        enable row level security;
alter table patient_invitations  enable row level security;

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from treatment_plans)     as treatment_plans,
  (select count(*) from clinical_summaries)  as clinical_summaries,
  (select count(*) from info_requests)       as info_requests,
  (select count(*) from patient_invitations) as patient_invitations;
