# LibaMed — Clinician-to-Clinician (C2C) Platform

**Project context & V1 build specification**
Prepared for a coding agent (Claude Code). Read this in full before writing any code.
Source of truth: *LibaMed C2C Developer Requirements Specification — V2* (July 2026), Candacé Manske, LibaMed Ltd (Company No. 17272473, Cardiff, Wales, UK).

> **Confidential.** Named development-partner use only. This file is a working reference, not legal advice. Every jurisdiction-specific rule below must be confirmed with local counsel before live patient data is processed.

---

## 0. Read this first — the one-paragraph mental model

LibaMed is a **clinician-gated international medical referral platform**. It is **not** a consumer medical-tourism marketplace and there is **no patient-facing booking flow**. A UK-registered (or, in a minority of cases, US-licensed) doctor refers a patient — with the patient's explicit consent — to a *named specialist* at an accredited hospital abroad. The platform's entire job is to make one loop happen securely, compliantly, and without email:

> **A UK clinician creates a referral, attaches documents, has it reviewed by a named receiving specialist abroad, exchanges secure messages, and receives a structured clinical summary back — with consent, audit logging, and role-based access enforced throughout.**

Everything beyond that loop is deferred. The technology is the easy half; the **compliance spine** (data residency, immutable audit, immutable consent, RBAC, encryption, verified identity) is the actual product.

---

## 1. The referral pathway (the core loop)

1. A UK/US referring clinician identifies a patient and, **with consent**, creates a case.
2. The clinician uploads relevant records through a guided intake wizard.
3. LibaMed routes the record set — under the correct corridor's data-protection rules — to a **named receiving specialist**, never a general inbox.
4. The receiving clinician reviews the case and returns a treatment plan, cost estimate, and availability.
5. On completion, a **structured clinical summary** is returned to the UK referring clinician for continuity of care (within 5 working days — a Pledge commitment).

**Product principle:** every screen is designed on the assumption its user is a doctor or hospital coordinator working *between patients* — not a habitual software user. Onboarding-friction tolerance is close to zero.

---

## 2. Tech stack & delivery model (this build)

- **Framework:** Next.js (App Router). One codebase serving all portals + public site.
- **Delivery target:** a **web app that looks and behaves like a native app on mobile** — i.e. a responsive, mobile-first **PWA** (installable, home-screen icon, app-shell, app-like navigation such as a bottom tab bar on mobile). Fully responsive across phone / tablet / desktop (all three are mandated test targets).
- **Auth agent context:** the developer is building with Claude Code inside Antigravity.

### 2.1 CRITICAL architectural constraint — data residency vs. hosting
This is the single most important non-obvious rule and it shapes every hosting decision:

- **France data MUST sit on HDS-certified EEA infrastructure** — explicitly *not* generic UK or US cloud infrastructure. (HDS = *Hébergeur de Données de Santé*; V2.0 standard, EEA-only physical hosting, fully effective 2026, with further data-sovereignty obligations from September 2026.)
- The default Next.js path (deploy to **Vercel**) is US-based and is **not HDS-certified**. **Vercel Edge Functions run PHI globally** and are unsafe for patient data.
- Therefore: the Next.js **frontend/shell can live anywhere**, but **anything touching PHI** (database, object storage, API functions handling patient data) must be **pinned to the region correct for that case's corridor**. Treat the app as *"Next.js frontend + region-controlled data plane."*
- Data residency is a **configurable, per-case property set automatically from the corridor at intake** — never a single hard-coded region.

### 2.2 Fixed, non-negotiable technical floors
These are regulatory/security floors, not preferences:
- **AES-256** encryption at rest (or equivalent).
- **TLS 1.3** in transit.
- **PDF/A** for documents.
- **HDS-certified hosting** for French-side data.

Everything else is left to the developer's judgement ("outcomes, not implementations"). For example, the spec requires "immutable audit logs" but does **not** mandate a storage mechanism.

### 2.3 PWA + PHI caution
The app-like feel comes from a service worker — but **do NOT cache patient data offline**. Cache only the static app shell. Sensitive responses stay network-only. Include a clean offline screen for the shell.

### 2.4 Auth provider residency
MFA, RBAC, and session management are needed on day one. Managed providers (Clerk, Auth0) are fast but often store user PII in the US — a problem here. Prefer EU-region providers or self-hosted (Keycloak / Ory). Decide based on **where the provider stores identity data**.

