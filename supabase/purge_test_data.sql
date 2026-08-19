-- Remove the TEST data created while verifying the referral → messaging flow
-- (19 Aug 2026), and the test audit entries that go with it.
--
-- Why this cannot be done from the app, or even with the service key:
-- audit_log is append-only. The trigger trg_audit_log_immutable blocks UPDATE
-- and DELETE for everyone, and deleting a referral counts as an UPDATE on
-- audit_log (the foreign key is ON DELETE SET NULL). So a referral that has
-- audit entries can never be deleted by the application — which is the point:
-- a case cannot be made to disappear from the evidence.
--
-- Clearing it is therefore a deliberate, privileged act. Paste this whole
-- block into the Supabase SQL editor and run it once.
--
-- KEPT: your two real cases (LM-2026-0101, LM-2026-0102), all partner data,
-- and every audit entry belonging to them.

begin;

-- Lift immutability for this transaction only.
alter table audit_log disable trigger trg_audit_log_immutable;

-- 1 · The test referral and everything hanging off it.
with test_case as (
  select id from referrals where ref = 'LM-2026-9001'
)
delete from audit_log where referral_id in (select id from test_case);

delete from messages where referral_id in (select id from referrals where ref = 'LM-2026-9001');
delete from referrals where ref = 'LM-2026-9001';

-- 2 · Test entries written against the REAL case LM-2026-0101 while proving
--     the patient portal and the message thread worked. The case itself and
--     its genuine entries (referral created, consent captured, documents
--     attached) are untouched.
delete from audit_log
where actor in ('Zzz Portal Test', 'Zzz Anadolu Doctor', 'Zzz Referring', 'Zzz Receiving');

-- 3 · Admin entries for the throwaway hospitals and the test account.
delete from audit_log
where (event in ('Hospital created', 'Hospital deleted') and detail like 'zzz-%')
   or (event = 'Hospital updated' and detail like 'Zzz %')
   or (event = 'User invited' and detail like 'zzz.%');

-- 4 · The leftover test profile (its referral is gone by now, so the foreign
--     key no longer holds it).
delete from profiles where email like 'zzz.%@example.com';

alter table audit_log enable trigger trg_audit_log_immutable;

commit;

-- The matching auth users must be removed separately — Authentication → Users
-- in the Supabase dashboard, or:
--   delete from auth.users where email like 'zzz.%@example.com';

-- Verify: expect two referrals, no 'Zzz' actors, and a hash chain that still
-- verifies on the /admin/audit page.
select
  (select count(*) from referrals)                              as referrals,
  (select count(*) from audit_log where actor like 'Zzz %')     as test_audit_rows,
  (select count(*) from profiles where email like 'zzz.%')      as test_profiles;
