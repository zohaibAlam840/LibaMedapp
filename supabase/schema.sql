-- ============================================================================
-- LibaMed C2C — initial schema (Postgres / Supabase).
-- Paste this whole file into: Supabase dashboard → SQL Editor → New query → Run.
--
-- Design notes:
--  · Text + CHECK constraints use the EXACT string values from the TypeScript
--    union types (lib/caseStatus.ts, lib/referral.ts, lib/corridors.ts) so the
--    app needs zero value-mapping when reading rows.
--  · RLS is enabled on every table with NO permissive policies yet → default
--    DENY. The server-only service_role key bypasses RLS, so all access flows
--    through our server layer (lib/supabase/admin.ts). Real per-user policies
--    land when Supabase Auth is wired.
--  · The audit_log is append-only + hash-chained via triggers (immutable even
--    to service_role) — the compliance spine.
-- ============================================================================

create extension if not exists pgcrypto;   -- for digest() (audit hash chain)

-- ── Corridors (first-class config; admin-editable) ─────────────────────────
create table if not exists corridors (
  id                  text primary key,                 -- 'israel' | 'france' | 'turkey' | 'switzerland'
  label               text not null,                    -- 'UK → Israel'
  country             text not null,
  residency           text not null,                    -- where PHI is hosted
  transfer_basis      text not null check (transfer_basis in ('adequacy','scc')),
  safeguard           text not null,
  notification        jsonb,                             -- { authority, within_business_days } | null
  primary_hospital_id text,                              -- logical ref to hospitals.id
  created_at          timestamptz not null default now()
);

-- ── Hospitals (partner directory) ──────────────────────────────────────────
create table if not exists hospitals (
  id             text primary key,                       -- 'sheba'
  name           text not null,
  city           text not null,
  country        text not null,
  corridor_id    text references corridors(id),
  published      boolean not null default false,         -- shown on public site (admin toggle)
  intro          text,
  accreditation  jsonb not null default '[]',            -- [{ name, expires }]
  specialties    text[] not null default '{}',
  languages      text[] not null default '{}',
  clinicians     jsonb not null default '[]',            -- [{ name, role }]
  created_at     timestamptz not null default now()
);

-- ── Corridor ↔ specialty NHS-availability (eligibility gating) ──────────────
create table if not exists corridor_specialties (
  id           uuid primary key default gen_random_uuid(),
  corridor_id  text not null references corridors(id) on delete cascade,
  name         text not null,
  nhs          text not null check (nhs in ('nhs-unavailable','nhs-delayed','nhs-routine'))
);

-- ── Profiles (workforce roles + patient + introducer, all as access types) ──
create table if not exists profiles (
  id                 uuid primary key default gen_random_uuid(),
  auth_user_id       uuid,                                -- FK to auth.users when Auth is wired
  account_type       text not null check (account_type in ('clinician','introducer','patient')),
  clinician_role     text check (clinician_role in ('referring','receiving','coordinator','caseManager','admin')),
  name               text not null,
  email              text,
  account_status     text not null default 'verified' check (account_status in ('pending','verified','declined')),
  -- scoping attributes (Vol III §0.4)
  hospital_id        text references hospitals(id),
  corridor_ids       text[],
  can_manage_users   boolean not null default false,
  can_export_audit   boolean not null default false,
  can_edit_corridors boolean not null default false,
  -- clinician verification
  gmc_number         text,
  -- introducer fields
  company            text,
  job_title          text,
  reg_status         text check (reg_status in ('fca','employer')),
  fca_number         text,
  attested           boolean not null default false,
  -- patient scope (the single referral a patient may view) — FK added after referrals exist
  patient_referral_id uuid,
  created_at         timestamptz not null default now()
);

