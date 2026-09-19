// Case status state machine (C2C spec §8.1) + terminal exception states.
// The ordered pipeline drives the status tracker; the exception states are
// reachable from any active status (consent withdrawal §7.3, access expiry §5).
//
// Two statuses sit BEFORE the pipeline and deliberately stay out of it, so the
// tracker still reads as six steps: an introducer-originated case is a `draft`
// while it is being written and `awaiting-cosign` once submitted. It only
// becomes `submitted` — a real referral, visible to a hospital — when a
// UK-registered clinician co-signs it (migration 006).

export const CASE_PIPELINE = [
  "submitted",
  "under-review",
  "plan-received",
  "confirmed",
  "complete",
  "summary-returned",
] as const;

export type PipelineStatus = (typeof CASE_PIPELINE)[number];
export type PreSubmissionStatus = "draft" | "awaiting-cosign";
export type CaseStatus =
  | PipelineStatus
  | PreSubmissionStatus
  | "consent-withdrawn"
  | "access-expired";

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  draft: "Draft",
  "awaiting-cosign": "Awaiting co-sign",
  submitted: "Submitted",
  "under-review": "Under review",
  "plan-received": "Treatment plan received",
  confirmed: "Confirmed",
  complete: "Treatment completed",
  "summary-returned": "Summary returned",
  "consent-withdrawn": "Consent withdrawn",
  "access-expired": "Access expired",
};

/** True while a case has not yet been co-signed into the pipeline. */
export function isPreSubmission(status: CaseStatus): boolean {
  return status === "draft" || status === "awaiting-cosign";
}
