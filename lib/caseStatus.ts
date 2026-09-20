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

/**
 * Which SIDE of a case owns each pipeline transition.
 *
 * This is the authority for both the buttons and the server action, so the two
 * cannot drift. It exists because they did: the action bar knew that accepting
 * a referral is the hospital's move, but `advanceStatusAction` checked only
 * that the caller could write the case — and the referring clinician can. A
 * referrer who opened the receiving view of their own case was offered "Accept
 * for review", and clicking it wrote "Case accepted for review" against their
 * own name. In a system whose entire value is the audit trail, a record of the
 * hospital accepting a case that the hospital never saw is worse than a bug.
 */
export const TRANSITION_OWNER: Record<string, "referring" | "receiving"> = {
  "submitted→under-review": "receiving",
  "under-review→plan-received": "receiving",
  "confirmed→complete": "receiving",
  "complete→summary-returned": "receiving",
  "plan-received→confirmed": "referring",
};

/** The side entitled to make this move, or null if it isn't a pipeline move. */
export function transitionOwner(from: CaseStatus, to: CaseStatus): "referring" | "receiving" | null {
  return TRANSITION_OWNER[`${from}→${to}`] ?? null;
}
