-- 006 · Introducer origination + UK-clinician co-sign
--
-- An introducer (an FCA-regulated or employer-verified non-clinician) may
-- ORIGINATE a case, but never send it. Before a referral reaches a hospital a
-- UK-registered clinician must co-sign it and thereby become the referring
-- clinician of record. That is the whole point of the gate: the clinical
-- decision stays with a clinician, and the audit log shows exactly who made it.
--
-- Two new pre-pipeline statuses:
--   draft            — the introducer is still writing it; nobody else sees it
--   awaiting-cosign  — submitted, sitting in the co-sign queue
-- A co-signed case becomes an ordinary 'submitted' referral with
-- referring_user_id set to the clinician who signed, so every existing query,
-- scope rule and notification keeps working unchanged.

alter table referrals
  add column if not exists introducer_user_id uuid references profiles(id),
  add column if not exists cosign_state text not null default 'not-required',
  add column if not exists cosigned_by  uuid references profiles(id),
  add column if not exists cosigned_at  timestamptz,
  add column if not exists cosign_note  text;

-- Widen the status check. Written as drop-then-add because Postgres has no
-- "alter check"; the name is the one the original schema gives it.
alter table referrals drop constraint if exists referrals_status_check;
alter table referrals add constraint referrals_status_check
  check (status in ('draft','awaiting-cosign','submitted','under-review','plan-received',
                      'confirmed','complete','summary-returned','consent-withdrawn','access-expired'));

alter table referrals drop constraint if exists referrals_cosign_state_check;
alter table referrals add constraint referrals_cosign_state_check
  check (cosign_state in ('not-required','awaited','signed','declined'));

-- The two queries this adds: "my originated cases" and "what needs co-signing".
create index if not exists referrals_introducer_idx on referrals (introducer_user_id);
create index if not exists referrals_cosign_idx on referrals (cosign_state)
  where cosign_state = 'awaited';