### 2.5 Large-file / DICOM uploads
Serverless functions have body-size and timeout limits. Route large imaging uploads **directly to object storage via presigned URLs** with **chunked / resumable** upload (e.g. tus or S3 multipart) — never through a Next.js API route body. **No DICOM viewer in V1** (deferred to V2; evaluate OHIF later). V1 = secure DICOM **upload/download only**.

---

## 3. Scope tiering (binding)

Every requirement carries a tier. **Only Must Have is a binding V1 commitment.**

| Tag | Meaning | Timeline |
|---|---|---|
| **MUST HAVE** | Platform cannot launch / no referral can happen safely or lawfully without it. | V1 — target 6–8 weeks |
| **SHOULD HAVE** | Meaningfully improves the first cohort's experience; a referral can still complete without it. | V1.5 — first 3 months post-launch |
| **NICE TO HAVE** | Strategically valuable; not required for a working referral loop. | V2+ |

> **Timeline reality:** 6–8 weeks is aggressive for the Must-Have set. If the realistic build materially exceeds that window, the spec says to trim Must Have or reset the timeline — and to raise that *before* committing. The compliance spine is where the time goes.

### 3.1 Developer builds vs. legal supplies
The developer is never asked to be a lawyer. Split every compliance requirement:

| Developer builds (technical control) | LibaMed / legal supplies (judgement & wording) |
|---|---|
| Encryption at rest & in transit | Which standard satisfies which corridor's regulator |
| Role-based access control (RBAC) | Who holds which role, per hospital contract |
| Immutable audit logging | Retention period per corridor |
| Structured consent capture & storage | Consent wording, approved by counsel per corridor |
| Configurable data-residency routing | SCC templates, DPIAs, DPO advice, adequacy assessments |

---

## 4. Corridors (regulatory framework)

**Core design principle — "strictest of both":** for every transfer, identify source + destination jurisdictions and apply whichever regime is stricter on lawful basis, residency, retention, breach notification, and data-subject rights. **UK GDPR / DPA 2018 is the baseline for every case**, with the corridor-specific regime layered on top where stricter.

**"Corridor" is a first-class, configurable object** — not hard-coded logic. Each corridor carries its own: data-residency rule, transfer mechanism, consent wording, retention schedule, language pack, and partner-hospital directory. Config-driven, never `if (corridor === 'france')` scattered through code.

### 4.1 Live corridors (V1 launch)
| Corridor | Anchor partner(s) | Transfer mechanism (from UK) | Hosting rule |
|---|---|---|---|
| **Israel** | Sheba Medical Center | EU-adequate destination; UK IDTA/TRA documented as good practice | No mandatory localisation |
| **France** | Hôpital Foch; Clinique Pasteur (in discussion) | Direct EU transfer under UK adequacy; CNIL rules apply | **HDS-certified EEA hosting mandatory** |
| **Turkey** | Anadolu Medical Center | KVKK-approved SCC + **5-business-day Board notification** | No mandatory localisation |
| **Switzerland** | Hirslanden (priority LOI target) | UK on Swiss Federal Council adequacy list | No mandatory localisation |

### 4.2 Near-future corridors (architect now, activate later)
- **Germany:** build to PDSG/BDSG-level hosting + consent rigour now, so activation is configuration, not rebuild.
- **United States:** build BAA-tracking and minimum-necessary-access logging now, so HIPAA is demonstrable from day one of activation. HIPAA = US floor; UK GDPR = ceiling where stricter.

### 4.3 Per-corridor compliance notes
- **UK (baseline):** UK GDPR + DPA 2018 from intake. NHS-sourced records additionally engage DSPT, Caldicott Principles, NHS Records Management Code. Outbound transfers need a lawful mechanism (UK IDTA, UK Addendum to EU SCCs, or UK-US data bridge) each with a documented Transfer Risk Assessment. Explicit itemised consent per referral.
- **France:** EU GDPR + Loi Informatique et Libertés, enforced by CNIL. HDS-certified EEA hosting. DPIA for large-scale health data, ROPA, 72-hour breach notification.
- **Switzerland:** revFADP (in force Sept 2023), enforced by FDPIC. UK ↔ CH and CH ↔ Israel need no SCCs (adequacy). No general localisation; EU/EEA/Swiss hosting is best practice.
- **Israel:** Protection of Privacy Law 5741-1981 as reformed by Amendment 13 (in force 14 Aug 2025) — governs "especially sensitive" data incl. health. EU-adequate (reaffirmed Jan 2024) + on Switzerland's adequacy list. Amendment 13 introduces mandatory DPOs for large volumes, enhanced breach-notification & security duties.
- **Turkey:** KVKK (Law 6698) as amended by Law 7499 (in force 1 Sept 2024). UK/EU → Turkey needs KVKK-approved SCCs (Turkish text prevails). **Any executed SCC must be notified to the KVKK within 5 business days of signature — build as a tracked, dated compliance task.**

