import "server-only";
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

/** The signed-in user's profile, or null if not authenticated / no profile. */
export async function getSessionUser(): Promise<SessionProfile | null> {
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
}

/**
 * Where a signed-in account should land after login.
 *
 * Every branch must return somewhere the account can actually STAY: pointing at
 * a page whose layout rejects it produces a redirect loop, because /login sends
 * authenticated users straight back here.
 */
export function landingPath(locale: string, p: SessionProfile): string {
  // An unverified account can't enter the app at all — send it directly to the
  // page explaining why, rather than bouncing off the app layout first.
  if (p.accountStatus !== "verified") return `/${locale}/account-pending`;

  if (p.accountType === "patient") return `/${locale}/portal`;
  // Introducers have no workspace yet, and the (app) area rejects non-clinicians.
  if (p.accountType === "introducer") return `/${locale}/account-pending`;
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
