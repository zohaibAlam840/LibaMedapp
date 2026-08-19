-- Remove the TEST data created while verifying the referral → messaging flow
-- (19 Aug 2026).
--
-- Why this cannot be done from the app, or even with the service key:
-- audit_log is append-only. The trigger trg_audit_log_immutable blocks UPDATE
-- and DELETE for everyone, and deleting a referral counts as an UPDATE on
-- audit_log (the foreign key is ON DELETE SET NULL). So a referral that has
-- audit entries can never be deleted by the application — which is the point:
-- a case cannot be made to disappear from the evidence.
--
-- Paste this whole block into the Supabase SQL editor and run it once.
--
--
-- ⚠ WHAT THIS DELIBERATELY DOES **NOT** TOUCH
--
-- The audit log is hash-chained: each entry stores the hash of the one before
-- it, per case. Entries with no case (admin/configuration actions) form one
-- chain of their own. Deleting an entry from the MIDDLE of a chain breaks the
-- link for every entry after it, and /admin/audit will then report
--
--     "Hash chain broken — an entry has been altered or removed"
--
-- in red. That warning is the log doing its job, and it would be pointing at
-- us. So the admin entries from testing (the throwaway hospitals, the invited
-- test account, the logged data request) sit mid-chain and are LEFT IN PLACE.
-- They are noise, but they are true: those actions really happened.
--
-- Only self-contained chains are removed here.

begin;

-- Lift immutability for this transaction only.
alter table audit_log disable trigger trg_audit_log_immutable;

-- ── The test referral LM-2026-9001 ─────────────────────────────────────────
-- Safe to remove whole: the case is entirely synthetic and owns its own audit
-- chain, so nothing else links to it and no other chain is disturbed.
delete from audit_log
where referral_id in (select id from referrals where ref = 'LM-2026-9001');

delete from messages
where referral_id in (select id from referrals where ref = 'LM-2026-9001');

delete from referrals where ref = 'LM-2026-9001';

-- ── The test profile ───────────────────────────────────────────────────────
-- Held until now by the referral above.
delete from profiles where email like 'zzz.%@example.com';

alter table audit_log enable trigger trg_audit_log_immutable;

commit;

-- The matching auth user must be removed separately — Authentication → Users
-- in the Supabase dashboard, or:
--   delete from auth.users where email like 'zzz.%@example.com';


-- ═══════════════════════════════════════════════════════════════════════════
-- OPTIONAL — the two test entries on the REAL case LM-2026-0101
--
-- While proving the patient portal and the message thread worked, two entries
-- were written against your live Turkey case:
--
--     seq 5   Zzz Portal Test      Patient portal activated
--     seq 6   Zzz Anadolu Doctor   Message sent
--
-- They are the LAST two entries in that case's chain, so removing them leaves
-- seq 1–4 (referral created, NHS declaration, consent captured, documents
-- attached) verifying correctly.
--
-- Your call, and it is a genuine trade-off:
--   · leave them  → the log stays strictly append-only, but the case shows a
--                   patient activation and a message that no longer exist
--   · remove them → the case reads cleanly, but you have edited an audit log,
--                   which is the thing it exists to make impossible
--
-- If you want them gone, run this block too.
-- ═══════════════════════════════════════════════════════════════════════════

-- begin;
-- alter table audit_log disable trigger trg_audit_log_immutable;
--
-- delete from audit_log
-- where actor in ('Zzz Portal Test', 'Zzz Anadolu Doctor')
--   and referral_id in (select id from referrals where ref = 'LM-2026-0101');
--
-- alter table audit_log enable trigger trg_audit_log_immutable;
-- commit;


-- ── Verify ─────────────────────────────────────────────────────────────────
-- Expect: 2 referrals (your real ones), 0 test profiles.
-- Then open /admin/audit and confirm the banner still reads "Hash chain
-- intact". If it does not, stop and tell someone.
select
  (select count(*) from referrals)                          as referrals,
  (select count(*) from profiles where email like 'zzz.%')  as test_profiles,
  (select count(*) from messages)                           as messages;