---

## 5. Roles (RBAC — MUST HAVE)

Five roles, each seeing **only the minimum necessary data**:

1. **Referring clinician** — UK/US doctor who creates and owns cases.
2. **Receiving clinician** — named specialist at a partner hospital.
3. **Hospital coordinator** — partner-hospital-side operations.
4. **LibaMed case manager** — internal oversight of case flow.
5. **Compliance / admin** — governance, audit, corridor config, user management.

Access rules also include:
- **Time-limited access:** a receiving clinician's access expires after a defined period of case inactivity (e.g. **90 days**), renewable on request.
- **Immutable audit entry for every view, download, or export** (who, when, what, from where).

---

## 6. Identity & professional verification

### 6.1 Referring clinicians
- **MUST HAVE:** GMC number verification against the **public GMC register** before any UK doctor can create a case. This is the V1 floor and covers the majority of early referrers.
- **SHOULD HAVE (V1.5):** HCPC / NMC / GDC verification; US State Medical Board licence verification; basic practice/employment verification.

> **OPEN QUESTION (resolve day one):** there is no obvious open public GMC API. Confirm the verification method — consuming the online register lookup vs. a licensed data feed. This gates the entire referring-clinician flow and is part of the acceptance test.

### 6.2 Receiving clinicians
- **SHOULD HAVE:** hospital employment confirmation + licence/specialty verification, recorded once at onboarding (lighter check — partner hospitals are accredited institutions).

---

## 7. Security & data architecture (MUST HAVE unless noted)

### 7.1 Hosting & residency — MUST HAVE
- Multi-region architecture; residency configurable per case, set automatically from corridor at intake.
- EEA/HDS-certified hosting for any case touching France; UK or EEA elsewhere.
- AES-256 at rest, TLS 1.3 in transit — no exceptions.

### 7.2 Access control & audit — MUST HAVE
- RBAC (Section 5), least privilege.
- **Immutable** audit log of every view/download/export. "Immutable" = append-only, tamper-evident (hash-chaining or WORM store) — not an `UPDATE`-able table.
- Time-limited receiving-clinician access (90-day inactivity expiry).

### 7.3 Consent & lawful basis — MUST HAVE
- Structured, **itemised** consent captured at referral creation — immutable and independently auditable, **not a checkbox flag**. Versioned records storing the exact wording shown, timestamped.
- Consent withdrawal mid-pathway with a defined **stop-processing workflow**, logged.

### 7.4 Identity & access management — MUST HAVE
- **MFA** for all clinician + admin accounts.
- Session timeout after inactivity.
- Documented password policy (or passwordless/passkey).
- Session/device management: a clinician can **see and revoke** active sessions.

### 7.5 Security operations — SHOULD HAVE (V1.5)
- Security event logging separate from the clinical audit log.
- Documented incident-response process.
- Vulnerability / dependency-patching process.

### 7.6 Certification roadmap — NICE TO HAVE (V2+)
- Cyber Essentials Plus (within year 1), ISO 27001 (later), independent pen testing (once live with real/synthetic data), scheduled DR testing.

### 7.7 Retention, erasure & reversibility — MUST HAVE
- Retention schedule per data category + corridor, with automatic deletion/anonymisation-review flagging.
- Documented, tested DSAR / rectification / erasure process within the shortest statutory window across involved corridors.
- **Reversibility / exit clause from day one:** clean documented export + delete of a corridor's data (at minimum an agreed export format). (Full source-code escrow is a later Should Have.)

---

## 8. Functional requirements by portal

