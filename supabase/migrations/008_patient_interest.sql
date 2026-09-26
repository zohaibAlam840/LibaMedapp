-- 008 · Patient enquiry capture (Phase 2a)
--
-- A PatientInterest is an ENQUIRY, not a case. The brief is explicit and the
-- schema enforces it: this table has no foreign key to referrals, no status
-- that leads into the referral pipeline, and nothing that converts. A patient
-- still cannot create, edit or submit a clinical referral — that rule is
-- untouched. Turning an enquiry into a case remains a human decision made
-- elsewhere, and is out of scope for this release.
--
-- WHY THE DROPDOWN VALUES ARE PLAIN TEXT, NOT CHECK CONSTRAINTS
-- Age bands, budget bands, specialty areas and timeframes are marketing
-- categories: they will be retuned as campaigns run. A check constraint would
-- make every retune a migration, and would reject historical rows captured
-- under the old wording. The permitted values live in lib/patientInterest.ts
-- and are validated on the way in. `status` IS constrained, because those four
-- states are the workflow and changing them is a real decision.

create table if not exists patient_interest (
  id            uuid primary key default gen_random_uuid(),

  -- Who they are. Volunteered by the person themselves, not by a clinician.
  name          text not null,
  email         text not null,
  phone         text,
  age_range     text,
  postcode      text,                                  -- UK, stored uppercase

  -- What they are looking for. `description` is free text and WILL contain
  -- health information, which is why this table is in scope for the retention
  -- sweep and for DSAR alongside referrals.
  specialty_area  text,
  description     text,
  destination_preference text,                         -- none | switzerland | turkiye | other
  funding_type    text,                                -- self-pay | insurance | unknown
  budget_band     text,
  timeframe       text,

  -- Lawful basis. There is no legitimate reading of this form that does not
  -- involve contacting the person, so consent is NOT NULL and the moment it
  -- was given is recorded next to it.
  consent_to_contact boolean not null default false,
  consented_at       timestamptz,

  -- Where the enquiry came from, so spend can be attributed to a channel.
  -- Deliberately free text: campaign ids are whatever the ad platform emits.
  campaign_id   text,
  lead_source   text,

  -- Manual triage only. No automation hangs off these.
  status        text not null default 'new'
                check (status in ('new','qualified','contacted','not-suitable')),
  handled_by    uuid references profiles(id),
  handled_at    timestamptz,
  note          text,

  -- Retention. An enquiry is not a medical record and must not be kept like
  -- one: 24 months from capture, versus the corridor's 10-20 years for a case.
  retention_until date not null default ((now() + interval '24 months')::date),

  created_at    timestamptz not null default now()
);

-- The two lists the admin screen offers: by triage state, and by campaign.
create index if not exists patient_interest_status_idx
  on patient_interest (status, created_at desc);
create index if not exists patient_interest_campaign_idx
  on patient_interest (campaign_id)
  where campaign_id is not null;

-- Default-deny, like every other table holding personal data. Reads go through
-- the service client behind an admin session.
alter table patient_interest enable row level security;

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from patient_interest)                                   as enquiries,
  (select count(*) from information_schema.columns
     where table_name = 'patient_interest')                                 as columns;
