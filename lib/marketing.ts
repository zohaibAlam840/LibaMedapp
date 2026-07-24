// Shared marketing content: pathway steps, Pledge commitments, FAQs, glossary.
// Copy is working draft — final wording owned by LibaMed; no lorem ipsum.

export const PATHWAY_STEPS = [
  {
    title: "Create the referral",
    description:
      "A verified UK clinician opens a case with the patient's consent — guided, one question at a time.",
  },
  {
    title: "Attach the records",
    description:
      "Referral letter, bloods, imaging including DICOM — encrypted and stored in the right region for the destination.",
  },
  {
    title: "Route to a named specialist",
    description:
      "The case lands in one named specialist's queue at an accredited partner hospital. Never a shared inbox.",
  },
  {
    title: "Review and plan",
    description:
      "The specialist returns a treatment plan with an itemised cost estimate and timeline, inside the platform.",
  },
  {
    title: "Hand back to UK care",
    description:
      "After treatment, a structured clinical summary returns to the referring clinician within 5 working days.",
  },
];

export const PLEDGE_COMMITMENTS = [
  {
    title: "Only clinics we'd trust with our own families",
    body: "Every partner passes four-stage accreditation — international certification, outcome-data transparency, a UK-standard complaints process, and clinical quality audit — before a single referral routes.",
    proof: { label: "See our partner hospitals", href: "/hospitals" },
  },
  {
    title: "Every referral is clinician-led",
    body: "No patient can create, edit, or submit a case. A verified doctor owns the referral from start to finish.",
  },
  {
    title: "Protected to the stricter standard",
    body: "Records are encrypted in transit and at rest, and stored under the stricter of both countries' rules — including HDS-certified EEA hosting for French data.",
    proof: { label: "Read the security overview", href: "/security" },
  },
  {
    title: "Transparent about cost, always",
    body: "An itemised estimate before treatment. No hidden platform fees on the clinical estimate — ever.",
  },
  {
    title: "A seamless handback to UK care",
    body: "A structured clinical summary reaches the referring clinician within 5 working days of treatment completing.",
  },
  {
    title: "We listen when something goes wrong",
    body: "A monitored channel to clinical governance. Concerns are logged, investigated, and answered.",
  },
  {
    title: "Professional judgement is never for sale",
    body: "No incentivised outcomes. Nothing on the platform rewards a clinician for referring — or for not referring.",
  },
  {
    title: "The Pledge grows with us",
    body: "As corridors are added, the Pledge is reviewed so every commitment still holds in every jurisdiction.",
  },
];

export interface Faq {
  q: string;
  a: string;
  category: "About" | "Referrals" | "Data & privacy" | "Hospitals" | "Costs" | "Access";
}