### 8.1 Referring clinician portal — MUST HAVE
- Account creation with GMC verification before any case can be created.
- **Guided case intake wizard** (short, one-question-at-a-time, autosave): patient details → clinical summary → document upload → destination corridor — not a blank form.
- Live per-case status tracker: **Submitted → Under review → Treatment plan received → Confirmed → Treatment complete → Summary returned**.
- Secure messaging with the receiving clinician, threaded per case.
- Dashboard of all the clinician's cases, filterable by patient / corridor / status.

### 8.2 Receiving clinician / hospital portal — MUST HAVE
- A queue of incoming cases addressed to the **named specialist** — never a shared inbox.
- Document access incl. secure DICOM upload/download (viewer deferred to V2).
- Structured response template: treatment plan, cost estimate, timeline.
- Request additional information from the referring clinician without leaving the platform.

### 8.3 LibaMed admin / clinical-governance dashboard
**MUST HAVE:**
- Full visibility of case flow across all corridors.
- Consent status + data-residency confirmation per case.
- Partner-hospital management: accreditation status, active specialties, named receiving clinicians, LOI/contract status — **editable without a developer**.

**SHOULD HAVE (V1.5):**
- Outstanding regulatory tasks per case (e.g. Turkish 5-business-day SCC notification) as trackable dated to-dos.
- Incident & complaints log.
- SLA tracking (e.g. referral → first specialist response).

### 8.4 Interface requirements for non-technical medics — MUST HAVE
- **≤3 clicks from login to starting a new referral.**
- Plain clinical language — no software jargon.
- Guided, one-question-at-a-time workflows with autosave.
- Large, unambiguous touch targets; high colour contrast; tested desktop/tablet/phone.
- Built-in glossary / tooltips for unavoidable regulatory or medical-tourism terms.
- Language support: **English, French, Turkish, Hebrew** for current corridors; German + US English readied for later. **Hebrew is right-to-left (RTL)** — a genuine second layout variant.
- **WCAG 2.2 AA** as a floor.

### 8.5–8.8 (SHOULD / NICE — not in V1 build)
- Case timeline (SHOULD, largely a presentation layer over the audit log).
- Notifications (SHOULD): email at minimum for new case assigned, hospital response received, unread message, consent nearing expiry, access nearing expiry, response overdue vs SLA; in-app notification centre; SMS deferred to V2.
- Hospital accreditation data model (SHOULD).
- Referral completeness indicator (NICE).

---

## 9. Complete V1 page list (67 pages)

Every page below exists in **EN / FR / TR / HE** copy, with **Hebrew as an RTL layout variant**. Responsive across phone/tablet/desktop.

### A. Public site + legal/policy (16)
1. Home / landing
2. How it works
3. The LibaMed Pledge
4. Specialties directory
5. Partner hospitals list
6. Hospital profile (data-driven template)
7. For clinicians (info + register entry)
8. Contact
9. FAQ + glossary
10. Privacy policy
11. Cookie policy (+ consent banner)
12. Terms of service
13. Acceptable use policy
14. Accessibility statement
15. Security / trust page
16. Data processing / sub-processors

### B. Auth & account (12)
17. Register
18. GMC verification step
19. Login
20. MFA enrolment
21. MFA challenge
22. Forgot password
23. Reset password
24. Email verification
25. Account pending / under review
26. Profile & settings
27. Session & device management (view + revoke)
28. Notification preferences

### C. Referring clinician portal (13)
29. Dashboard (all cases, filterable)
30. Intake wizard — step 1: patient details
31. Intake wizard — step 2: clinical summary
32. Intake wizard — step 3: corridor + specialty
33. Intake wizard — step 4: document / DICOM upload
34. Intake wizard — step 5: itemised consent
35. Intake wizard — step 6: review & submit
36. Case created confirmation
37. Case detail (status tracker + documents)
38. Secure messaging thread
39. Treatment plan received view
40. Consent view + withdrawal flow
41. Clinical summary handback view

### D. Receiving clinician / hospital portal (8)
42. Incoming case queue (named specialist, never shared inbox)
43. Case detail + document access
44. DICOM download view
45. Treatment plan response template
46. Request additional information
47. Messaging thread (receiving side)
48. Submit clinical summary form
49. Hospital coordinator dashboard

### E. LibaMed admin / governance (10)
50. Admin dashboard (case flow across corridors)
51. Case oversight detail
52. Partner hospital list
53. Partner hospital add/edit
54. Named clinician management
55. Corridor configuration
56. User & role management (RBAC)
57. Audit log viewer + export
58. Consent records viewer
59. Retention / erasure / DSAR management

