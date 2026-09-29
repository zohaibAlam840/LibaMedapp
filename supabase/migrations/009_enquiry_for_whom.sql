-- 009 · Who the enquiry is for (change scope 2026-09-29, item B1)
--
-- The enquiry form now asks "Who is this enquiry for?" before anything else,
-- because the answer changes what the consent means. Someone enquiring for
-- themselves consents on their own behalf. Someone enquiring for another adult
-- is asserting that person knows and agrees; a parent or guardian is asserting
-- something different again. All three were previously collapsed into one
-- checkbox that read as though the writer were always the patient.
--
-- This matters more than a reporting field: "Under 18" was already an offered
-- age range, so enquiries about children were always going to arrive, and the
-- consent wording did not account for whoever was actually typing.
--
-- WHY THIS IS CONSTRAINED WHEN THE OTHER DROPDOWNS ARE NOT
-- Age bands, budget bands and specialty areas are marketing categories that get
-- retuned between campaigns, so they are plain text validated in the app (see
-- 008). This is not one of those. It has exactly two answers, it is the basis on
-- which we are allowed to hold what the form collects, and a third value
-- appearing here would be a bug rather than a retune. So the database enforces
-- it.

alter table patient_interest
  add column if not exists enquiry_for text
    check (enquiry_for in ('self', 'other'));

comment on column patient_interest.enquiry_for is
  'Who the enquiry is about: self = the person writing, other = someone else '
  '(they know and agree, or the writer is their parent/legal guardian). Null '
  'for enquiries captured before 2026-09-30, when the question did not exist.';

-- Deliberately NULLABLE with no backfill. Rows captured before this question
-- existed genuinely do not carry the answer, and guessing 'self' would invent
-- a consent record that nobody gave. The admin screen shows those as "Not
-- asked", which is the truth.

-- The admin list filters by this, alongside status.
create index if not exists patient_interest_for_idx
  on patient_interest (enquiry_for, created_at desc)
  where enquiry_for is not null;

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from patient_interest)                                as enquiries,
  (select count(*) from patient_interest where enquiry_for is null)      as not_asked,
  (select count(*) from information_schema.columns
     where table_name = 'patient_interest' and column_name = 'enquiry_for') as column_added;