export const FAQS: Faq[] = [
  { category: "About", q: "What is LibaMed?", a: "A clinician-to-clinician platform for international medical referrals. A UK doctor refers a patient — with consent — to a named specialist at an accredited hospital abroad, and receives a structured summary back for continuity of care. LibaMed Ltd is registered in Cardiff, Wales." },
  { category: "About", q: "Is this a medical-tourism booking site?", a: "No. There is no patient-facing booking. Patients cannot create, edit, or submit cases — every referral is created and owned by a verified clinician." },
  { category: "Referrals", q: "How long does a referral take to create?", a: "Minutes. The guided intake asks one question at a time and saves as you go — most clinicians complete it between patients." },
  { category: "Referrals", q: "Who sees the referral at the receiving hospital?", a: "Only the named receiving specialist you selected, and their direct clinical team. Cases never land in a shared inbox." },
  { category: "Referrals", q: "What happens after treatment?", a: "The receiving specialist returns a structured clinical summary — treatment given, outcome, medications, follow-up plan — within 5 working days of completion." },
  { category: "Referrals", q: "Can my patient withdraw consent mid-referral?", a: "Yes, at any time, via you as the referring clinician. All further processing stops immediately and the withdrawal is logged immutably." },
  { category: "Data & privacy", q: "Where is my patient's data stored?", a: "In the region required by the destination corridor, set automatically at intake. French cases are held on HDS-certified EEA infrastructure; every case shows its residency region." },
  { category: "Data & privacy", q: "How is the data protected?", a: "AES-256 encryption at rest, TLS 1.3 in transit, role-based access on a least-privilege basis, and an immutable audit log of every view, download, and export." },
  { category: "Data & privacy", q: "Is anything stored on my phone?", a: "No. The app installs to your home screen, but patient data is never cached on the device — it always loads over an encrypted connection." },
  { category: "Data & privacy", q: "Can I get a full audit trail?", a: "Yes. Every consent event, document access, and status change is recorded append-only and can be exported for independent review." },
  { category: "Hospitals", q: "How are partner hospitals chosen?", a: "Four-stage accreditation: international certification (JCI/ISO/national), outcome-data transparency, a UK-standard complaints process, and clinical quality audit — before any referral routes." },
  { category: "Hospitals", q: "Which specialties are covered?", a: "Oncology, orthopedics, fertility, cardiology, neurosurgery, transplantation, and reconstructive surgery, with sub-specialty routing per hospital." },
  { category: "Costs", q: "What does the platform cost the patient?", a: "The clinical estimate comes itemised from the hospital, with no hidden platform fees added. Cost transparency before treatment is a Pledge commitment." },
  { category: "Costs", q: "Who pays for treatment?", a: "Treatment is contracted between the patient and the receiving hospital. LibaMed carries the referral, records, and communication — not the payment." },
  { category: "Access", q: "Who can register?", a: "UK-registered doctors (GMC-verified at sign-up) and, at launch partners, US-licensed physicians. Receiving clinicians are onboarded through their hospitals." },
  { category: "Access", q: "Why do you verify my GMC number?", a: "Every referral must be clinician-led. Verification against the public GMC register before your first case is how we keep that promise." },
];

export const GLOSSARY: { term: string; def: string }[] = [
  { term: "Corridor", def: "A configured referral route between two countries (e.g. UK → France), carrying its own data-residency, consent, and transfer rules." },
  { term: "DICOM", def: "The standard format for medical imaging (MRI, CT). LibaMed transfers DICOM securely; viewing happens in your own PACS software." },
  { term: "DSAR", def: "Data Subject Access Request — a person's legal right to see the data held about them. LibaMed supports these within statutory deadlines." },
  { term: "DSPT", def: "The NHS Data Security and Protection Toolkit — the assurance standard engaged when NHS-sourced records are involved." },
  { term: "GMC", def: "The General Medical Council — the UK doctors' register. Referring clinicians are verified against it before their first case." },
  { term: "HDS", def: "Hébergeur de Données de Santé — France's mandatory certification for hosting health data. French cases live on HDS-certified EEA infrastructure." },
  { term: "IDTA", def: "The UK International Data Transfer Agreement — a lawful mechanism for sending personal data out of the UK." },
  { term: "Itemised consent", def: "Consent captured item by item — who sees the data, where it goes, for what purpose — each with the exact wording and time recorded." },
  { term: "JCI", def: "Joint Commission International — a leading global hospital accreditation. Part of our four-stage partner vetting." },
  { term: "KVKK", def: "Turkey's data-protection law. UK → Turkey transfers use KVKK-approved contract clauses, notified to the Turkish authority within 5 business days." },
  { term: "MDT", def: "Multi-disciplinary team — the group of specialists who review complex cases together at the receiving hospital." },
  { term: "RTT", def: "Referral to Treatment — the NHS waiting-time standard (18 weeks for non-urgent care) that many patients currently wait beyond." },
  { term: "SCC", def: "Standard Contractual Clauses — pre-approved legal terms that make an international data transfer lawful." },
  { term: "Named specialist", def: "The specific doctor your referral is addressed to. Cases route to their personal queue, never a general hospital inbox." },
];
