-- ============================================================================
-- LibaMed C2C — seed data (sample, NOT real patients).
-- Run AFTER schema.sql, in: Supabase dashboard → SQL Editor → New query → Run.
-- Re-runnable: it truncates the tables first (safe for demo/pilot data only).
-- ============================================================================

truncate table audit_log, messages, documents, patient_consent, referrals,
               corridor_specialties, hospitals, corridors, profiles
        restart identity cascade;

-- ── Corridors ──────────────────────────────────────────────────────────────
insert into corridors (id, label, country, residency, transfer_basis, safeguard, notification, primary_hospital_id) values
  ('israel','UK → Israel','Israel','UK (London)','adequacy',
   'Israel is covered by UK adequacy regulations — patient data may be shared with the treating clinicians without an additional transfer contract.', null,'sheba'),
  ('france','UK → France','France','EEA — HDS (Paris)','adequacy',
   'France is in the EEA and covered by UK adequacy; patient data is hosted on HDS-certified health infrastructure. No additional transfer contract is required.', null,'foch'),
  ('turkey','UK → Turkey','Turkey','UK (London)','scc',
   'Turkey is not covered by UK adequacy — the transfer relies on Standard Contractual Clauses (IDTA). A KVKK notification is due within 5 business days of the first data transfer.',
   '{"authority":"KVKK (Turkey)","within_business_days":5}','anadolu'),
  ('switzerland','UK → Switzerland','Switzerland','UK (London)','adequacy',
   'Switzerland is covered by UK adequacy regulations — patient data may be shared with the treating clinicians without an additional transfer contract.', null,'hirslanden');

-- ── Hospitals (only Sheba is published) ────────────────────────────────────
insert into hospitals (id, name, city, country, corridor_id, published, intro, accreditation, specialties, languages, clinicians) values
  ('sheba','Sheba Medical Center','Ramat Gan','Israel','israel', true,
   'The largest medical centre in the Middle East, with internationally recognised programmes in oncology, orthopedics, and fertility.',
   '[{"name":"JCI","expires":"Mar 2027"},{"name":"ISO 9001","expires":"Nov 2026"}]',
   '{Oncology,CAR-T,Orthopedics,Fertility,Cardiology,Transplantation}',
   '{English,Hebrew,Russian,Arabic}',
   '[{"name":"Dr. Noa Peretz","role":"Consultant oncologist"},{"name":"Dr. Avi Shalev","role":"Orthopedic surgeon — spine"}]'),
  ('foch','Hôpital Foch','Suresnes (Paris)','France','france', false,
   'Leading French centre for thoracic surgery and lung transplantation, with major oncology, urology, and fertility programmes.',
   '[{"name":"HAS certification","expires":"Jun 2028"},{"name":"ISO 9001","expires":"Jan 2027"}]',
   '{"Thoracic surgery","Lung transplant",Oncology,Urology,Fertility,Neurosurgery}',
   '{French,English}',
   '[{"name":"Dr. Claire Moreau","role":"Thoracic surgeon"},{"name":"Dr. Julien Caron","role":"Consultant urologist"}]'),
  ('anadolu','Anadolu Medical Center','Gebze (Istanbul)','Turkey','turkey', false,
   'OECI-accredited comprehensive cancer centre affiliated with Johns Hopkins Medicine; strong orthopedics and reconstructive programmes.',
   '[{"name":"JCI","expires":"Sep 2026"},{"name":"OECI","expires":"May 2027"}]',
   '{Oncology,CyberKnife,BMT,Orthopedics,"Reconstructive surgery",Neurosurgery}',
   '{Turkish,English,Arabic}',
   '[{"name":"Dr. Emre Kaya","role":"Orthopedic surgeon"},{"name":"Dr. Selin Aydın","role":"Radiation oncologist"}]'),
  ('hirslanden','Hirslanden Zürich','Zürich','Switzerland','switzerland', false,
   'Switzerland''s largest private hospital group; flagship orthopedics and trauma, with advanced oncology and cardiac surgery.',
   '[{"name":"ISO 9001","expires":"Feb 2027"},{"name":"Swiss Leading Hospitals","expires":"Dec 2026"}]',
   '{Orthopedics,Trauma,Oncology,Cardiology,Fertility,Neurosurgery}',
   '{German,English,French,Italian}',
   '[{"name":"Dr. Lukas Baumann","role":"Consultant cardiologist"},{"name":"Dr. Anna Keller","role":"Orthopedic surgeon — knee"}]');

