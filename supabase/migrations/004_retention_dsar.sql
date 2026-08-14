-- Migration 004 — data-subject requests (DSAR) + retention
--
-- Under UK GDPR a patient may demand a copy of everything held about them, ask
-- for it to be corrected, or ask for it to be erased — and you must respond
-- within ONE MONTH. This adds the log, the clock, and the retention rules.
--
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run (everything is IF NOT EXISTS / idempotent).

-- ── Corridor retention periods ─────────────────────────────────────────────
-- How long a corridor's records must be kept before deletion. France requires
-- 20 years for health records; most others 10. Set per corridor because the
-- strictest rule of the two countries always wins.
alter table corridors add column if not exists retention_years integer not null default 10;

update corridors set retention_years = 20 where id = 'france' and retention_years = 10;

-- ── Referral retention state ───────────────────────────────────────────────
-- When the clock starts, when it expires, and whether the record has been
-- redacted (erased) already.
alter table referrals add column if not exists retention_until date;
alter table referrals add column if not exists redacted_at timestamptz;

-- ── Data-subject requests ──────────────────────────────────────────────────
create table if not exists data_requests (
  id            uuid primary key default gen_random_uuid(),
  -- Who is asking. A request can arrive before we know which referral it maps
  -- to, so the subject is identified by email/name and linked afterwards.
  subject_name  text not null,
  subject_email text,
  referral_id   uuid references referrals(id) on delete set null,
  kind          text not null
                check (kind in ('access','erasure','correction','portability')),
  status        text not null default 'open'
                check (status in ('open','in-progress','fulfilled','refused')),
  detail        text,                                   -- what they asked for
  -- Statutory deadline: one calendar month from receipt (UK GDPR Art. 12(3)).
  received_at   timestamptz not null default now(),
  due_at        timestamptz not null default (now() + interval '1 month'),
  closed_at     timestamptz,
  outcome       text,                                   -- what we did, for the file
  handled_by    uuid references profiles(id),
  created_at    timestamptz not null default now()
);

create index if not exists data_requests_open_idx on data_requests (status, due_at);
alter table data_requests enable row level security;   -- default-deny

-- ── Backfill retention dates for existing referrals ────────────────────────
-- Clock runs from the last activity on the case.
update referrals r
set retention_until = (r.updated_at + make_interval(years => c.retention_years))::date
from corridors c
where r.corridor_id = c.id and r.retention_until is null;

-- ── Erasure helper ─────────────────────────────────────────────────────────
-- GDPR erasure CANNOT simply delete: the audit log is append-only and
-- hash-chained, and destroying it would break the compliance evidence the
-- platform exists to provide. Instead we redact the personal data and keep the
-- audit skeleton, so "a document was accessed on this date" survives while the
-- person is no longer identifiable.
create or replace function redact_referral(p_referral_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update referrals set
    patient_ref      = 'REDACTED',
    clinical_summary = null,
    clinical_history = null,
    patient_dob      = null,
    patient_sex      = null,
    specialist       = specialist,          -- clinician names are not the subject's data
    redacted_at      = now()
  where id = p_referral_id;

  -- Message bodies and attachments can contain clinical detail about the person.
  update messages set body = null, attachment = null
  where referral_id = p_referral_id;

  -- Consent wording stays (it evidences lawful basis) but the itemised answers
  -- are the subject's own statements, so they go.
  update patient_consent set items = '[]'::jsonb
  where referral_id = p_referral_id;

  -- Document names often contain the patient's name; the bytes are removed
  -- separately from object storage by the application.
  update documents set name = 'REDACTED', storage_path = null
  where referral_id = p_referral_id;

  -- Clinical documents authored about the person.
  update treatment_plans    set proposed_care = 'REDACTED', notes = null
  where referral_id = p_referral_id;
  update clinical_summaries set treatment_performed = 'REDACTED', follow_up = null,
                                medication_changes = null, restrictions = null
  where referral_id = p_referral_id;

  -- Detach any patient portal account.
  update profiles set patient_referral_id = null
  where patient_referral_id = p_referral_id;

  -- The audit_log is deliberately UNTOUCHED — it is the immutable record that
  -- the erasure itself is written into.
end;
$$;

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from data_requests)                              as data_requests,
  (select count(*) from referrals where retention_until is not null) as referrals_with_retention,
  (select retention_years from corridors where id = 'france')        as france_years;
