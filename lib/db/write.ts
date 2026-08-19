import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { CaseStatus } from "@/lib/caseStatus";

/** Private Storage bucket holding case documents (created by ensure-storage.mjs). */
export const DOCUMENTS_BUCKET = "case-documents";

// Referral WRITE layer. Every mutation goes through the service client (RLS is
// default-deny for now) and is paired with an immutable audit entry by the
// calling server action. These helpers are thin: they insert/update rows and
// return what the action needs; they never read the session (the action does)
// and never call revalidate (the action does).

/** Resolve a human ref ('LM-2026-0142') to its row uuid, or null. */
export async function referralIdFromRef(ref: string): Promise<string | null> {
  const { data } = await supabaseAdmin()
    .from("referrals")
    .select("id")
    .eq("ref", ref)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

/** Next case reference for the current year, e.g. LM-2026-0143. */
export async function nextReferralRef(): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `LM-${year}-`;
  const { data } = await supabaseAdmin()
    .from("referrals")
    .select("ref")
    .like("ref", `${prefix}%`)
    .order("ref", { ascending: false })
    .limit(1)
    .maybeSingle();
  const last = (data as { ref: string } | null)?.ref;
  const n = last ? Number(last.slice(prefix.length)) : 100;
  return `${prefix}${String((Number.isFinite(n) ? n : 100) + 1).padStart(4, "0")}`;
}

export interface NewMessage {
  direction: "incoming" | "outgoing";
  body: string;
  senderId?: string | null;
  patientVisible?: boolean;
  attachment?: { name: string; size: string } | null;
}

/** Insert a message and bump the referral's updated_at. Returns false if no row. */
export async function insertMessage(ref: string, m: NewMessage): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const sb = supabaseAdmin();
  const { error } = await sb.from("messages").insert({
    referral_id: id,
    sender_id: m.senderId ?? null,
    direction: m.direction,
    body: m.body,
    attachment: m.attachment ?? null,
    patient_visible: m.patientVisible ?? true,
    read: false,
  });
  if (error) throw error;
  await sb.from("referrals").update({ updated_at: new Date().toISOString() }).eq("id", id);
  return true;
}

/** Move a referral to a new status (also stamps updated_at). */
export async function updateReferralStatus(ref: string, status: CaseStatus): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("referrals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("ref", ref)
    .select("ref")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

/** Mark the referral's consent withdrawn and move the case to consent-withdrawn. */
export async function withdrawConsent(ref: string): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const sb = supabaseAdmin();
  const now = new Date().toISOString();
  const { error } = await sb
    .from("patient_consent")
    .update({ withdrawn_at: now })
    .eq("referral_id", id)
    .is("withdrawn_at", null);
  if (error) throw error;
  await sb
    .from("referrals")
    .update({ status: "consent-withdrawn", updated_at: now })
    .eq("id", id);
  return true;
}

export interface NewReferral {
  patientRef: string;
  corridorId: string;
  hospitalId?: string | null;
  specialist?: string | null;
  specialty?: string | null;
  referringUserId?: string | null;
  treatmentScope?: string | null;
  nsReason?: string | null;
  nsJustification?: string | null;
  nsDeclaredBy?: string | null;
  clinicalSummary?: string | null;
  clinicalHistory?: string | null;
  urgency?: string | null;
  patientDob?: string | null;
  patientSex?: string | null;
  consent?: {
    version: string;
    country: string;
    safeguard: string;
    items: { id: string; label: string; agreed: boolean }[];
  };
}

