// ⚠️ DEMO DATA — design-time only. Nothing here is real patient data.
// Replace with the real region-controlled data layer (C2C spec §2.1/§10).
// Patient identity restraint (design spec §7.2): cases carry an opaque
// patient *reference* only — no patient names/avatars in lists.

import type { CaseStatus } from "@/lib/caseStatus";

export const DEMO_USER = {
  name: "Dr. Amara Chen",
  role: "Referring clinician",
  gmc: "7654321",
};

export const DEMO_SPECIALIST = {
  name: "Dr. Noa Peretz",
  role: "Consultant oncologist · Sheba Medical Center",
};

export interface DemoCase {
  id: string;
  ref: string;
  patientRef: string;
  corridor: "israel" | "france" | "turkey" | "switzerland";
  corridorLabel: string;
  residency: string;
  hospital: string;
  specialist: string;
  specialty: string;
  status: CaseStatus;
  updated: string;
  unread?: number;
}

export const DEMO_CASES: DemoCase[] = [
  {
    id: "LM-2026-0142",
    ref: "LM-2026-0142",
    patientRef: "P-4821",
    corridor: "israel",
    corridorLabel: "UK → Israel",
    residency: "UK (London)",
    hospital: "Sheba Medical Center",
    specialist: "Dr. Noa Peretz",
    specialty: "Oncology",
    status: "under-review",
    updated: "2h ago",
    unread: 2,
  },
  {
    id: "LM-2026-0139",
    ref: "LM-2026-0139",
    patientRef: "P-4796",
    corridor: "france",
    corridorLabel: "UK → France",
    residency: "EEA — HDS (Paris)",
    hospital: "Hôpital Foch",
    specialist: "Dr. Claire Moreau",
    specialty: "Thoracic surgery",
    status: "plan-received",
    updated: "Yesterday",
  },
  {
    id: "LM-2026-0133",
    ref: "LM-2026-0133",
    patientRef: "P-4753",
    corridor: "turkey",
    corridorLabel: "UK → Turkey",
    residency: "UK (London)",
    hospital: "Anadolu Medical Center",
    specialist: "Dr. Emre Kaya",
    specialty: "Orthopedics",
    status: "confirmed",
    updated: "2d ago",
  },
  {
    id: "LM-2026-0127",
    ref: "LM-2026-0127",
    patientRef: "P-4702",
    corridor: "switzerland",
    corridorLabel: "UK → Switzerland",
    residency: "UK (London)",
    hospital: "Hirslanden Zürich",
    specialist: "Dr. Lukas Baumann",
    specialty: "Cardiology",
    status: "complete",
    updated: "5d ago",
  },
  {
    id: "LM-2026-0118",
    ref: "LM-2026-0118",
    patientRef: "P-4655",
    corridor: "israel",
    corridorLabel: "UK → Israel",
    residency: "UK (London)",
    hospital: "Sheba Medical Center",
    specialist: "Dr. Noa Peretz",
    specialty: "Fertility",
    status: "summary-returned",
    updated: "1w ago",
  },
];

export function getDemoCase(id: string): DemoCase {
  return DEMO_CASES.find((c) => c.id === id) ?? DEMO_CASES[0];
}

export interface DemoDocument {
  name: string;
  type: string;
  size: string;
  uploaded: string;
}

export const DEMO_DOCUMENTS: DemoDocument[] = [
  { name: "Referral letter.pdf", type: "Referral letter", size: "240 KB", uploaded: "12 Jul 2026" },
  { name: "Blood panel — June.pdf", type: "Lab results", size: "1.1 MB", uploaded: "12 Jul 2026" },
  { name: "MRI thorax (DICOM)", type: "Imaging — DICOM", size: "312 MB", uploaded: "13 Jul 2026" },
];

export interface DemoMessage {
  direction: "incoming" | "outgoing";
  text?: string;
  attachment?: { name: string; size: string };
  time: string;
  read?: boolean;
}