-- ── Corridor specialties (NHS-availability gating) ─────────────────────────
insert into corridor_specialties (corridor_id, name, nhs) values
  ('israel','Oncology','nhs-delayed'),('israel','CAR-T','nhs-unavailable'),('israel','Orthopedics','nhs-delayed'),
  ('israel','Fertility','nhs-unavailable'),('israel','Cardiology','nhs-routine'),('israel','Transplantation','nhs-unavailable'),
  ('france','Thoracic surgery','nhs-delayed'),('france','Lung transplant','nhs-unavailable'),('france','Oncology','nhs-delayed'),
  ('france','Urology','nhs-routine'),('france','Fertility','nhs-unavailable'),('france','Neurosurgery','nhs-delayed'),
  ('turkey','Oncology','nhs-delayed'),('turkey','CyberKnife','nhs-unavailable'),('turkey','Orthopedics','nhs-delayed'),
  ('turkey','Reconstructive surgery','nhs-unavailable'),('turkey','Neurosurgery','nhs-delayed'),
  ('switzerland','Orthopedics','nhs-delayed'),('switzerland','Trauma','nhs-routine'),('switzerland','Oncology','nhs-delayed'),
  ('switzerland','Cardiology','nhs-routine'),('switzerland','Fertility','nhs-unavailable'),('switzerland','Neurosurgery','nhs-delayed');

-- ── Profiles (sample; demo role-switcher still drives access for now) ───────
insert into profiles (account_type, clinician_role, name, email, account_status, gmc_number) values
  ('clinician','referring','Dr. Amara Chen','a.chen@nhs.net','verified','7654321'),
  ('clinician','receiving','Dr. Noa Peretz','n.peretz@sheba.health.il','verified',null);
insert into profiles (account_type, name, email, account_status) values
  ('patient','Demo patient','patient@example.com','verified');

-- ── Referrals (mirrors DEMO_CASES; compliance for 0142/0133/0118) ──────────
insert into referrals
  (ref, patient_ref, corridor_id, hospital_id, specialist, specialty, status, referring_user_id,
   treatment_scope, ns_reason, ns_justification, ns_declared_by, ns_declared_at,
   handback_state, handback_due_by, handback_received_at, unread, updated_at)
values
  ('LM-2026-0142','P-4821','israel','sheba','Dr. Noa Peretz','Oncology','under-review',
   (select id from profiles where email='a.chen@nhs.net'),
   'Oncology assessment + CAR-T eligibility review','nhs-wait-exceeds-threshold',
   'Tertiary CAR-T assessment; local NHS pathway wait (14 weeks) exceeds the clinical threshold for this patient.',
   'Dr. Amara Chen (GMC 7654321)', timestamptz '2026-07-12 09:04+00',
   'awaited', date '2026-07-31', null, 2, now() - interval '2 hours'),

  ('LM-2026-0139','P-4796','france','foch','Dr. Claire Moreau','Thoracic surgery','plan-received',
   (select id from profiles where email='a.chen@nhs.net'),
   null,null,null,null,null,'not-due',null,null,0, now() - interval '1 day'),

  ('LM-2026-0133','P-4753','turkey','anadolu','Dr. Emre Kaya','Orthopedics','confirmed',
   (select id from profiles where email='a.chen@nhs.net'),
   'Orthopedic reconstruction — surgical plan + costs','not-nhs-commissioned',
   'Requested reconstructive technique is not NHS-commissioned for this indication.',
   'Dr. Amara Chen (GMC 7654321)', timestamptz '2026-07-05 11:20+00',
   'overdue', date '2026-07-18', null, 0, now() - interval '2 days'),

  ('LM-2026-0127','P-4702','switzerland','hirslanden','Dr. Lukas Baumann','Cardiology','complete',
   (select id from profiles where email='a.chen@nhs.net'),
   null,null,null,null,null,'not-due',null,null,0, now() - interval '5 days'),

  ('LM-2026-0118','P-4655','israel','sheba','Dr. Noa Peretz','Fertility','summary-returned',
   (select id from profiles where email='a.chen@nhs.net'),
   'Fertility preservation — full cycle','not-nhs-commissioned',
   'Fertility preservation regimen not NHS-commissioned for this indication.',
   'Dr. Amara Chen (GMC 7654321)', timestamptz '2026-06-20 10:00+00',
   'received', date '2026-07-10', date '2026-07-08', 0, now() - interval '7 days');

-- Patient sees exactly one referral (LM-2026-0142)
update profiles
  set patient_referral_id = (select id from referrals where ref='LM-2026-0142')
  where account_type='patient';

