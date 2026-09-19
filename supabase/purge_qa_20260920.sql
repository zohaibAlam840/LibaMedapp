-- Remove the QA data created while testing the introducer → co-sign flow
-- (20 Sep 2026).
--
-- Why this cannot be done from the app, or even with the service key:
-- audit_log is append-only. trg_audit_log_immutable blocks UPDATE and DELETE
-- for everyone, and deleting a referral counts as an UPDATE on audit_log (the
-- foreign key is ON DELETE SET NULL). A case with audit entries therefore
-- cannot be deleted by the application — which is the point.
--
-- Paste this whole block into the Supabase SQL editor and run it once.
--
-- WHAT THIS REMOVES
--   LM-2026-9004  QA-COSIGN-01   co-signed, accepted, two messages
--   LM-2026-9005  QA-DECLINE-02  sent back, sitting as a draft
--   qa.ref@libamed.test and qa.intro@libamed.test (the two QA logins still
--   held by those cases; qa.admin and qa.recv are already gone)
--
-- Both cases own their whole audit chain — they were created, signed and
-- worked on entirely by QA accounts — so removing them disturbs no other
-- chain and /admin/audit will still report the log intact. Nothing belonging
-- to a real case is touched.

begin;

alter table audit_log disable trigger trg_audit_log_immutable;

delete from audit_log
where referral_id in (select id from referrals where ref in ('LM-2026-9004', 'LM-2026-9005'));

delete from messages
where referral_id in (select id from referrals where ref in ('LM-2026-9004', 'LM-2026-9005'));

delete from documents
where referral_id in (select id from referrals where ref in ('LM-2026-9004', 'LM-2026-9005'));

delete from patient_consent
where referral_id in (select id from referrals where ref in ('LM-2026-9004', 'LM-2026-9005'));

delete from referrals where ref in ('LM-2026-9004', 'LM-2026-9005');

-- Held until now by the two cases above.
delete from profiles where email like 'qa.%@libamed.test';

alter table audit_log enable trigger trg_audit_log_immutable;

commit;

-- The matching logins must go separately — Authentication → Users, or:
--   delete from auth.users where email like 'qa.%@libamed.test';

-- ── Verify ─────────────────────────────────────────────────────────────────
-- Expect 0 and 0. Then open /admin/audit and confirm it still reads
-- "Hash chain intact". If it does not, stop and tell someone.
select
  (select count(*) from referrals where ref in ('LM-2026-9004','LM-2026-9005')) as qa_cases,
  (select count(*) from profiles where email like 'qa.%@libamed.test')          as qa_profiles;
