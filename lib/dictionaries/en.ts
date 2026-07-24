import type { Dictionary } from "./types";

export const en: Dictionary = {
  nav: {
    forClinicians: "For clinicians",
    pledge: "The Pledge",
    hospitals: "Hospitals",
    specialties: "Specialties",
    howItWorks: "How it works",
    login: "Log in",
    register: "Register",
  },
  footer: {
    privacy: "Privacy",
    cookies: "Cookies",
    terms: "Terms",
    acceptableUse: "Acceptable use",
    accessibility: "Accessibility",
    security: "Security",
    subProcessors: "Sub-processors",
    contact: "Contact",
    faq: "FAQ",
    rights:
      "LibaMed Ltd, Cardiff, Wales. Clinician-led international referrals — patients cannot create or submit cases.",
  },
  home: {
    eyebrow: "Clinician-to-clinician referrals only",
    title: "International referrals, without leaving your patient’s side",
    subhead:
      "Refer to a named specialist at an accredited hospital abroad — with consent, security, and a structured summary back to UK care. No email, ever.",
    ctaRegister: "Register as a clinician",
    ctaHow: "How it works",
    stats: [
      { n: "4", l: "possible corridors" },
      { n: "100%", l: "clinician-led" },
    ],
    values: [
      {
        title: "Clinician-led, always",
        text: "Only a verified referring doctor can create a case. Patients never book treatment through LibaMed.",
      },
      {
        title: "Named specialists, vetted hospitals",
        text: "Every referral goes to a named receiving specialist at an accredited partner hospital — never a general inbox.",
      },
      {
        title: "Protected to the stricter standard",
        text: "Records are encrypted and stored under the stricter of both countries' rules — including HDS-certified hosting for France.",
      },
    ],
    pathwayTitle: "One loop, start to finish",
    pathwayLede:
      "The whole referral happens in one place — no email threads, no couriered discs, no chasing.",
    pathway: [
      { title: "Create the referral", description: "A verified UK clinician opens a case with the patient's consent — guided, one question at a time." },
      { title: "Attach the records", description: "Referral letter, bloods, imaging including DICOM — encrypted and stored in the right region for the destination." },
      { title: "Route to a named specialist", description: "The case lands in one named specialist's queue at an accredited partner hospital. Never a shared inbox." },
      { title: "Review and plan", description: "The specialist returns a treatment plan with an itemised cost estimate and timeline, inside the platform." },
      { title: "Hand back to UK care", description: "After treatment, a structured clinical summary returns to the referring clinician within 5 working days." },
    ],
    corridorsTitle: "Four corridors at launch",
    corridorsLede:
      "Each corridor carries its own data-protection rules, applied automatically to every case.",
    pledgeTitle: "The LibaMed Pledge",
    pledgeBody:
      "Eight commitments the platform is built to keep — from four-stage hospital vetting to cost transparency and a guaranteed handback to UK care.",
    pledgeCta: "Read the full Pledge",
    pledgeItems: [
      "Only clinics we'd trust with our own families",
      "Every referral is clinician-led",
      "Protected to the stricter standard",
      "Transparent about cost, always",
      "A seamless handback to UK care",
      "We listen when something goes wrong",
      "Professional judgement is never for sale",
      "The Pledge grows with us",
    ],
    specialtiesTitle: "Specialties",
    viewAll: "View all",
    security: [
      "AES-256 encryption at rest",
      "TLS 1.3 in transit",
      "HDS-certified EEA hosting for France",
    ],
    securityLink: "Security overview",
    faqTitle: "Common questions",
    faqAll: "All questions & glossary",
    faqs: [
      { q: "What is LibaMed?", a: "A clinician-to-clinician platform for international medical referrals. A UK doctor refers a patient — with consent — to a named specialist at an accredited hospital abroad, and receives a structured summary back for continuity of care. LibaMed Ltd is registered in Cardiff, Wales." },
      { q: "Is this a medical-tourism booking site?", a: "No. There is no patient-facing booking. Patients cannot create, edit, or submit cases — every referral is created and owned by a verified clinician." },
      { q: "How long does a referral take to create?", a: "Minutes. The guided intake asks one question at a time and saves as you go — most clinicians complete it between patients." },
    ],
    ctaTitle: "Give your patient options beyond the waiting list",
    ctaButton: "Register as a clinician",
  },
};