/** Create a referral (+ optional itemised consent). Returns the new ref. */
export async function insertReferral(r: NewReferral): Promise<string> {
  const sb = supabaseAdmin();
  const ref = await nextReferralRef();
  const now = new Date().toISOString();

  // Start the retention clock from the corridor's own period (France 20 years,
  // most others 10) so the deletion schedule is right from day one.
  //
  // Both columns arrive with migration 004. Until it is applied `corridors` has
  // no `retention_years` and `referrals` has no `retention_until`, so we have to
  // detect that and leave the column OUT of the insert entirely — sending it
  // anyway is rejected by PostgREST ("Could not find the 'retention_until'
  // column of 'referrals' in the schema cache") and the referral fails outright.
  //
  // The error is READ rather than caught: supabase-js resolves with
  // { data, error } instead of throwing, so a try/catch here never fires — which
  // is exactly how the missing column used to reach the insert.
  let retentionUntil: string | null = null;
  const { data: corridor, error: retentionErr } = await sb
    .from("corridors")
    .select("retention_years")
    .eq("id", r.corridorId)
    .maybeSingle();
  if (retentionErr) {
    console.warn(
      "[db] insertReferral: retention_years unavailable — apply migration 004. Referral stored without a retention date.",
    );
  } else {
    const years = (corridor as { retention_years?: number } | null)?.retention_years ?? 10;
    const d = new Date();
    d.setUTCFullYear(d.getUTCFullYear() + years);
    retentionUntil = d.toISOString().slice(0, 10);
  }
  const { data, error } = await sb
    .from("referrals")
    .insert({
      ref,
      patient_ref: r.patientRef,
      corridor_id: r.corridorId,
      hospital_id: r.hospitalId ?? null,
      specialist: r.specialist ?? null,
      specialty: r.specialty ?? null,
      status: "submitted",
      referring_user_id: r.referringUserId ?? null,
      treatment_scope: r.treatmentScope ?? null,
      ns_reason: r.nsReason ?? null,
      ns_justification: r.nsJustification ?? null,
      ns_declared_by: r.nsDeclaredBy ?? null,
      ns_declared_at: r.nsReason ? now : null,
      ...(retentionUntil ? { retention_until: retentionUntil } : {}),
      clinical_summary: r.clinicalSummary ?? null,
      clinical_history: r.clinicalHistory ?? null,
      urgency: r.urgency ?? null,
      patient_dob: r.patientDob || null,
      patient_sex: r.patientSex ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  const id = (data as { id: string }).id;

  if (r.consent) {
    const { error: cErr } = await sb.from("patient_consent").insert({
      referral_id: id,
      version: r.consent.version,
      country: r.consent.country,
      safeguard: r.consent.safeguard,
      items: r.consent.items,
    });
    if (cErr) throw cErr;
  }
  return ref;
}

export interface NewDocument {
  name: string;
  type?: string | null;
  size?: string | null;
  storagePath?: string | null;
}

/** Append a non-referral (admin/config) audit entry. Never throws. */
export async function appendAdminAudit(
  actor: string,
  event: string,
  detail?: string,
): Promise<void> {
  try {
    await supabaseAdmin().from("audit_log").insert({ referral_id: null, actor, event, detail: detail ?? null });
  } catch (e) {
    console.warn("[db] appendAdminAudit failed (non-fatal):", (e as Error)?.message);
  }
}

export interface HospitalPatch {
  name?: string;
  city?: string;
  country?: string;
  published?: boolean;
  specialties?: string[];
  intro?: string;
  languages?: string[];
  accreditation?: { name: string; expires: string }[];
  clinicians?: { name: string; role: string }[];
}

/** Update a partner hospital's editable fields. */
export async function updateHospital(id: string, patch: HospitalPatch): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("hospitals")
    .update(patch)
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export interface NewHospital extends HospitalPatch {
  id: string;
  name: string;
  corridorId?: string | null;
}

/** `slug`, or `slug-2`, `slug-3`… when the id is taken. */
export async function uniqueHospitalId(slug: string): Promise<string> {
  const sb = supabaseAdmin();
  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? slug : `${slug}-${n}`;
    const { data } = await sb.from("hospitals").select("id").eq("id", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${slug}-${Date.now()}`;
}

export async function insertHospital(h: NewHospital): Promise<void> {
  const { corridorId, ...rest } = h;
  const { error } = await supabaseAdmin()
    .from("hospitals")
    .insert({ ...rest, corridor_id: corridorId ?? null });
  if (error) throw error;
}

/**
 * Delete a partner hospital.
 *
 * Refused while a referral still points at it: the case's own record of where
 * it was sent must not be broken to tidy up a directory. Unpublishing is the
 * right move there, and the caller says so.
 */
export async function deleteHospital(id: string): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  const { count } = await sb
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", id);
  if ((count ?? 0) > 0) {
    return { ok: false, reason: `${count} case(s) reference this hospital — unpublish it instead.` };
  }
  const { error } = await sb.from("hospitals").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

/** Attach a document row to a referral. */
export async function insertDocument(ref: string, d: NewDocument): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const sb = supabaseAdmin();
  const { error } = await sb.from("documents").insert({
    referral_id: id,
    name: d.name,
    type: d.type ?? null,
    size: d.size ?? null,
    storage_path: d.storagePath ?? null,
  });
  if (error) throw error;
  await sb.from("referrals").update({ updated_at: new Date().toISOString() }).eq("id", id);
  return true;
}
