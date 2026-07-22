// Patient access class — a DATA SUBJECT, not a workforce role. Deliberately
// kept OUT of lib/rbac's `Role` union (the "never add roles" rule is about
// staff roles). A patient is scoped to exactly ONE referral and is read-only:
// they can view their referral's status, consent, documents, and the message
// timeline (honouring each message's `patientVisible` flag), and nothing else.
//
// In production a patient is invited per-referral (scoped magic-link); there is
// no patient self-signup and no cross-referral listing. This module only models
// the session shape + demo data — the (patient) portal wiring is Phase 3.

export const DEMO_PATIENT_COOKIE = "libamed_demo_patient";

export interface PatientSession {
  kind: "patient";
  name: string;
  /** Opaque patient reference — never a real identity in demo data. */
  patientRef: string;
  /** The single referral this session may view. Scope is one, never a list. */
  referralId: string;
  readOnly: true;
}

export const DEMO_PATIENT: PatientSession = {
  kind: "patient",
  name: "Demo patient",
  patientRef: "P-4821",
  referralId: "LM-2026-0142",
  readOnly: true,
};

/** A patient session may only ever view its own single referral. */
export function patientCanView(session: PatientSession, referralId: string): boolean {
  return session.referralId === referralId;
}
