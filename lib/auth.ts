import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Role } from "@/lib/rbac";

// Session → app user. Reads the authenticated Supabase user and joins their
// `profiles` row (role + scoping). This replaces the demo cookie role-switcher.
// The profile is read with the service client (RLS is default-deny for now);
// it's a server-trusted read that happens only AFTER getUser() authenticates.

export type AccountType = "clinician" | "introducer" | "patient";

export interface SessionProfile {
  profileId: string;
  authUserId: string;
  accountType: AccountType;
  /** Clinician workforce role; "public" for patient/introducer. */
  role: Role;
  name: string;
  email: string | null;
  accountStatus: "pending" | "verified" | "declined";
  gmcNumber?: string;
  hospitalId?: string;
  corridorIds?: string[];
  canManageUsers: boolean;
  canExportAudit: boolean;
  canEditCorridors: boolean;
  patientReferralId?: string;
}

interface ProfileRow {
  id: string;
  auth_user_id: string;
  account_type: AccountType;
  clinician_role: Role | null;
  name: string;
  email: string | null;
  account_status: "pending" | "verified" | "declined";
  gmc_number: string | null;
  hospital_id: string | null;
  corridor_ids: string[] | null;
  can_manage_users: boolean;
  can_export_audit: boolean;
  can_edit_corridors: boolean;
  patient_referral_id: string | null;
}

function mapProfile(row: ProfileRow): SessionProfile {
  return {
    profileId: row.id,
    authUserId: row.auth_user_id,
    accountType: row.account_type,
    role: row.account_type === "clinician" && row.clinician_role ? row.clinician_role : "public",
    name: row.name,
    email: row.email,
    accountStatus: row.account_status,
    gmcNumber: row.gmc_number ?? undefined,
    hospitalId: row.hospital_id ?? undefined,
    corridorIds: row.corridor_ids ?? undefined,
    canManageUsers: row.can_manage_users,
    canExportAudit: row.can_export_audit,
    canEditCorridors: row.can_edit_corridors,
    patientReferralId: row.patient_referral_id ?? undefined,
  };
}

/**
 * The signed-in user's profile, or null if not authenticated / no profile.
 *
 * Never throws. "Who is signed in?" is asked by the login page itself, so a
 * throw here took down the one page a locked-out clinician needs — a missing
 * Supabase env var on the host turned /login into a 500. Failing to *null*
 * instead is fail-closed everywhere: no session means no access, and the
 * protected layouts bounce to login rather than serving anything.
 */
export async function getSessionUser(): Promise<SessionProfile | null> {
  try {
    const supabase = await supabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabaseAdmin()
      .from("profiles")
      .select(
        "id, auth_user_id, account_type, clinician_role, name, email, account_status, gmc_number, hospital_id, corridor_ids, can_manage_users, can_export_audit, can_edit_corridors, patient_referral_id",
      )
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!data) return null;
    return mapProfile(data as unknown as ProfileRow);
  } catch (err) {
    if (isFrameworkSignal(err)) throw err;
    // Loud in the logs, silent in the UI — this is a server misconfiguration or
    // an outage, not something the person at the keyboard can act on.
    console.error("[auth] session read failed:", (err as Error)?.message ?? err);
    return null;
  }
}

/**
 * Next throws through user code to steer rendering: `DYNAMIC_SERVER_USAGE`
 * (cookies() during a static pass), NEXT_REDIRECT, NEXT_NOT_FOUND, and React's
 * postpone for PPR. Swallowing those would let a page prerender as though
 * nobody were signed in, so they have to be rethrown untouched.
 */
function isFrameworkSignal(err: unknown): boolean {
  if (typeof err === "object" && err !== null) {
    if ((err as { $$typeof?: symbol }).$$typeof === Symbol.for("react.postpone")) return true;
    if (typeof (err as { digest?: unknown }).digest === "string") return true;
  }
  return false;
}

/**
 * Where a signed-in account should land after login.
 *
 * Every branch must return somewhere the account can actually STAY: pointing at
 * a page whose layout rejects it produces a redirect loop, because /login sends
 * authenticated users straight back here.
 */
export function landingPath(locale: string, p: SessionProfile): string {
  // An introducer may work while their registration is checked — the workspace
  // lets them draft and blocks only submission — so this branch comes FIRST,
  // before the unverified catch-all below.
  if (p.accountType === "introducer") {
    return p.accountStatus === "declined"
      ? `/${locale}/account-pending?status=declined`
      : `/${locale}/introducer`;
  }
  // Any other unverified account can't enter the app at all — send it directly
  // to the page explaining why, rather than bouncing off the app layout first.
  if (p.accountStatus !== "verified") return `/${locale}/account-pending`;

  if (p.accountType === "patient") return `/${locale}/portal`;
  const home: Record<Role, string> = {
    public: "/",
    referring: "/referring",
    receiving: "/receiving",
    coordinator: "/receiving/coordinator",
    caseManager: "/admin",
    admin: "/admin",
  };
  return `/${locale}${home[p.role] ?? "/"}`;
}

/**
 * True when this session has a verified second factor that has NOT yet been
 * satisfied for this sign-in. Supabase exposes this as assurance levels:
 * `nextLevel` becomes "aal2" once a factor exists, while `currentLevel` stays
 * "aal1" until the code is entered. Used to gate the app behind /mfa/challenge.
 */
export async function needsMfaChallenge(): Promise<boolean> {
  try {
    const supabase = await supabaseServer();
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error || !data) return false;
    return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
  } catch {
    // Never lock a clinician out because the check itself failed.
    return false;
  }
}

/**
 * Page-level authorisation guards.
 *
 * WHY THESE EXIST, given the route-group layouts already guard the same paths.
 *
 * In the App Router a layout and the page beneath it render CONCURRENTLY. The
 * layout's `redirect()` does not prevent the page's own body from running, so a
 * page that fetched with the service client had already produced its HTML by
 * the time the redirect was raised — and Next flushed that HTML as the body of
 * the 307. An anonymous `curl` that ignored the Location header could read it.
 * Measured on 2026-09-27: /admin/users returned 15 registered email addresses
 * and a GMC number, /admin/verification the registrant queue, and /admin/audit
 * the whole hash-chained log, all with no session at all.
 *
 * Role-scoped pages were never exposed this way, because their queries take a
 * SessionProfile and resolve to nothing without one. The exposure is specific
 * to pages that read with the service key on the platform's behalf.
 *
 * So these must be AWAITED BEFORE the first data fetch in the page body. Awaited
 * first, the redirect is raised before any privileged read is issued and there is
 * nothing to leak. A guard placed after a fetch, or run inside Promise.all
 * alongside one, does not close this.
 */
export async function requireOversight(locale: string): Promise<SessionProfile> {
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.accountType !== "clinician" || (user.role !== "admin" && user.role !== "caseManager")) {
    redirect(landingPath(locale, user));
  }
  if (user.accountStatus !== "verified") {
    redirect(`/${locale}/account-pending?status=${user.accountStatus}`);
  }
  return user;
}

/** Oversight AND the named capability, for the pages Vol III §0.4 restricts further. */
export async function requireCapability(
  locale: string,
  capability: "canManageUsers" | "canExportAudit" | "canEditCorridors",
): Promise<SessionProfile> {
  const user = await requireOversight(locale);
  // An admin is not automatically granted these — the flags are the policy, and
  // a caseManager reaching an oversight page is exactly who they exclude.
  if (!user[capability]) redirect(landingPath(locale, user));
  return user;
}
