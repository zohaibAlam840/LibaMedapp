// Case status state machine (C2C spec §8.1) + terminal exception states.
// The ordered pipeline drives the status tracker; the exception states are
// reachable from any active status (consent withdrawal §7.3, access expiry §5).

export const CASE_PIPELINE = [
  "submitted",
  "under-review",
  "plan-received",
  "confirmed",
  "complete",
  "summary-returned",
] as const;

export type PipelineStatus = (typeof CASE_PIPELINE)[number];
export type CaseStatus = PipelineStatus | "consent-withdrawn" | "access-expired";

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  submitted: "Submitted",
  "under-review": "Under review",
  "plan-received": "Treatment plan received",
  confirmed: "Confirmed",
  complete: "Treatment complete",
  "summary-returned": "Summary returned",
  "consent-withdrawn": "Consent withdrawn",
  "access-expired": "Access expired",
};
