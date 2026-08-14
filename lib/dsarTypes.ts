// Shared shapes + labels for data-subject requests.
//
// Kept OUT of lib/db/dsar.ts because that module is `server-only`: the request
// row renders in a client component, and importing the DB layer for a type
// would drag the service-role Supabase client into the browser bundle.

export type RequestKind = "access" | "erasure" | "correction" | "portability";
export type RequestStatus = "open" | "in-progress" | "fulfilled" | "refused";

export const REQUEST_KIND_LABELS: Record<RequestKind, string> = {
  access: "Copy of their data",
  erasure: "Erasure",
  correction: "Correction",
  portability: "Portability",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  fulfilled: "Fulfilled",
  refused: "Refused",
};

export interface DataRequest {
  id: string;
  subjectName: string;
  subjectEmail: string;
  caseRef: string;
  referralId?: string;
  kind: RequestKind;
  status: RequestStatus;
  detail: string;
  receivedAt: string;
  dueAt: string;
  /** Whole days until the statutory deadline; negative once overdue. */
  daysLeft: number;
  overdue: boolean;
  outcome: string;
  closedAt?: string;
}
