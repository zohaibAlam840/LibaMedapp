// Referral compliance record (NHS-safeguard additions, Jul 2026). Kept apart
// from the base DemoCase so the new concern is isolated and additive:
//   · item 1 — NHS non-substitution declaration
//   · item 2 — immutable per-referral audit trail (GP-facing, exportable)
//   · item 3 — continuity-of-care (handback) tracking
//   · item 6 — separate patient consent capture
//
// ⚠️ DEMO DATA. True audit immutability (append-only / hash-chained) and real
// enforcement live in the backend data plane — this only shapes the frontend.

import type { CorridorId } from "@/lib/corridors";
import { getCorridor } from "@/lib/corridors";

/* ── item 1 · NHS non-substitution declaration ─────────────────────────── */

export type NonSubstitutionReason =
  | "not-nhs-commissioned"
  | "patient-private-pay"
  | "nhs-wait-exceeds-threshold"
  | "outside-nhs-pathway";

export const NON_SUBSTITUTION_LABELS: Record<NonSubstitutionReason, string> = {
  "not-nhs-commissioned": "Treatment is not NHS-commissioned",
  "patient-private-pay": "Patient is already private-pay",
  "nhs-wait-exceeds-threshold": "NHS wait exceeds the clinical threshold",
  "outside-nhs-pathway": "Patient is already outside the NHS pathway",
};

export const NON_SUBSTITUTION_OPTIONS = Object.entries(NON_SUBSTITUTION_LABELS).map(
  ([value, label]) => ({ value: value as NonSubstitutionReason, label }),
);

export interface NonSubstitution {
  reason: NonSubstitutionReason;
  justification: string;
  declaredBy: string;
  declaredAt: string;
}

/* ── item 3 · continuity-of-care (handback) ────────────────────────────── */

export type HandbackState = "not-due" | "awaited" | "received" | "overdue";

export const HANDBACK_LABELS: Record<HandbackState, string> = {
  "not-due": "Not yet due",
  awaited: "Awaiting handback",
  received: "Summary returned",
  overdue: "Overdue",
};

export interface Handback {
  state: HandbackState;
  /** ISO date the discharge summary / treatment record is expected by. */
  dueBy: string;
  receivedAt?: string;
}

export function isHandbackOverdue(h: Handback, now = new Date()): boolean {
  if (h.state === "received" || h.state === "not-due") return false;
  return h.state === "overdue" || new Date(h.dueBy) < now;
}

/* ── item 6 · separate patient consent ─────────────────────────────────── */

export interface ConsentItem {
  id: string;
  label: string;
  agreed: boolean;
}

export interface PatientConsent {
  version: string;
  /** Destination country + safeguard are surfaced verbatim to the patient. */
  country: string;
  safeguard: string;
  items: ConsentItem[];
  capturedAt: string;
  withdrawnAt?: string;
}

/** Build the itemised consent a patient must confirm for a given corridor. */
export function consentTemplate(corridorId: CorridorId): Omit<PatientConsent, "capturedAt"> {
  const c = getCorridor(corridorId);
  return {
    version: "2026-07",
    country: c.country,
    safeguard: c.safeguard,
    items: [
      { id: "leaves-uk", label: `I understand my records will be shared with clinicians in ${c.country}.`, agreed: false },
      { id: "safeguard", label: "I understand the legal safeguard that protects this transfer.", agreed: false },
      { id: "purpose", label: "I consent to this data being used to plan and deliver my treatment.", agreed: false },
      { id: "withdraw", label: "I understand I can withdraw consent at any time, which stops further processing.", agreed: false },
    ],
  };
}

/* ── item 2 · immutable referral audit trail ───────────────────────────── */

export type AuditEvent =
  | "referral.created"
  | "nonsubstitution.declared"
  | "consent.captured"
  | "document.uploaded"
  | "specialist.accepted"
  | "scope.set"
  | "message.sent"
  | "handback.received";

export const AUDIT_EVENT_LABELS: Record<AuditEvent, string> = {
  "referral.created": "Referral created",
  "nonsubstitution.declared": "NHS non-substitution declared",
  "consent.captured": "Patient consent captured",
  "document.uploaded": "Document uploaded",
  "specialist.accepted": "Specialist accepted referral",
  "scope.set": "Treatment scope set",
  "message.sent": "Message sent",
  "handback.received": "Care summary returned",
};

export interface AuditEntry {
  seq: number;
  at: string;
  actor: string;
  event: AuditEvent;
  detail: string;
  /** Hash-chain placeholder — the backend fills real chained hashes; the
   *  frontend only presents them. Immutability is NOT a frontend guarantee. */
  hash?: string;
}

/* ── the bundle ────────────────────────────────────────────────────────── */

export interface ReferralCompliance {
  referralId: string;
  corridor: CorridorId;
  /** No commission / benefit accrues to the referrer (item 4) — always true. */
  noReferrerFee: true;
  nonSubstitution: NonSubstitution;
  treatmentScope: string;
  patientConsent: PatientConsent;
  handback: Handback;
  audit: AuditEntry[];
}

