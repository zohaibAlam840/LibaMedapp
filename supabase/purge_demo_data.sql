-- Remove the five SEEDED SAMPLE referrals and everything hanging off them.
--
-- Why this can't be done from the app: audit_log is append-only (trigger
-- trg_audit_log_immutable blocks UPDATE and DELETE), which is the whole point
-- of the compliance spine. Clearing real audit history is therefore a
-- deliberate, privileged act — it happens here, in the SQL editor, not from a
-- script with a service key.
--
-- KEPT: corridors, hospitals, corridor_specialties, doctors, profiles/accounts.
-- Restorable by re-running supabase/seed.sql.
--
-- Paste this whole block into the Supabase SQL editor and run it once.

begin;

-- Lift immutability only for this transaction.
alter table audit_log disable trigger trg_audit_log_immutable;

with demo as (
  select id from referrals
  where ref in ('LM-2026-0142','LM-2026-0139','LM-2026-0133','LM-2026-0127','LM-2026-0118')
)
delete from audit_log where referral_id in (select id from demo);

-- patient_consent / documents / messages cascade from referrals.
delete from referrals
where ref in ('LM-2026-0142','LM-2026-0139','LM-2026-0133','LM-2026-0127','LM-2026-0118');

-- Detach any patient accounts that pointed at those referrals.
update profiles set patient_referral_id = null
where patient_referral_id is not null
  and patient_referral_id not in (select id from referrals);

alter table audit_log enable trigger trg_audit_log_immutable;

commit;

-- Verify: all three should return 0.
select
  (select count(*) from referrals
     where ref in ('LM-2026-0142','LM-2026-0139','LM-2026-0133','LM-2026-0127','LM-2026-0118')) as demo_referrals,
  (select count(*) from messages)                                                               as messages,
  (select count(*) from patient_consent)                                                        as consents;