-- ── Referrals (the case) ───────────────────────────────────────────────────
create table if not exists referrals (
  id                 uuid primary key default gen_random_uuid(),
  ref                text unique not null,                -- 'LM-2026-0142'
  patient_ref        text not null,                       -- opaque; never a real name in lists
  corridor_id        text not null references corridors(id),
  hospital_id        text references hospitals(id),
  specialist         text,
  specialty          text,
  status             text not null default 'submitted'
                     check (status in ('submitted','under-review','plan-received','confirmed',
                                       'complete','summary-returned','consent-withdrawn','access-expired')),
  referring_user_id  uuid references profiles(id),
  treatment_scope    text,
  no_referrer_fee    boolean not null default true,
  -- NHS non-substitution declaration (item 1)
  ns_reason          text check (ns_reason in ('not-nhs-commissioned','patient-private-pay',
                                               'nhs-wait-exceeds-threshold','outside-nhs-pathway')),
  ns_justification   text,
  ns_declared_by     text,
  ns_declared_at     timestamptz,
  -- continuity-of-care / handback (item 3)
  handback_state     text not null default 'not-due'
                     check (handback_state in ('not-due','awaited','received','overdue')),
  handback_due_by    date,
  handback_received_at date,
  unread             integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- patient → single referral scope (added now that referrals exists)
alter table profiles
  drop constraint if exists profiles_patient_referral_fk;
alter table profiles
  add constraint profiles_patient_referral_fk
  foreign key (patient_referral_id) references referrals(id) on delete set null;

-- ── Patient consent (itemised, versioned — item 6) ─────────────────────────
create table if not exists patient_consent (
  id            uuid primary key default gen_random_uuid(),
  referral_id   uuid not null references referrals(id) on delete cascade,
  version       text not null,
  country       text not null,
  safeguard     text not null,
  items         jsonb not null default '[]',              -- [{ id, label, agreed }]
  captured_at   timestamptz not null default now(),
  withdrawn_at  timestamptz
);

-- ── Documents ──────────────────────────────────────────────────────────────
create table if not exists documents (
  id            uuid primary key default gen_random_uuid(),
  referral_id   uuid not null references referrals(id) on delete cascade,
  name          text not null,
  type          text,
  size          text,
  storage_path  text,                                     -- Supabase Storage key (later)
  uploaded_at   timestamptz not null default now()
);

-- ── Messages (clinician-to-clinician; patient_visible flag) ────────────────
create table if not exists messages (
  id              uuid primary key default gen_random_uuid(),
  referral_id     uuid not null references referrals(id) on delete cascade,
  sender_id       uuid references profiles(id),
  direction       text not null check (direction in ('incoming','outgoing')),
  body            text,
  attachment      jsonb,                                  -- { name, size } | null
  patient_visible boolean not null default true,
  read            boolean not null default false,
  created_at      timestamptz not null default now()
);

-- ── Audit log (append-only, hash-chained — item 2, compliance spine) ───────
create table if not exists audit_log (
  id           uuid primary key default gen_random_uuid(),
  referral_id  uuid references referrals(id) on delete set null,
  seq          bigint not null default 0,                -- per-referral sequence
  at           timestamptz not null default now(),
  actor        text not null,
  event        text not null,
  detail       text,
  prev_hash    text,
  hash         text,
  created_at   timestamptz not null default now()
);

-- Compute the per-referral sequence + hash chain on insert.
-- search_path pinned so digest() (pgcrypto, in the `extensions` schema on
-- Supabase) always resolves regardless of the caller's search_path.
create or replace function audit_log_chain()
returns trigger
language plpgsql
set search_path = public, extensions
as $$
declare
  last_seq  bigint;
  last_hash text;
begin
  select seq, hash into last_seq, last_hash
  from audit_log
  where referral_id is not distinct from new.referral_id
  order by seq desc
  limit 1;

  new.seq := coalesce(last_seq, 0) + 1;
  new.prev_hash := coalesce(last_hash, 'GENESIS');
  new.hash := encode(
    digest(
      new.prev_hash || '|' || coalesce(new.referral_id::text, '') || '|' ||
      new.seq::text || '|' || new.event || '|' || coalesce(new.detail, '') || '|' ||
      new.at::text,
      'sha256'
    ),
    'hex'
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_log_chain on audit_log;
create trigger trg_audit_log_chain
  before insert on audit_log
  for each row execute function audit_log_chain();

-- Immutability: block UPDATE and DELETE for everyone (incl. service_role).
create or replace function audit_log_immutable()
returns trigger language plpgsql as $$
begin
  raise exception 'audit_log is append-only: % is not permitted', tg_op;
end;
$$;

drop trigger if exists trg_audit_log_immutable on audit_log;
create trigger trg_audit_log_immutable
  before update or delete on audit_log
  for each row execute function audit_log_immutable();

-- ── Row-Level Security: default DENY (server-only service_role bypasses) ────
alter table corridors            enable row level security;
alter table hospitals            enable row level security;
alter table corridor_specialties enable row level security;
alter table profiles             enable row level security;
alter table referrals            enable row level security;
alter table patient_consent      enable row level security;
alter table documents            enable row level security;
alter table messages             enable row level security;
alter table audit_log            enable row level security;

-- Helpful indexes
create index if not exists idx_referrals_corridor  on referrals (corridor_id);
create index if not exists idx_referrals_status    on referrals (status);
create index if not exists idx_messages_referral   on messages (referral_id);
create index if not exists idx_documents_referral  on documents (referral_id);
create index if not exists idx_consent_referral    on patient_consent (referral_id);
create index if not exists idx_audit_referral      on audit_log (referral_id, seq);
create index if not exists idx_corr_spec_corridor  on corridor_specialties (corridor_id);
