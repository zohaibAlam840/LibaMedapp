-- Migration 005 — contact enquiries, notification preferences, editable content
--
-- Everything here backs a screen that already exists and currently does
-- nothing: the public contact form discards what people type, the notification
-- toggles forget on reload, and the Help & glossary admin lists content it
-- cannot change because the content lives in the code.
--
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT throughout).

-- ── Contact enquiries ──────────────────────────────────────────────────────
-- Stored first, emailed second, so a mail outage never loses an enquiry.
create table if not exists contact_messages (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text not null,
  organisation text,
  subject      text,
  body         text not null,
  status       text not null default 'new'
               check (status in ('new','read','answered','archived')),
  -- Set when an admin picks it up, for "who is dealing with this".
  handled_by   uuid references profiles(id),
  handled_at   timestamptz,
  note         text,
  created_at   timestamptz not null default now()
);

create index if not exists contact_messages_status_idx
  on contact_messages (status, created_at desc);

alter table contact_messages enable row level security;   -- default-deny

-- ── Notification preferences ───────────────────────────────────────────────
-- A jsonb bag rather than a column per toggle: the set of notifications will
-- change, and a missing key simply means "use the default".
alter table profiles add column if not exists notification_prefs jsonb not null default '{}'::jsonb;

-- ── Editable help content ──────────────────────────────────────────────────
-- Moves the public FAQ and glossary out of lib/marketing.ts so an admin can
-- change them without a developer. display_order is spaced by 10 so a row can
-- be moved between two others without renumbering everything.
create table if not exists faq_items (
  id            uuid primary key default gen_random_uuid(),
  category      text not null,
  question      text not null,
  answer        text not null,
  display_order integer not null default 0,
  published     boolean not null default true,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create unique index if not exists faq_items_question_key on faq_items (question);
create index if not exists faq_items_order_idx on faq_items (display_order);
alter table faq_items enable row level security;

create table if not exists glossary_terms (
  id            uuid primary key default gen_random_uuid(),
  term          text not null,
  definition    text not null,
  display_order integer not null default 0,
  published     boolean not null default true,
  updated_at    timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

create unique index if not exists glossary_terms_term_key on glossary_terms (term);
alter table glossary_terms enable row level security;

-- ── Seed from the content currently shipped in the code ────────────────────
-- ON CONFLICT DO NOTHING: re-running never overwrites an admin's later edits.
insert into faq_items (category, question, answer, display_order) values
  ('About', 'What is LibaMed?', 'A clinician-to-clinician platform for international medical referrals. A UK doctor refers a patient — with consent — to a named specialist at an accredited hospital abroad, and receives a structured summary back for continuity of care. LibaMed Ltd is registered in Cardiff, Wales.', 10),
  ('About', 'Is this a medical-tourism booking site?', 'No. There is no patient-facing booking. Patients cannot create, edit, or submit cases — every referral is created and owned by a verified clinician.', 20),
  ('Referrals', 'How long does a referral take to create?', 'Minutes. The guided intake asks one question at a time and saves as you go — most clinicians complete it between patients.', 30),
  ('Referrals', 'Who sees the referral at the receiving hospital?', 'Only the named receiving specialist you selected, and their direct clinical team. Cases never land in a shared inbox.', 40),
  ('Referrals', 'What happens after treatment?', 'The receiving specialist returns a structured clinical summary — treatment given, outcome, medications, follow-up plan — within 5 working days of completion.', 50),
  ('Referrals', 'Can my patient withdraw consent mid-referral?', 'Yes, at any time, via you as the referring clinician. All further processing stops immediately and the withdrawal is logged immutably.', 60),
  ('Data & privacy', 'Where is my patient''s data stored?', 'In the region required by the destination corridor, set automatically at intake. French cases are held on HDS-certified EEA infrastructure; every case shows its residency region.', 70),
  ('Data & privacy', 'How is the data protected?', 'AES-256 encryption at rest, TLS 1.3 in transit, role-based access on a least-privilege basis, and an immutable audit log of every view, download, and export.', 80),
  ('Data & privacy', 'Is anything stored on my phone?', 'No. The app installs to your home screen, but patient data is never cached on the device — it always loads over an encrypted connection.', 90),
  ('Data & privacy', 'Can I get a full audit trail?', 'Yes. Every consent event, document access, and status change is recorded append-only and can be exported for independent review.', 100),
  ('Hospitals', 'How are partner hospitals chosen?', 'Four-stage accreditation: international certification (JCI/ISO/national), outcome-data transparency, a UK-standard complaints process, and clinical quality audit — before any referral routes.', 110),
  ('Hospitals', 'Which specialties are covered?', 'Oncology, orthopedics, fertility, cardiology, neurosurgery, transplantation, and reconstructive surgery, with sub-specialty routing per hospital.', 120),
  ('Costs', 'What does the platform cost the patient?', 'The clinical estimate comes itemised from the hospital, with no hidden platform fees added. Cost transparency before treatment is a Pledge commitment.', 130),
  ('Costs', 'Who pays for treatment?', 'Treatment is contracted between the patient and the receiving hospital. LibaMed carries the referral, records, and communication — not the payment.', 140),
  ('Access', 'Who can register?', 'UK-registered doctors (GMC-verified at sign-up) and, at launch partners, US-licensed physicians. Receiving clinicians are onboarded through their hospitals.', 150),
  ('Access', 'Why do you verify my GMC number?', 'Every referral must be clinician-led. Verification against the public GMC register before your first case is how we keep that promise.', 160)
on conflict (question) do nothing;

insert into glossary_terms (term, definition, display_order) values
  ('Corridor', 'A configured referral route between two countries (e.g. UK → France), carrying its own data-residency, consent, and transfer rules.', 10),
  ('DICOM', 'The standard format for medical imaging (MRI, CT). LibaMed transfers DICOM securely; viewing happens in your own PACS software.', 20),
  ('DSAR', 'Data Subject Access Request — a person''s legal right to see the data held about them. LibaMed supports these within statutory deadlines.', 30),
  ('DSPT', 'The NHS Data Security and Protection Toolkit — the assurance standard engaged when NHS-sourced records are involved.', 40),
  ('GMC', 'The General Medical Council — the UK doctors'' register. Referring clinicians are verified against it before their first case.', 50),
  ('HDS', 'Hébergeur de Données de Santé — France''s mandatory certification for hosting health data. French cases live on HDS-certified EEA infrastructure.', 60),
  ('IDTA', 'The UK International Data Transfer Agreement — a lawful mechanism for sending personal data out of the UK.', 70),
  ('Itemised consent', 'Consent captured item by item — who sees the data, where it goes, for what purpose — each with the exact wording and time recorded.', 80),
  ('JCI', 'Joint Commission International — a leading global hospital accreditation. Part of our four-stage partner vetting.', 90),
  ('KVKK', 'Turkey''s data-protection law. UK → Turkey transfers use KVKK-approved contract clauses, notified to the Turkish authority within 5 business days.', 100),
  ('MDT', 'Multi-disciplinary team — the group of specialists who review complex cases together at the receiving hospital.', 110),
  ('RTT', 'Referral to Treatment — the NHS waiting-time standard (18 weeks for non-urgent care) that many patients currently wait beyond.', 120),
  ('SCC', 'Standard Contractual Clauses — pre-approved legal terms that make an international data transfer lawful.', 130),
  ('Named specialist', 'The specific doctor your referral is addressed to. Cases route to their personal queue, never a general hospital inbox.', 140)
on conflict (term) do nothing;

-- ── Verify ─────────────────────────────────────────────────────────────────
-- Expect 16 questions, 14 terms, 0 enquiries.
select
  (select count(*) from faq_items)       as faq_items,
  (select count(*) from glossary_terms)  as glossary_terms,
  (select count(*) from contact_messages) as enquiries;
