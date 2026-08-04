// Corridor = first-class config object (C2C spec §2.2). Residency, transfer
// basis, safeguard wording, and NHS-availability all live HERE — never
// hard-coded per-region in components (`if (corridor === 'turkey')` is a bug).
//
// This registry is the backbone for two of the NHS-safeguard additions:
//   · item 5 — corridor-level data-transfer tagging (`transferBasis`)
//   · item 7 — platform-enforced eligibility gating (`specialties[].nhs`)

/**
 * Corridor identifier. A plain string, NOT a closed union: corridors are
 * created by admins at runtime (see lib/db/corridors.ts), so the compiler
 * cannot know the full set. The four below are the launch corridors and remain
 * the offline fallback when the database is unreachable.
 */
export type CorridorId = string;

/**
 * Legal basis for sharing UK patient data with the corridor's clinicians.
 * - "adequacy": the destination is covered by UK adequacy regulations, so no
 *   extra contractual transfer mechanism is required (Israel, Switzerland, and
 *   the EEA via HDS for France).
 * - "scc": no adequacy finding — the transfer relies on Standard Contractual
 *   Clauses / an IDTA, and may carry a local notification duty (Turkey/KVKK).
 */
export type TransferBasis = "adequacy" | "scc";

/**
 * NHS availability of a specialty in a corridor (item 7). A GP may only refer
 * abroad where NHS care is NOT the routine substitute — the "nhs-routine" tag
 * is gated OUT of intake so the platform, not the GP, enforces the line the
 * non-substitution declaration (item 1) attests to.
 */
export type NhsAvailability = "nhs-unavailable" | "nhs-delayed" | "nhs-routine";

export const NHS_AVAILABILITY_LABELS: Record<NhsAvailability, string> = {
  "nhs-unavailable": "Not NHS-commissioned",
  "nhs-delayed": "NHS wait exceeds clinical threshold",
  "nhs-routine": "Routinely available on the NHS",
};

export interface CorridorSpecialty {
  name: string;
  nhs: NhsAvailability;
}

/**
 * The subset of a corridor needed to explain a data transfer. Both the code
 * registry (CorridorConfig) and the DB record (CorridorRecord) satisfy this, so
 * UI that only explains the legal basis can accept either.
 */
export interface CorridorTransferInfo {
  country: string;
  transferBasis: TransferBasis;
  safeguard: string;
  notification?: { authority: string; withinBusinessDays: number };
}

export interface CorridorConfig {
  id: CorridorId;
  label: string;
  country: string;
  /** Primary partner hospital id (see DEMO_HOSPITALS). */
  hospitalId: string;
  /** Where the patient's PHI is hosted (France must sit on HDS-certified EEA). */
  residency: string;
  transferBasis: TransferBasis;
  /** Plain-language safeguard shown to the GP (item 5) and the patient (item 6). */
  safeguard: string;
  /** SCC corridors may owe a local notification within N business days of the
   *  first transfer (tracked so it is never missed). */
  notification?: { authority: string; withinBusinessDays: number };
  specialties: CorridorSpecialty[];
}

