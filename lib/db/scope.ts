import "server-only";
import type { SessionProfile } from "@/lib/auth";

// Case visibility rules (C2C spec §0.4 — least privilege). Applied to EVERY
// referral query. Without this a signed-in clinician would see other people's
// patients, so the default is deny: an unknown role, or a clinician with no
// hospital assigned, sees nothing at all.
//
//  · referring   — only cases they created
//  · receiving   — their named queue at their hospital (unassigned cases at that
//                  hospital are visible so a new referral can be picked up)
//  · coordinator — everything at their hospital (logistics, no clinical detail)
//  · caseManager — all cases (oversight)
//  · admin       — all cases
//  · anyone else — nothing

export type CaseScope =
  | { kind: "all" }
  | { kind: "none" }
  | { kind: "referrer"; profileId: string }
  | { kind: "referral"; referralId: string }
  | { kind: "hospital"; hospitalId: string; specialistName?: string };

export function caseScopeFor(user: SessionProfile | null): CaseScope {
  if (!user) return { kind: "none" };

  // A patient is an external data subject scoped to their ONE referral.
  if (user.accountType === "patient") {
    return user.patientReferralId
      ? { kind: "referral", referralId: user.patientReferralId }
      : { kind: "none" };
  }
  if (user.accountType !== "clinician") return { kind: "none" };

  switch (user.role) {
    case "admin":
    case "caseManager":
      return { kind: "all" };
    case "referring":
      return { kind: "referrer", profileId: user.profileId };
    case "receiving":
      return user.hospitalId
        ? { kind: "hospital", hospitalId: user.hospitalId, specialistName: user.name }
        : { kind: "none" };
    case "coordinator":
      return user.hospitalId ? { kind: "hospital", hospitalId: user.hospitalId } : { kind: "none" };
    default:
      return { kind: "none" };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Narrow a supabase referrals query to what this scope may see. Returns null
 * when the scope grants nothing, so callers can skip the round-trip entirely.
 */
export function applyCaseScope<Q extends { eq: any; or: any }>(query: Q, scope: CaseScope): Q | null {
  switch (scope.kind) {
    case "all":
      return query;
    case "none":
      return null;
    case "referrer":
      return query.eq("referring_user_id", scope.profileId) as Q;
    case "referral":
      return query.eq("id", scope.referralId) as Q;
    case "hospital": {
      const scoped = query.eq("hospital_id", scope.hospitalId) as Q;
      // A named specialist sees their own cases plus anything not yet assigned.
      return scope.specialistName
        ? (scoped.or(`specialist.is.null,specialist.eq.${scope.specialistName}`) as Q)
        : scoped;
    }
  }
}
