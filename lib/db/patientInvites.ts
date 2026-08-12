import "server-only";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/db/format";
import { referralIdFromRef } from "@/lib/db/write";

// Patient access is granted per referral, by the referring clinician, via a
// single-use token. A patient never self-registers: their account exists only
// because a clinician linked them to one specific case.

export interface PatientInvite {
  id: string;
  email: string;
  token: string;
  redeemed: boolean;
  redeemedAt?: string;
  expiresAt: string;
  expired: boolean;
}

interface Row {
  id: string;
  email: string;
  token: string;
  redeemed_at: string | null;
  expires_at: string;
}

function map(r: Row): PatientInvite {
  return {
    id: r.id,
    email: r.email,
    token: r.token,
    redeemed: Boolean(r.redeemed_at),
    redeemedAt: r.redeemed_at ? formatDateTime(r.redeemed_at) : undefined,
    expiresAt: formatDateTime(r.expires_at),
    expired: new Date(r.expires_at).getTime() < Date.now(),
  };
}

/** Invitations issued for a referral, newest first. */
export async function getPatientInvites(ref: string): Promise<PatientInvite[]> {
  try {
    const id = await referralIdFromRef(ref);
    if (!id) return [];
    const { data, error } = await supabaseAdmin()
      .from("patient_invitations")
      .select("id, email, token, redeemed_at, expires_at")
      .eq("referral_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    console.warn("[db] getPatientInvites failed:", (e as Error)?.message);
    return [];
  }
}

/** Issue a single-use invitation. Returns the token to hand to the patient. */
export async function createPatientInvite(
  ref: string,
  email: string,
  invitedBy: string,
): Promise<string | null> {
  const id = await referralIdFromRef(ref);
  if (!id) return null;
  const token = randomBytes(24).toString("base64url");
  const { error } = await supabaseAdmin().from("patient_invitations").insert({
    referral_id: id,
    email: email.toLowerCase(),
    token,
    invited_by: invitedBy,
  });
  if (error) throw error;
  return token;
}

export interface InviteLookup {
  invitationId: string;
  referralId: string;
  email: string;
  caseRef: string;
}

/** Validate a token: must exist, be unredeemed, and not expired. */
export async function lookupInvite(token: string): Promise<InviteLookup | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("patient_invitations")
      .select("id, referral_id, email, redeemed_at, expires_at, referrals(ref)")
      .eq("token", token)
      .maybeSingle();
    if (error) throw error;
    const r = data as unknown as
      | {
          id: string;
          referral_id: string;
          email: string;
          redeemed_at: string | null;
          expires_at: string;
          referrals: { ref: string } | null;
        }
      | null;
    if (!r || r.redeemed_at) return null;
    if (new Date(r.expires_at).getTime() < Date.now()) return null;
    return {
      invitationId: r.id,
      referralId: r.referral_id,
      email: r.email,
      caseRef: r.referrals?.ref ?? "",
    };
  } catch (e) {
    console.warn("[db] lookupInvite failed:", (e as Error)?.message);
    return null;
  }
}

/** Mark an invitation used, so the link cannot be replayed. */
export async function markInviteRedeemed(invitationId: string): Promise<void> {
  await supabaseAdmin()
    .from("patient_invitations")
    .update({ redeemed_at: new Date().toISOString() })
    .eq("id", invitationId);
}