export const CORRIDORS: Record<CorridorId, CorridorConfig> = {
  israel: {
    id: "israel",
    label: "UK → Israel",
    country: "Israel",
    hospitalId: "sheba",
    residency: "UK (London)",
    transferBasis: "adequacy",
    safeguard:
      "Israel is covered by UK adequacy regulations — patient data may be shared with the treating clinicians without an additional transfer contract.",
    specialties: [
      { name: "Oncology", nhs: "nhs-delayed" },
      { name: "CAR-T", nhs: "nhs-unavailable" },
      { name: "Orthopedics", nhs: "nhs-delayed" },
      { name: "Fertility", nhs: "nhs-unavailable" },
      { name: "Cardiology", nhs: "nhs-routine" },
      { name: "Transplantation", nhs: "nhs-unavailable" },
    ],
  },
  france: {
    id: "france",
    label: "UK → France",
    country: "France",
    hospitalId: "foch",
    residency: "EEA — HDS (Paris)",
    transferBasis: "adequacy",
    safeguard:
      "France is in the EEA and covered by UK adequacy; patient data is hosted on HDS-certified health infrastructure. No additional transfer contract is required.",
    specialties: [
      { name: "Thoracic surgery", nhs: "nhs-delayed" },
      { name: "Lung transplant", nhs: "nhs-unavailable" },
      { name: "Oncology", nhs: "nhs-delayed" },
      { name: "Urology", nhs: "nhs-routine" },
      { name: "Fertility", nhs: "nhs-unavailable" },
      { name: "Neurosurgery", nhs: "nhs-delayed" },
    ],
  },
  turkey: {
    id: "turkey",
    label: "UK → Turkey",
    country: "Turkey",
    hospitalId: "anadolu",
    residency: "UK (London)",
    transferBasis: "scc",
    safeguard:
      "Turkey is not covered by UK adequacy — the transfer relies on Standard Contractual Clauses (IDTA). A KVKK notification is due within 5 business days of the first data transfer.",
    notification: { authority: "KVKK (Turkey)", withinBusinessDays: 5 },
    specialties: [
      { name: "Oncology", nhs: "nhs-delayed" },
      { name: "CyberKnife", nhs: "nhs-unavailable" },
      { name: "Orthopedics", nhs: "nhs-delayed" },
      { name: "Reconstructive surgery", nhs: "nhs-unavailable" },
      { name: "Neurosurgery", nhs: "nhs-delayed" },
    ],
  },
  switzerland: {
    id: "switzerland",
    label: "UK → Switzerland",
    country: "Switzerland",
    hospitalId: "hirslanden",
    residency: "UK (London)",
    transferBasis: "adequacy",
    safeguard:
      "Switzerland is covered by UK adequacy regulations — patient data may be shared with the treating clinicians without an additional transfer contract.",
    specialties: [
      { name: "Orthopedics", nhs: "nhs-delayed" },
      { name: "Trauma", nhs: "nhs-routine" },
      { name: "Oncology", nhs: "nhs-delayed" },
      { name: "Cardiology", nhs: "nhs-routine" },
      { name: "Fertility", nhs: "nhs-unavailable" },
      { name: "Neurosurgery", nhs: "nhs-delayed" },
    ],
  },
};

export const CORRIDOR_LIST: CorridorConfig[] = Object.values(CORRIDORS);

/**
 * Look up a launch corridor from the code registry. Admin-created corridors are
 * NOT here — callers that must handle those read lib/db/corridors.ts instead.
 * Returns a neutral placeholder rather than undefined so a page never crashes
 * on an id it doesn't recognise.
 */
export function getCorridor(id: CorridorId): CorridorConfig {
  return CORRIDORS[id] ?? UNKNOWN_CORRIDOR(id);
}

function UNKNOWN_CORRIDOR(id: CorridorId): CorridorConfig {
  return {
    id,
    label: id,
    country: "",
    hospitalId: "",
    residency: "",
    transferBasis: "scc", // fail safe: assume the stricter basis
    safeguard:
      "Transfer safeguard is configured for this corridor in the admin console.",
    specialties: [],
  };
}

/** A specialty is referable abroad only when NHS care is not the routine option. */
export function isReferable(spec: CorridorSpecialty): boolean {
  return spec.nhs !== "nhs-routine";
}

/** Specialties a GP may actually select in a corridor (item 7 gating). */
export function referableSpecialties(id: CorridorId): CorridorSpecialty[] {
  return CORRIDORS[id].specialties.filter(isReferable);
}

/** True when the GP is allowed to refer this specialty into this corridor. */
export function canRefer(id: CorridorId, specialtyName: string): boolean {
  const spec = CORRIDORS[id].specialties.find((s) => s.name === specialtyName);
  return spec ? isReferable(spec) : false;
}