### F. System / utility / states (8)
60. 404 not found
61. 403 access denied
62. 500 / error
63. Maintenance
64. Session expired
65. Case access expired (90-day inactivity)
66. Offline (PWA shell)
67. Consent expired notice

**Total V1: 67 named pages** = 51 application screens (B–F) + 16 public/legal pages.

**Explicitly NOT in V1 (V1.5):** case timeline view, in-app notification centre, incident & complaints log, serious-incident report form, regulatory-task tracker (Turkish 5-day SCC), partner-review records, SLA/KPI dashboard.

### 9.1 Non-screen wording to author (V1)
- ~6–8 **email templates**: new case assigned, hospital response received, unread message, consent nearing expiry, access nearing expiry, response overdue vs SLA (+ auth emails: verification, password reset, MFA).
- Itemised **consent text per corridor** (legally supplied; developer builds the capture mechanism).
- Tooltips + regulatory/medical-tourism **glossary**.
- The **Pledge** content (8 commitments — see Section 12).

---

## 10. Data model — core concepts

Model these as first-class entities:

- **Corridor** (config object): residency rule, hosting region, transfer mechanism template, consent wording, retention schedule, language pack, partner directory. Drives routing.
- **Case**: unique reference, referring clinician, patient (record), corridor, specialty, status (state machine per 8.1), assigned receiving specialist, documents, consent records, message thread, audit trail, residency region.
- **Consent record**: itemised, versioned, immutable, timestamped; captures purpose, receiving clinician/hospital, data categories, destination-country protection status; supports withdrawal (stop-processing).
- **Document**: type (referral letter, bloods, DICOM imaging, etc.), stored in the case's region via presigned upload, PDF/A where applicable, encrypted; every access logged.
- **Audit event**: append-only, tamper-evident; who / when / what / from where; covers every view, download, export, consent event, status change.
- **User + Role**: RBAC (5 roles), MFA, sessions/devices, verification status (GMC etc.).
- **Partner hospital**: accreditation (JCI/ISO/national + expiry), specialties (controlled taxonomy), named receiving clinicians, languages, LOI/contract status — admin-editable.
- **Regulatory task** (V1.5): e.g. Turkish 5-business-day SCC notification, dated + tracked.

### 10.1 Adding a corridor — developer checklist
1. Add the jurisdiction's residency rule + hosting region to the config layer.
2. Add the correct transfer-mechanism template to the consent/legal-document generator.
3. Add the language pack + required in-language regulatory disclosures.
4. Add the partner hospital(s), named receiving clinicians, and specialty directory.
5. Run the compliance test suite against the new corridor before go-live.

---

## 11. Specialty directory & taxonomy

Build the specialty list as a **controlled, filterable taxonomy** (not free text). Each partner profile maps to controlled tags:
Oncology (tumour type + technology, e.g. CAR-T / CyberKnife) · Orthopedics (joint/spine/sports/trauma) · Fertility (IVF/ICSI/egg freezing/preservation) · Cardiology (interventional/structural/electrophysiology) · Reconstructive & Cosmetic Surgery (functional/reparative vs aesthetic) · Transplantation (organ-specific) · Neurology/Neurosurgery · Fertility-adjacent Gynaecology.

