-- Migration 010 — partner profile content (brochure-derived)
--
-- Partners send marketing material (brochures, one-pagers, decks) and the
-- platform had nowhere to put any of it. A hospital row carried one `intro`
-- paragraph, a specialty list and a few names; everything a partner actually
-- says about itself — its centres of excellence, its research programmes, the
-- numbers it leads with, who an international referrer should contact — had to
-- be discarded or crammed into `intro`.
--
-- Two tables plus a few columns, shaped so the NEXT brochure is rows, not a
-- migration:
--   · hospital_stats     → the "by the numbers" grid.
--   · hospital_sections  → narrative blocks (centre / programme / service /
--                          support), each with an optional bullet list.
--   · hospitals.*        → affiliation, locations, long-form about,
--                          international office, source brochures.
--
-- Every content row carries `source` (which brochure the claim came from) and
-- `published` (an admin can hide a claim without deleting it). That matters
-- here: this is partner-supplied marketing, not LibaMed's own verified copy,
-- and a clinician choosing where to send a patient should be able to see which
-- is which — the public page labels these sections as partner-supplied.
--
-- Deliberately NOT included: unverifiable superlatives ("Top 10 hospital in the
-- world", "7th most-published institution"). They appear in the brochures but
-- LibaMed cannot stand behind a ranking it has not sourced, so the ranking
-- claims stay out and the countable facts go in.
--
-- Paste this whole file into the Supabase SQL editor and run it once.
-- Safe to re-run (IF NOT EXISTS / ON CONFLICT throughout).

-- ── Hospital columns ───────────────────────────────────────────────────────
alter table hospitals add column if not exists affiliation  text;
alter table hospitals add column if not exists locations    text[] not null default '{}';
alter table hospitals add column if not exists about_long   text;
alter table hospitals add column if not exists intl_office  jsonb;
alter table hospitals add column if not exists brochures    jsonb not null default '[]';

comment on column hospitals.affiliation is
  'Parent group or hospital this centre operates under, when it is not itself '
  'the hospital — e.g. a fertility centre affiliated with a private clinic. '
  'Shown under the name on the public profile.';
comment on column hospitals.locations is
  'Treating sites, when a partner operates from more than one address.';
comment on column hospitals.about_long is
  'Long-form About, from the partner''s own material. `intro` stays the one-line '
  'summary used in listings and cards.';
comment on column hospitals.intl_office is
  '{ name, title, phone, email, website } — the partner''s international / '
  'global-services contact. `phone` is held for LibaMed staff use and is NOT '
  'rendered on the public profile; email and website are.';
comment on column hospitals.brochures is
  '[{ title, url, source }] — partner material published for download on the '
  'profile. Remove an entry to unpublish the file.';

-- ── By-the-numbers ─────────────────────────────────────────────────────────
create table if not exists hospital_stats (
  id            uuid primary key default gen_random_uuid(),
  hospital_id   text not null references hospitals(id) on delete cascade,
  -- Text, not a number: partners quote "Nearly 11,000", "More than 1,700",
  -- "$1B". Rounding those into integers would misstate what they said.
  value         text not null,
  label         text not null,
  display_order integer not null default 0,
  source        text,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

create unique index if not exists hospital_stats_key
  on hospital_stats (hospital_id, label);
create index if not exists hospital_stats_order_idx
  on hospital_stats (hospital_id, display_order);

alter table hospital_stats enable row level security;  -- default-deny; service_role bypasses

-- ── Narrative sections ─────────────────────────────────────────────────────
create table if not exists hospital_sections (
  id            uuid primary key default gen_random_uuid(),
  hospital_id   text not null references hospitals(id) on delete cascade,
  kind          text not null
                check (kind in ('centre','programme','service','support')),
  title         text not null,
  body          text,
  -- Bullets: named sites, conditions treated, what a service includes.
  items         text[] not null default '{}',
  display_order integer not null default 0,
  source        text,
  published     boolean not null default true,
  created_at    timestamptz not null default now()
);

create unique index if not exists hospital_sections_key
  on hospital_sections (hospital_id, title);
create index if not exists hospital_sections_order_idx
  on hospital_sections (hospital_id, kind, display_order);

alter table hospital_sections enable row level security;

comment on table hospital_sections is
  'Partner-supplied profile content. kind: centre = a hospital/centre within '
  'the group, programme = a clinical or research programme, service = what the '
  'partner offers an international referrer, support = what a referred patient '
  'gets. Sections are shown grouped by kind, ordered by display_order.';

-- ═══════════════════════════════════════════════════════════════════════════
-- SHEBA MEDICAL CENTER — from the Global Medical Initiatives material
-- (GMI one-pager + GMI division deck, received 2026-11-16).
--
-- The client asked us to take repeated material from the one-pager; the deck
-- contributes only what the one-pager does not carry (the seven named
-- hospitals, the research figures, the CAR-T autoimmune programme, the
-- rehabilitation detail and the patient-support list).
-- ═══════════════════════════════════════════════════════════════════════════

update hospitals set
  about_long = 'As the largest and most comprehensive medical centre in the Middle East, Sheba Medical Center combines medical excellence, innovation and research across seven hospitals and specialist centres. Sheba treats around 25,000 cancer patients a year, performs some 50,000 surgeries and delivers about 11,000 babies, and runs a quarter of all clinical research conducted in Israel in-house. Beyond its own campus, Sheba shares clinical expertise through partnerships with medical institutions, governments and organisations worldwide — the work of its Global Medical Initiatives division, which is LibaMed''s route into the hospital.',
  intl_office = jsonb_build_object(
    'name',    'Paz Gantovski',
    'title',   'Director of Global Medical Initiatives',
    'phone',   '+972-54-2265004',
    'email',   'gmi@sheba.health.gov.il',
    'website', 'https://sheba-global.com'
  ),
  brochures = jsonb_build_array(
    jsonb_build_object(
      'title',  'The Global Medical Initiatives Division — one-pager',
      'url',    '/partners/sheba/sheba-gmi-one-pager.pdf',
      'source', 'Sheba Medical Center, November 2026'
    ),
    jsonb_build_object(
      'title',  'Global Healthcare Services — full presentation',
      'url',    '/partners/sheba/sheba-gmi-division.pdf',
      'source', 'Sheba Medical Center, November 2026'
    )
  )
where id = 'sheba';

-- Display specialties. hospitals.specialties is profile copy only — referral
-- eligibility is gated by corridor_specialties, which this does not touch.
update hospitals set specialties = array[
  'Oncology','CAR-T','Orthopedics','Fertility','Cardiology','Transplantation',
  'Cardiovascular surgery','Paediatrics','Gynaecology & maternity','Rehabilitation'
] where id = 'sheba';

insert into hospital_stats (hospital_id, value, label, display_order, source) values
  ('sheba','7',         'Hospitals & centres',            10, 'GMI one-pager 2026'),
  ('sheba','1,900,000', 'Clinical visits annually',       20, 'GMI one-pager 2026'),
  ('sheba','200,000+',  'Emergency room visits annually', 30, 'GMI one-pager 2026'),
  ('sheba','50,000',    'Surgeries annually',             40, 'GMI one-pager 2026'),
  ('sheba','25,000',    'Cancer patients a year',         50, 'GMI one-pager 2026'),
  ('sheba','11,000',    'Babies delivered annually',      60, 'GMI one-pager 2026'),
  ('sheba','2,000',     'Beds',                           70, 'GMI one-pager 2026'),
  ('sheba','1,700+',    'Doctors',                        80, 'GMI one-pager 2026'),
  ('sheba','11,000',    'Healthcare professionals',       90, 'GMI one-pager 2026'),
  ('sheba','3,300',     'Clinical trials',               100, 'GMI one-pager 2026'),
  ('sheba','200',       'Ph.D. research professionals',  110, 'GMI one-pager 2026')
on conflict (hospital_id, label) do nothing;

insert into hospital_sections (hospital_id, kind, title, body, items, display_order, source) values
  ('sheba','centre','Seven hospitals and centres',
   'Sheba is organised as a campus of specialist hospitals and centres, each with its own clinical leadership, on a single 200-acre site.',
   array[
     'The Acute Care Hospital',
     'The Jusidman Oncology Hospital',
     'The Rehabilitation Hospital',
     'The Josef Buchmann Gynecology and Maternity Center',
     'The Cardiovascular Center',
     'The Edmond and Lily Safra Children''s Hospital',
     'Sheba Beyond Virtual Hospital'
   ], 10, 'GMI division deck 2026'),

  ('sheba','centre','ARC Innovation Center',
   'ARC (Accelerate, Redesign, Collaborate) is Sheba''s innovation centre, working in digital health, AI, telemedicine and precision medicine. It brings clinicians, researchers and technology partners together to take new approaches from concept to clinical implementation.',
   '{}', 20, 'GMI one-pager 2026'),

  ('sheba','centre','MSR-Azrieli Medical Simulation Center',
   'MSR is Sheba''s simulation-based medical education centre, using virtual reality, AI-driven simulators and professional actors to build clinical scenarios for training and patient-safety work. International medical teams train here through GMI.',
   '{}', 30, 'GMI one-pager 2026'),

  ('sheba','centre','Integrated Rehabilitation Hospital',
   'Sheba''s rehabilitation hospital treats inpatients and outpatients across neurological, orthopaedic and post-trauma recovery, with facilities built around graded return of function.',
   array[
     'Virtual reality rehabilitation',
     'Therapeutic pool and hydrotherapy',
     'Immersive room',
     'Rehabilitative activity programme',
     'The Steps Institute',
     'Rehub'
   ], 40, 'GMI division deck 2026'),

  ('sheba','programme','CAR T-cell therapy for autoimmune disease',
   'A research programme translating CAR-T from oncology into severe, treatment-refractory autoimmune disease. Referrals into this programme are research-protocol dependent — eligibility is confirmed case by case by the Sheba team, not by the referral itself.',
   array[
     'Systemic lupus erythematosus',
     'Rheumatoid arthritis',
     'Sjögren''s syndrome',
     'Scleroderma',
     'Dermatomyositis',
     'Vasculitis'
   ], 50, 'GMI division deck 2026'),

  ('sheba','programme','Clinical research',
   'Sheba conducts about a quarter of all clinical research carried out in Israel in-house, which is how early-phase options reach referred patients.',
   array[
     '2,652 clinical studies',
     '4,000 active research projects',
     '1,000 active scientists',
     '200 Ph.D. researchers',
     '67 global research collaborations'
   ], 60, 'GMI division deck 2026'),

  ('sheba','service','Medical education, training & simulation',
   'Access for international medical professionals to Sheba''s specialised training programmes, workshops and research collaborations.',
   '{}', 70, 'GMI one-pager 2026'),

  ('sheba','service','Comprehensive healthcare solutions (360° approach)',
   'Customised healthcare models developed with a partner to meet regional need while holding to Sheba''s standards of care.',
   '{}', 80, 'GMI one-pager 2026'),

  ('sheba','service','International partnerships',
   'Strategic collaborations with hospitals, healthcare organisations and other stakeholders worldwide.',
   '{}', 90, 'GMI one-pager 2026'),

  ('sheba','service','Healthcare services commercialisation',
   'Sheba''s clinical expertise delivered at distance through telemedicine, specialised treatment pathways and consulting.',
   '{}', 100, 'GMI one-pager 2026'),

  ('sheba','support','What a referred patient receives',
   null,
   array[
     'A multilingual, culturally sensitive team',
     'Personalised coordination and continuous support',
     'Comprehensive medical care alongside logistical services',
     'Access to world-leading experts and innovative treatments'
   ], 110, 'GMI division deck 2026')
on conflict (hospital_id, title) do nothing;

-- ═══════════════════════════════════════════════════════════════════════════
-- 360° KINDERWUNSCH ZENTRUM ZÜRICH — reproductive medicine & IVF
-- (clinician list and service description received from the centre 2026-11-16)
--
-- Its own partner record rather than rows under 'hirslanden': the existing
-- Hirslanden Zürich record is the private hospital (orthopaedics, trauma,
-- cardiac), and these six clinicians practise at a reproductive-medicine
-- centre affiliated with Klinik Hirslanden on separate Zürich sites. Merging
-- them would have put a fertility team on an orthopaedic hospital's profile
-- and made the affiliation look like employment.
--
-- Staged UNPUBLISHED. The centre's accreditation, working languages and
-- per-clinician subspecialties have been requested but not yet received, and a
-- published partner profile with an empty accreditation panel is a worse
-- statement on this platform than one not yet listed. Publish from
-- Admin → Partner hospitals once that detail arrives.
-- ═══════════════════════════════════════════════════════════════════════════

insert into hospitals (
  id, name, city, country, corridor_id, published, affiliation, locations,
  intro, about_long, accreditation, specialties, languages, clinicians
) values (
  'kinderwunsch-360',
  '360° Kinderwunsch Zentrum Zürich',
  'Zürich',
  'Switzerland',
  'switzerland',
  false,
  'Affiliated with Klinik Hirslanden',
  array['Zürich (Utoquai)','Zollikon'],
  'Reproductive medicine and IVF centre affiliated with Klinik Hirslanden, treating from two sites in Zürich and Zollikon.',
  'Clinical expertise, personal care. The team takes the time to listen, understand a patient''s needs, and guide them through every stage of their fertility journey. The centre offers personalised consultations, comprehensive fertility assessments, and treatment including hormone therapy, IUI, IVF and ICSI. Additional services include egg freezing, preimplantation genetic testing (PGT-A), and personalised IVF success estimates using the Univfy Report. Psychological support and complementary care, including Traditional Chinese Medicine (TCM), are available throughout treatment.',
  '[]',
  array[
    'Reproductive medicine','IVF','ICSI','IUI','Hormone therapy',
    'Egg freezing','Preimplantation genetic testing (PGT-A)'
  ],
  '{}',
  '[]'
) on conflict (id) do nothing;

insert into hospital_sections (hospital_id, kind, title, body, items, display_order, source) values
  ('kinderwunsch-360','service','Fertility assessment and treatment',
   'Personalised consultations and comprehensive fertility assessment, followed by treatment chosen with the couple.',
   array['Hormone therapy','Intrauterine insemination (IUI)','In vitro fertilisation (IVF)','Intracytoplasmic sperm injection (ICSI)'],
   10, 'Centre correspondence, 16 Nov 2026'),

  ('kinderwunsch-360','service','Additional services',
   null,
   array['Egg freezing','Preimplantation genetic testing (PGT-A)','Personalised IVF success estimates (Univfy Report)'],
   20, 'Centre correspondence, 16 Nov 2026'),

  ('kinderwunsch-360','support','Support alongside treatment',
   'Care for wellbeing is offered throughout the fertility journey, not only at the clinical appointments.',
   array['Psychological support','Complementary care, including Traditional Chinese Medicine (TCM)'],
   30, 'Centre correspondence, 16 Nov 2026')
on conflict (hospital_id, title) do nothing;

-- The six named clinicians. Approved (the centre supplied them directly) but
-- reachable only once the hospital is published.
--
-- `role` carries the centre's discipline, which is what the centre gave us.
-- Per-clinician subspecialty has been requested; it is not invented here.
--
-- Re-run safety comes from the NOT EXISTS below rather than a unique index:
-- `doctors` has no (hospital_id, name) constraint, and adding one here would
-- abort the whole paste on any pre-existing duplicate in the live directory.
insert into doctors (hospital_id, name, role, status, display_order)
select v.hospital_id, v.name, v.role, v.status, v.display_order
from (values
  ('kinderwunsch-360','Dr. med. Florian Götze',          'Reproductive medicine & IVF', 'approved', 10),
  ('kinderwunsch-360','Dr. med. Anjara Jung',            'Reproductive medicine & IVF', 'approved', 20),
  ('kinderwunsch-360','Dr. med. Eva Müller-Stucki',      'Reproductive medicine & IVF', 'approved', 30),
  ('kinderwunsch-360','Dr. med. Adriana Peric',          'Reproductive medicine & IVF', 'approved', 40),
  ('kinderwunsch-360','PD Dr. med. Maike Sachs',         'Reproductive medicine & IVF', 'approved', 50),
  ('kinderwunsch-360','Prof. Dr. med. Bruno Imthurn',    'Reproductive medicine & IVF', 'approved', 60)
) as v(hospital_id, name, role, status, display_order)
where not exists (
  select 1 from doctors d
  where d.hospital_id = v.hospital_id and d.name = v.name
);

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from hospital_stats    where hospital_id = 'sheba')            as sheba_stats,
  (select count(*) from hospital_sections where hospital_id = 'sheba')            as sheba_sections,
  (select jsonb_array_length(brochures) from hospitals where id = 'sheba')        as sheba_brochures,
  (select about_long is not null from hospitals where id = 'sheba')               as sheba_about_long,
  (select count(*) from hospitals where id = 'kinderwunsch-360')                  as centre_row,
  (select count(*) from hospital_sections where hospital_id = 'kinderwunsch-360') as centre_sections,
  (select count(*) from doctors where hospital_id = 'kinderwunsch-360')           as centre_doctors;
