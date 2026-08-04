-- Migration 002 — public directory control.
--
--  · corridors.published / display_order  → admin decides which corridors appear
--    on the public site and in what order.
--  · doctors                              → named clinicians as real rows, so a
--    hospital can submit them and an admin can approve + feature them publicly.
--
-- Safe to re-run (idempotent). Paste into the Supabase SQL editor.

-- ── Corridors: publish control ─────────────────────────────────────────────
alter table corridors add column if not exists published     boolean not null default true;
alter table corridors add column if not exists display_order integer not null default 0;

-- ── Doctors (named receiving clinicians / featured specialists) ────────────
create table if not exists doctors (
  id            uuid primary key default gen_random_uuid(),
  hospital_id   text references hospitals(id) on delete cascade,
  name          text not null,
  role          text,                                   -- specialty / job title
  bio           text,
  languages     text[] not null default '{}',
  photo_url     text,
  -- Submitted by a hospital, approved by an admin. Only 'approved' is public.
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  -- Admin promotes a subset of approved doctors onto the public home page.
  featured      boolean not null default false,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists doctors_hospital_idx on doctors (hospital_id);
create index if not exists doctors_public_idx   on doctors (status, featured);

alter table doctors enable row level security;  -- default-deny; service_role bypasses

-- Backfill from the hospitals.clinicians jsonb so existing partner data carries
-- over. Runs only for hospitals that have no doctors rows yet.
insert into doctors (hospital_id, name, role, status)
select h.id, c->>'name', c->>'role', 'approved'
from hospitals h
cross join lateral jsonb_array_elements(h.clinicians) as c
where not exists (select 1 from doctors d where d.hospital_id = h.id);