**Partner specialties (for seeding the directory):**
- **Sheba (Israel):** oncology/haemato-oncology (CAR-T, TIL, precision, gynae/paediatric onc, BMT), orthopedics (robotic joint replacement, spine, sports, trauma), fertility (IVF, oocyte cryopreservation, reproductive endocrinology), cardiology, neuro/neurosurgery, transplantation (liver/kidney/BMT), rehabilitation.
- **Anadolu (Turkey):** oncology (only OECI-accredited centre in Turkey, CyberKnife/TrueBeam, BMT w/ Johns Hopkins), orthopedics/traumatology, fertility, high-end cosmetic/reconstructive (face/body/maxillofacial/burns/cleft), neurosurgery.
- **Hôpital Foch (France):** thoracic surgery & lung transplant (leading FR centre), oncology (w/ Institut Curie & Gustave Roussy), urology/kidney transplant, fertility/gynae (~1,200 IVF cycles/yr), neurosurgery, ENT, ophthalmology.
- **Clinique Pasteur (France, Toulouse — in discussion):** cardiology/cardiac surgery (highest-volume FR private), oncology (#1 regional by chemo volume), reconstructive/maxillofacial.
- **Hirslanden (Switzerland — priority LOI):** orthopedics/trauma (flagship), oncology (CAR-T, robotic tumour surgery), fertility (IVF/ICSI/PGT/egg freezing), cardiology/cardiothoracic, plastic/reconstructive, neuro/neurosurgery, bariatric.

**NHS context (why these specialties):** NHS RTT sets an 18-week max for non-urgent consultant-led treatment and 62 days for suspected-cancer pathways; these are frequently missed (orthopedics among the longest). NHS IVF is a "postcode lottery"; NHS cosmetic surgery is restricted to reconstructive/functional thresholds. **These figures move — pull live/periodically-updated NHS waiting-time data where possible rather than hard-coding.**

---

## 12. The LibaMed Pledge (reflected in the product)

The Pledge is a framework the interface must embody — what it allows, prevents, and discloses:
1. Only list clinics we'd trust with our own families (four-stage accreditation: international cert JCI/ISO/national + outcome-data transparency + UK-standard complaints process + clinical quality audit — before any referral routes).
2. Keep every referral clinician-led (no patient can create/edit/submit a case).
3. Protect the record in transit & at rest to the stricter of both countries' standards (incl. HDS-certified EEA hosting for French data).
4. Be transparent about cost, always (itemised estimate before treatment; no hidden platform fees on the clinical estimate).
5. Hand the patient back to UK care seamlessly (structured summary within 5 working days).
6. Listen when something goes wrong (monitored channel to clinical governance; concerns logged/investigated).
7. Never ask a clinician to compromise professional judgement (no incentivised outcomes).
8. Keep the Pledge under review as corridors are added.

---

## 13. Non-functional requirements

- **Availability (MUST):** target 99.9% uptime for clinician-facing portals; maintenance outside typical UK/EU/Middle-East clinic hours (~07:00–19:00).
- **Performance (MUST):** case creation + document upload in seconds; **chunked/resumable upload** for large imaging.
- **Auditability & DR (MUST):** every Section 4/7 requirement demonstrable from the audit log *alone* (no staff interview needed) in a CNIL/PPA/KVKK/ICO inquiry; documented, per-region backup/restore tested at least annually.
- **Localisation (SHOULD):** legally-reviewed (not machine-translated) local-language consent forms + privacy notices per active corridor; RTL for Hebrew (Arabic readied); correct date/currency/measurement formatting per locale.
- **Scalability (NICE to state):** architecture should not preclude eventually supporting dozens of partner hospitals, low thousands of clinicians, high document/imaging volumes — without rebuild. A design-review checkpoint, not a V1 load test.
- **Business continuity (SHOULD):** document what happens to historic case-data access if LibaMed ceases trading / changes ownership (data export guaranteed for a defined period; no ongoing platform access implied).

---

## 14. V1 acceptance tests (definition of "done")

V1 is accepted when **every** scenario passes (Given/When/Then):

1. **Clinician registration** — Given a UK doctor with a valid GMC number, When they register, Then identity is verified against the public GMC register before they can create a case.
2. **Case creation** — Given a verified referring clinician, When they complete the guided intake, Then a case is created with a unique reference, itemised consent is captured + stored immutably, and it appears in their dashboard as "Submitted".
3. **Secure document upload** — Given an in-progress case, When they upload a referral letter, bloods, and an MRI (DICOM), Then files are encrypted in transit + at rest, stored in the correct region for the corridor, and an audit entry is created.
4. **Routing to the correct specialist** — Given a submitted case with corridor + specialty, When routed, Then it appears only in the named receiving specialist's queue at the correct hospital (never a shared inbox) and the referrer's status updates to "Under review".
5. **Receiving clinician response** — Given a case in a receiving clinician's queue, When they submit a plan + cost estimate, Then the referrer is notified, status → "Treatment plan received", and the plan is visible in the thread.
6. **Secure messaging** — Given an active case, When either clinician sends a message/attachment, Then it's delivered securely, logged, and visible only to the parties on that case.
7. **Consent withdrawal** — Given a case with active consent, When the patient withdraws via the referring clinician, Then further processing stops, the withdrawal is logged immutably, and status reflects it.
8. **Continuity-of-care handback** — Given a case marked "Treatment complete", When the receiving clinician submits the structured summary, Then it's returned to the UK referrer in the case record, status → "Summary returned", timestamped for the 5-working-day commitment.
9. **Audit completeness** — Given any completed case, When the full audit trail is exported, Then every consent event, document access, and status change is present and independently reviewable without interviewing staff.

---

## 15. Phased roadmap

**Phase 1 — V1 Must Have (target 6–8 weeks)**
Multi-region corridor-aware architecture + hosting (incl. HDS EEA for France) · GMC verification + RBAC · core case model (intake, document/DICOM up/download, consent capture, immutable audit) · referring + receiving + core admin portals (Must-Have items) · MFA + session management + Section 7.4 controls · per-corridor consent wording + Turkish 5-day notification tracker · the full Section 14 acceptance suite passing.

**Phase 2 — V1.5 (first 3 months, prioritised by real partner feedback)**
Case timeline · notifications · hospital accreditation data model · security-ops hardening · expanded identity verification (HCPC/NMC/GDC/US + receiving-clinician) · legally-reviewed localised consent/privacy · formal clinical-governance cadence + partner-review records.

**Phase 3 — V2+ (once V1 is proven with real cases)**
DICOM viewer (evaluate OHIF, don't build from scratch) · HL7 FHIR (scoped to a specific EHR target) · referral completeness indicator · Cyber Essentials Plus + ISO 27001 · the future differentiators below.

---

## 16. Explicitly OUT of scope (do not build in V1 — guard against scope creep)

Deferred by design; each has a home but none are in the V1 quote:
- Embedded **DICOM viewer** (V2 — OHIF).
- **HL7 FHIR** integration layer (V2).
- **SMS** notifications (V2 unless a partner requires earlier).
- **Trust Score** / partner transparency rating (needs volume first).
- **Referral Intelligence dashboard** (live NHS-wait vs partner-availability — needs a data feed that doesn't yet exist).
- **AI-assisted document processing** (summarise/translate/OCR/extract — *assistive only, never diagnosis*; must be reviewed by clinical governance before shipping).
- **Research platform / outcome tracking** (collect data-model foundations from V1, but reporting layer is later).
- **International MDT collaboration** (multi-hospital shared discussion — the long-term "north star," a large separate workstream; not scoped with a developer yet).
- **EHR/EMR API integrations** (EMIS, SystmOne, Epic, Cerner, Oracle Health) — but keep case data behind a coherent internal API so future integration isn't unnecessarily hard.
- Polished **analytics/KPI product** (a lightweight internal view is a reasonable V1.5).
- **ISO 27001**, independent **pen testing** (later; don't delay V1 launch for these).

---

## 17. Clinical governance (mostly organisational — platform supports, doesn't build)

- **Organisational (LibaMed appointments, not developer deliverables):** named Clinical Director, Clinical Advisory Board, Clinical Governance Committee cadence. The platform should *record* who holds the Clinical Director role and when it changes.
- **Platform-supported (SHOULD — V1.5):** serious-incident reporting (structured, timestamped, severity-tagged, owned) · partner-hospital review records against the four-stage accreditation criteria · clinical complaints process (distinct channel routed to the Clinical Director) · escalation pathway with time-bound acknowledgement.
- **Annual audit programme (NICE):** build the data model from V1 to support it; the formal programme itself is V2.

---

## 18. Quick-start priorities for the coding agent

1. **Decide hosting/residency topology first** (Section 2.1) — pick region-controllable hosting; isolate a France HDS-certified data plane. This constrains everything else.
2. **Stand up the corridor config engine** (Sections 4 + 10) as the routing backbone.
3. **Auth + MFA + RBAC + immutable audit** (Sections 5, 7) — the spine. Audit must be append-only from the first commit.
4. **Resolve GMC verification method** (Section 6.1 open question) before building the referring flow.
5. **Case model + intake wizard + document/DICOM presigned upload** (Sections 8.1, 10).
6. **Receiving portal (named-specialist queue) + response template + messaging** (Section 8.2).
7. **Core admin dashboard** (Section 8.3 Must Have).
8. **i18n scaffold (EN/FR/TR/HE) + RTL + WCAG 2.2 AA + PWA shell** (Section 8.4).
9. **Drive to the Section 14 acceptance suite passing** — that is the definition of done.

Keep the compliance spine first and the exciting features parked. The whole document's discipline is: *build the smallest platform that lets a real referral happen safely, compliantly, and without email.*