const DEMO_COMPLIANCE: Record<string, ReferralCompliance> = {
  "LM-2026-0142": {
    referralId: "LM-2026-0142",
    corridor: "israel",
    noReferrerFee: true,
    nonSubstitution: {
      reason: "nhs-wait-exceeds-threshold",
      justification:
        "Tertiary CAR-T assessment; local NHS pathway wait (14 weeks) exceeds the clinical threshold for this patient.",
      declaredBy: "Dr. Amara Chen (GMC 7654321)",
      declaredAt: "12 Jul 2026 09:04",
    },
    treatmentScope: "Oncology assessment + CAR-T eligibility review",
    patientConsent: {
      version: "2026-07",
      country: "Israel",
      safeguard: getCorridor("israel").safeguard,
      items: [
        { id: "leaves-uk", label: "Records shared with clinicians in Israel.", agreed: true },
        { id: "safeguard", label: "Understands the transfer safeguard.", agreed: true },
        { id: "purpose", label: "Consents to use for treatment planning.", agreed: true },
        { id: "withdraw", label: "Understands the right to withdraw.", agreed: true },
      ],
      capturedAt: "12 Jul 2026 09:22",
    },
    handback: { state: "awaited", dueBy: "2026-07-31" },
    audit: [
      { seq: 1, at: "12 Jul 2026 09:02", actor: "Dr. Amara Chen", event: "referral.created", detail: "Referral LM-2026-0142 created", hash: "3f9a…c1" },
      { seq: 2, at: "12 Jul 2026 09:04", actor: "Dr. Amara Chen", event: "nonsubstitution.declared", detail: "NHS wait exceeds clinical threshold", hash: "a71b…4e" },
      { seq: 3, at: "12 Jul 2026 09:22", actor: "Dr. Amara Chen", event: "consent.captured", detail: "Patient consent v2026-07 captured", hash: "d208…9f" },
      { seq: 4, at: "13 Jul 2026 14:10", actor: "Dr. Noa Peretz", event: "specialist.accepted", detail: "Accepted at Sheba Medical Center", hash: "5c6e…22" },
      { seq: 5, at: "13 Jul 2026 14:12", actor: "Dr. Noa Peretz", event: "scope.set", detail: "Scope: CAR-T eligibility review", hash: "8b41…a0" },
    ],
  },
  "LM-2026-0133": {
    referralId: "LM-2026-0133",
    corridor: "turkey",
    noReferrerFee: true,
    nonSubstitution: {
      reason: "not-nhs-commissioned",
      justification: "Requested reconstructive technique is not NHS-commissioned for this indication.",
      declaredBy: "Dr. Amara Chen (GMC 7654321)",
      declaredAt: "05 Jul 2026 11:20",
    },
    treatmentScope: "Orthopedic reconstruction — surgical plan + costs",
    patientConsent: {
      version: "2026-07",
      country: "Turkey",
      safeguard: getCorridor("turkey").safeguard,
      items: [
        { id: "leaves-uk", label: "Records shared with clinicians in Turkey.", agreed: true },
        { id: "safeguard", label: "Understands SCC/IDTA transfer safeguard.", agreed: true },
        { id: "purpose", label: "Consents to use for treatment planning.", agreed: true },
        { id: "withdraw", label: "Understands the right to withdraw.", agreed: true },
      ],
      capturedAt: "05 Jul 2026 11:38",
    },
    handback: { state: "overdue", dueBy: "2026-07-18" },
    audit: [
      { seq: 1, at: "05 Jul 2026 11:18", actor: "Dr. Amara Chen", event: "referral.created", detail: "Referral LM-2026-0133 created", hash: "11ee…7c" },
      { seq: 2, at: "05 Jul 2026 11:20", actor: "Dr. Amara Chen", event: "nonsubstitution.declared", detail: "Not NHS-commissioned", hash: "94af…03" },
      { seq: 3, at: "05 Jul 2026 11:38", actor: "Dr. Amara Chen", event: "consent.captured", detail: "Patient consent v2026-07 captured", hash: "77cd…b8" },
      { seq: 4, at: "06 Jul 2026 08:45", actor: "Dr. Emre Kaya", event: "specialist.accepted", detail: "Accepted at Anadolu Medical Center", hash: "2a10…e5" },
    ],
  },
  "LM-2026-0118": {
    referralId: "LM-2026-0118",
    corridor: "israel",
    noReferrerFee: true,
    nonSubstitution: {
      reason: "not-nhs-commissioned",
      justification: "Fertility preservation regimen not NHS-commissioned for this indication.",
      declaredBy: "Dr. Amara Chen (GMC 7654321)",
      declaredAt: "20 Jun 2026 10:00",
    },
    treatmentScope: "Fertility preservation — full cycle",
    patientConsent: {
      version: "2026-07",
      country: "Israel",
      safeguard: getCorridor("israel").safeguard,
      items: [
        { id: "leaves-uk", label: "Records shared with clinicians in Israel.", agreed: true },
        { id: "safeguard", label: "Understands the transfer safeguard.", agreed: true },
        { id: "purpose", label: "Consents to use for treatment planning.", agreed: true },
        { id: "withdraw", label: "Understands the right to withdraw.", agreed: true },
      ],
      capturedAt: "20 Jun 2026 10:15",
    },
    handback: { state: "received", dueBy: "2026-07-10", receivedAt: "08 Jul 2026" },
    audit: [
      { seq: 1, at: "20 Jun 2026 09:58", actor: "Dr. Amara Chen", event: "referral.created", detail: "Referral LM-2026-0118 created", hash: "0c33…41" },
      { seq: 2, at: "20 Jun 2026 10:00", actor: "Dr. Amara Chen", event: "nonsubstitution.declared", detail: "Not NHS-commissioned", hash: "6d92…af" },
      { seq: 3, at: "20 Jun 2026 10:15", actor: "Dr. Amara Chen", event: "consent.captured", detail: "Patient consent v2026-07 captured", hash: "e5b7…10" },
      { seq: 4, at: "08 Jul 2026 16:40", actor: "Dr. Noa Peretz", event: "handback.received", detail: "Care summary returned to UK", hash: "9f01…dd" },
    ],
  },
};

export function getReferralCompliance(id: string): ReferralCompliance | undefined {
  return DEMO_COMPLIANCE[id];
}