export const DEMO_MESSAGES: DemoMessage[] = [
  {
    direction: "outgoing",
    text: "Thank you for accepting the referral. The MRI series and June bloods are attached to the case.",
    time: "Mon 09:12",
    read: true,
  },
  {
    direction: "incoming",
    text: "Received, thank you. The imaging is clear. Could you also share the histopathology report from the March biopsy?",
    time: "Mon 11:47",
  },
  {
    direction: "outgoing",
    attachment: { name: "Histopathology — March.pdf", size: "420 KB" },
    time: "Mon 14:03",
    read: true,
  },
  {
    direction: "incoming",
    text: "We will review at our MDT on Thursday and return a treatment plan with costs by Friday.",
    time: "Tue 08:30",
  },
];

export interface DemoHospital {
  id: string;
  name: string;
  city: string;
  country: string;
  corridorLabel: string;
  intro: string;
  accreditation: { name: string; expires: string }[];
  specialties: string[];
  languages: string[];
  clinicians: { name: string; role: string }[];
}

export const DEMO_HOSPITALS: DemoHospital[] = [
  {
    id: "sheba",
    name: "Sheba Medical Center",
    city: "Ramat Gan",
    country: "Israel",
    corridorLabel: "UK → Israel",
    intro:
      "The largest medical centre in the Middle East, with internationally recognised programmes in oncology, orthopedics, and fertility.",
    accreditation: [
      { name: "JCI", expires: "Mar 2027" },
      { name: "ISO 9001", expires: "Nov 2026" },
    ],
    specialties: ["Oncology", "CAR-T", "Orthopedics", "Fertility", "Cardiology", "Transplantation"],
    languages: ["English", "Hebrew", "Russian", "Arabic"],
    clinicians: [
      { name: "Dr. Noa Peretz", role: "Consultant oncologist" },
      { name: "Dr. Avi Shalev", role: "Orthopedic surgeon — spine" },
    ],
  },
  {
    id: "foch",
    name: "Hôpital Foch",
    city: "Suresnes (Paris)",
    country: "France",
    corridorLabel: "UK → France",
    intro:
      "Leading French centre for thoracic surgery and lung transplantation, with major oncology, urology, and fertility programmes.",
    accreditation: [
      { name: "HAS certification", expires: "Jun 2028" },
      { name: "ISO 9001", expires: "Jan 2027" },
    ],
    specialties: ["Thoracic surgery", "Lung transplant", "Oncology", "Urology", "Fertility", "Neurosurgery"],
    languages: ["French", "English"],
    clinicians: [
      { name: "Dr. Claire Moreau", role: "Thoracic surgeon" },
      { name: "Dr. Julien Caron", role: "Consultant urologist" },
    ],
  },
  {
    id: "anadolu",
    name: "Anadolu Medical Center",
    city: "Gebze (Istanbul)",
    country: "Turkey",
    corridorLabel: "UK → Turkey",
    intro:
      "OECI-accredited comprehensive cancer centre affiliated with Johns Hopkins Medicine; strong orthopedics and reconstructive programmes.",
    accreditation: [
      { name: "JCI", expires: "Sep 2026" },
      { name: "OECI", expires: "May 2027" },
    ],
    specialties: ["Oncology", "CyberKnife", "BMT", "Orthopedics", "Reconstructive surgery", "Neurosurgery"],
    languages: ["Turkish", "English", "Arabic"],
    clinicians: [
      { name: "Dr. Emre Kaya", role: "Orthopedic surgeon" },
      { name: "Dr. Selin Aydın", role: "Radiation oncologist" },
    ],
  },
  {
    id: "hirslanden",
    name: "Hirslanden Zürich",
    city: "Zürich",
    country: "Switzerland",
    corridorLabel: "UK → Switzerland",
    intro:
      "Switzerland's largest private hospital group; flagship orthopedics and trauma, with advanced oncology and cardiac surgery.",
    accreditation: [
      { name: "ISO 9001", expires: "Feb 2027" },
      { name: "Swiss Leading Hospitals", expires: "Dec 2026" },
    ],
    specialties: ["Orthopedics", "Trauma", "Oncology", "Cardiology", "Fertility", "Neurosurgery"],
    languages: ["German", "English", "French", "Italian"],
    clinicians: [
      { name: "Dr. Lukas Baumann", role: "Consultant cardiologist" },
      { name: "Dr. Anna Keller", role: "Orthopedic surgeon — knee" },
    ],
  },
];

export function getDemoHospital(id: string): DemoHospital {
  return DEMO_HOSPITALS.find((h) => h.id === id) ?? DEMO_HOSPITALS[0];
}