-- ── Patient consent ────────────────────────────────────────────────────────
insert into patient_consent (referral_id, version, country, safeguard, items, captured_at) values
  ((select id from referrals where ref='LM-2026-0142'),'2026-07','Israel',
   (select safeguard from corridors where id='israel'),
   '[{"id":"leaves-uk","label":"Records shared with clinicians in Israel.","agreed":true},{"id":"safeguard","label":"Understands the transfer safeguard.","agreed":true},{"id":"purpose","label":"Consents to use for treatment planning.","agreed":true},{"id":"withdraw","label":"Understands the right to withdraw.","agreed":true}]',
   timestamptz '2026-07-12 09:22+00'),
  ((select id from referrals where ref='LM-2026-0133'),'2026-07','Turkey',
   (select safeguard from corridors where id='turkey'),
   '[{"id":"leaves-uk","label":"Records shared with clinicians in Turkey.","agreed":true},{"id":"safeguard","label":"Understands SCC/IDTA transfer safeguard.","agreed":true},{"id":"purpose","label":"Consents to use for treatment planning.","agreed":true},{"id":"withdraw","label":"Understands the right to withdraw.","agreed":true}]',
   timestamptz '2026-07-05 11:38+00'),
  ((select id from referrals where ref='LM-2026-0118'),'2026-07','Israel',
   (select safeguard from corridors where id='israel'),
   '[{"id":"leaves-uk","label":"Records shared with clinicians in Israel.","agreed":true},{"id":"safeguard","label":"Understands the transfer safeguard.","agreed":true},{"id":"purpose","label":"Consents to use for treatment planning.","agreed":true},{"id":"withdraw","label":"Understands the right to withdraw.","agreed":true}]',
   timestamptz '2026-06-20 10:15+00');

-- ── Documents (attached to LM-2026-0142) ───────────────────────────────────
insert into documents (referral_id, name, type, size, uploaded_at) values
  ((select id from referrals where ref='LM-2026-0142'),'Referral letter.pdf','Referral letter','240 KB', timestamptz '2026-07-12 00:00+00'),
  ((select id from referrals where ref='LM-2026-0142'),'Blood panel — June.pdf','Lab results','1.1 MB', timestamptz '2026-07-12 00:00+00'),
  ((select id from referrals where ref='LM-2026-0142'),'MRI thorax (DICOM)','Imaging — DICOM','312 MB', timestamptz '2026-07-13 00:00+00');

-- ── Messages (LM-2026-0142; one clinician-only note) ───────────────────────
insert into messages (referral_id, direction, body, attachment, patient_visible, read, created_at) values
  ((select id from referrals where ref='LM-2026-0142'),'outgoing','Thank you for accepting the referral. The MRI series and June bloods are attached to the case.', null, true, true, timestamptz '2026-07-13 09:12+00'),
  ((select id from referrals where ref='LM-2026-0142'),'incoming','Received, thank you. The imaging is clear. Could you also share the histopathology report from the March biopsy?', null, true, false, timestamptz '2026-07-13 11:47+00'),
  ((select id from referrals where ref='LM-2026-0142'),'outgoing', null, '{"name":"Histopathology — March.pdf","size":"420 KB"}', false, true, timestamptz '2026-07-13 14:03+00'),
  ((select id from referrals where ref='LM-2026-0142'),'incoming','We will review at our MDT on Thursday and return a treatment plan with costs by Friday.', null, true, false, timestamptz '2026-07-14 08:30+00');

-- ── Audit log (append-only; trigger fills seq + hash). Insert in time order. ─
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0142'), timestamptz '2026-07-12 09:02+00','Dr. Amara Chen','referral.created','Referral LM-2026-0142 created');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0142'), timestamptz '2026-07-12 09:04+00','Dr. Amara Chen','nonsubstitution.declared','NHS wait exceeds clinical threshold');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0142'), timestamptz '2026-07-12 09:22+00','Dr. Amara Chen','consent.captured','Patient consent v2026-07 captured');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0142'), timestamptz '2026-07-13 14:10+00','Dr. Noa Peretz','specialist.accepted','Accepted at Sheba Medical Center');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0142'), timestamptz '2026-07-13 14:12+00','Dr. Noa Peretz','scope.set','Scope: CAR-T eligibility review');

insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0133'), timestamptz '2026-07-05 11:18+00','Dr. Amara Chen','referral.created','Referral LM-2026-0133 created');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0133'), timestamptz '2026-07-05 11:20+00','Dr. Amara Chen','nonsubstitution.declared','Not NHS-commissioned');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0133'), timestamptz '2026-07-05 11:38+00','Dr. Amara Chen','consent.captured','Patient consent v2026-07 captured');
insert into audit_log (referral_id, at, actor, event, detail) values
  ((select id from referrals where ref='LM-2026-0133'), timestamptz '2026-07-06 08:45+00','Dr. Emre Kaya','specialist.accepted','Accepted at Anadolu Medical Center');
