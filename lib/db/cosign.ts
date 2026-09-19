import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, type SessionProfile } from "@/lib/auth";
import type { CaseStatus } from "@/lib/caseStatus";
import { formatDate, relativeTime } from "@/lib/db/format";

// Introducer origination + UK-clinician co-sign (migration 006).
//
// The gate this enforces: an introducer may WRITE a case but never SEND one.
// A referral only leaves `awaiting-cosign` when a UK-registered referring
// clinician signs it, and signing makes that clinician the referrer of record —
// so from the hospital's side a co-signed case is indistinguishable from one a
// clinician raised directly, which is the point. The introducer's name stays on
// the row and in the audit log.
//
// Lives apart from lib/db/referrals.ts because these are the only two queries
// in the app that deliberately look PAST the case scope: the co-sign queue must
// show a referring clinician cases that are not yet theirs.

export type CosignState = "not-required" | "awaited" | "signed" | "declined";

export interface OriginatedCase {
  ref: string;
  patientRef: string;
  corridorId: string;
  corridorLabel: string;
  hospitalId: string;
  hospital: string;
  specialty: string;
  treatmentScope: string;
  clinicalSummary: string;
  urgency: string;
  status: CaseStatus;
  cosignState: CosignState;
  cosignNote: string;
  cosignedBy: string;
  cosignedAt: string;
  introducer: string;
  introducerProfileId: string;
  updated: string;
}

const COLS =
  "ref, patient_ref, corridor_id, hospital_id, specialty, treatment_scope, clinical_summary, urgency, status, " +
  "cosign_state, cosign_note, cosigned_at, updated_at, introducer_user_id, " +
  "corridors(label), hospitals(name), signer:cosigned_by(name), introducer:introducer_user_id(name)";

interface Row {
  ref: string;
  patient_ref: string;
  corridor_id: string;
  hospital_id: string | null;
  specialty: string | null;
  treatment_scope: string | null;
  clinical_summary: string | null;
  urgency: string | null;
  status: CaseStatus;
  cosign_state: CosignState | null;
  cosign_note: string | null;
  cosigned_at: string | null;
  updated_at: string;
  introducer_user_id: string | null;
  corridors: { label: string } | null;
  hospitals: { name: string } | null;
  signer: { name: string } | null;
  introducer: { name: string } | null;
}

function map(r: Row): OriginatedCase {
  return {
    ref: r.ref,
    patientRef: r.patient_ref,
    corridorId: r.corridor_id,
    corridorLabel: r.corridors?.label ?? "",
    hospitalId: r.hospital_id ?? "",
    hospital: r.hospitals?.name ?? "",
    specialty: r.specialty ?? "",
    treatmentScope: r.treatment_scope ?? "",
    clinicalSummary: r.clinical_summary ?? "",
    urgency: r.urgency ?? "",
    status: r.status,
    cosignState: r.cosign_state ?? "not-required",
    cosignNote: r.cosign_note ?? "",
    cosignedBy: r.signer?.name ?? "",
    cosignedAt: r.cosigned_at ? formatDate(r.cosigned_at) : "",
    introducer: r.introducer?.name ?? "",
    introducerProfileId: r.introducer_user_id ?? "",
    updated: relativeTime(r.updated_at),
  };
}

/** "column does not exist" — migration 006 hasn't been applied. */
function isMissing(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /column .* does not exist|could not find the .* column/i.test(msg);
}

/**
 * True when migration 006 is applied. Every screen in this feature checks it so
 * an un-migrated database explains itself instead of showing an empty list that
 * looks like "you have no cases".
 */
export async function cosignReady(): Promise<boolean> {
  const { error } = await supabaseAdmin().from("referrals").select("cosign_state").limit(1);
  return !error;
}

async function resolve(user?: SessionProfile | null): Promise<SessionProfile | null> {
  return user === undefined ? await getSessionUser() : user;
}

/** Everything this introducer has originated — drafts included. */
export async function getOriginatedCases(user?: SessionProfile | null): Promise<OriginatedCase[]> {
  const u = await resolve(user);
  if (!u || u.accountType !== "introducer") return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select(COLS)
      .eq("introducer_user_id", u.profileId)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    if (!isMissing(e)) console.warn("[db] getOriginatedCases failed:", (e as Error)?.message);
    return [];
  }
}

/** One originated case, or null when it isn't theirs. Never leaks existence. */
export async function getOriginatedCase(
  ref: string,
  user?: SessionProfile | null,
): Promise<OriginatedCase | null> {
  const u = await resolve(user);
  if (!u || u.accountType !== "introducer") return null;
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select(COLS)
      .eq("ref", ref)
      .eq("introducer_user_id", u.profileId)
      .maybeSingle();
    if (error) throw error;
    return data ? map(data as unknown as Row) : null;
  } catch (e) {
    if (!isMissing(e)) console.warn("[db] getOriginatedCase failed:", (e as Error)?.message);
    return null;
  }
}

/**
 * Cases waiting for a UK clinician's signature.
 *
 * Open to any VERIFIED REFERRING clinician, not to a named one: an introducer
 * has no clinician to address a case to, so the queue is shared and whoever
 * signs takes the case. That is a real decision, not an oversight — restricting
 * it to one named clinician would strand every case that clinician is away for.
 */
export async function getCosignQueue(user?: SessionProfile | null): Promise<OriginatedCase[]> {
  const u = await resolve(user);
  if (!u || u.accountType !== "clinician" || u.role !== "referring") return [];
  if (u.accountStatus !== "verified") return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select(COLS)
      .eq("cosign_state", "awaited")
      .eq("status", "awaiting-cosign")
      .order("updated_at", { ascending: true });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    if (!isMissing(e)) console.warn("[db] getCosignQueue failed:", (e as Error)?.message);
    return [];
  }
}

/** One case from the co-sign queue, for review before signing. */
export async function getCosignCase(
  ref: string,
  user?: SessionProfile | null,
): Promise<OriginatedCase | null> {
  const u = await resolve(user);
  if (!u || u.accountType !== "clinician" || u.role !== "referring") return null;
  if (u.accountStatus !== "verified") return null;
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select(COLS)
      .eq("ref", ref)
      .eq("cosign_state", "awaited")
      .maybeSingle();
    if (error) throw error;
    return data ? map(data as unknown as Row) : null;
  } catch (e) {
    if (!isMissing(e)) console.warn("[db] getCosignCase failed:", (e as Error)?.message);
    return null;
  }
}
