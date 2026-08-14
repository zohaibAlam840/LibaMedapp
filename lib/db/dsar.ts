import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate, formatDateTime } from "@/lib/db/format";
import type { DataRequest, RequestKind, RequestStatus } from "@/lib/dsarTypes";

export type { DataRequest, RequestKind, RequestStatus } from "@/lib/dsarTypes";
export { REQUEST_KIND_LABELS, REQUEST_STATUS_LABELS } from "@/lib/dsarTypes";

// Data-subject requests (UK GDPR) and record retention.
//
// Two obligations, one screen:
//  · a person can demand a copy of everything held about them, or its erasure,
//    and you must answer within ONE calendar month;
//  · records must be destroyed once the corridor's retention period expires.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

interface Row {
  id: string;
  subject_name: string;
  subject_email: string | null;
  referral_id: string | null;
  kind: RequestKind;
  status: RequestStatus;
  detail: string | null;
  received_at: string;
  due_at: string;
  closed_at: string | null;
  outcome: string | null;
  referrals: { ref: string } | null;
}

function map(r: Row): DataRequest {
  const dueMs = new Date(r.due_at).getTime() - Date.now();
  const daysLeft = Math.ceil(dueMs / 86_400_000);
  const open = r.status === "open" || r.status === "in-progress";
  return {
    id: r.id,
    subjectName: r.subject_name,
    subjectEmail: r.subject_email ?? "",
    caseRef: r.referrals?.ref ?? "",
    referralId: r.referral_id ?? undefined,
    kind: r.kind,
    status: r.status,
    detail: r.detail ?? "",
    receivedAt: formatDate(r.received_at),
    dueAt: formatDate(r.due_at),
    daysLeft,
    overdue: open && daysLeft < 0,
    outcome: r.outcome ?? "",
    closedAt: r.closed_at ? formatDateTime(r.closed_at) : undefined,
  };
}

const COLS =
  "id, subject_name, subject_email, referral_id, kind, status, detail, received_at, due_at, closed_at, outcome, referrals(ref)";

export async function getDataRequests(): Promise<DataRequest[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("data_requests")
      .select(COLS)
      .order("due_at", { ascending: true });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    console.warn("[db] getDataRequests failed:", (e as Error)?.message);
    return [];
  }
}

export async function insertDataRequest(req: {
  subjectName: string;
  subjectEmail?: string;
  caseRef?: string;
  kind: RequestKind;
  detail?: string;
}): Promise<boolean> {
  const sb = supabaseAdmin();
  let referralId: string | null = null;
  if (req.caseRef) {
    const { data } = await sb.from("referrals").select("id").eq("ref", req.caseRef).maybeSingle();
    referralId = (data as { id: string } | null)?.id ?? null;
  }
  const { error } = await sb.from("data_requests").insert({
    subject_name: req.subjectName,
    subject_email: req.subjectEmail || null,
    referral_id: referralId,
    kind: req.kind,
    detail: req.detail || null,
  });
  if (error) throw error;
  return true;
}

export async function updateDataRequest(
  id: string,
  patch: { status?: RequestStatus; outcome?: string; handledBy?: string },
): Promise<boolean> {
  const closing = patch.status === "fulfilled" || patch.status === "refused";
  const { error } = await supabaseAdmin()
    .from("data_requests")
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.outcome !== undefined ? { outcome: patch.outcome } : {}),
      ...(patch.handledBy ? { handled_by: patch.handledBy } : {}),
      ...(closing ? { closed_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/* ── Subject access export ──────────────────────────────────────────────── */

/**
 * Everything held about the subject of one referral, as a plain object ready to
 * hand over. Deliberately assembled here rather than in the UI so the same
 * payload can later be emailed or written to a file without drifting.
 */
export async function buildSubjectExport(referralId: string): Promise<Record<string, unknown> | null> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("referrals")
      .select(
        `ref, patient_ref, status, specialty, specialist, created_at, updated_at,
         clinical_summary, clinical_history, urgency, patient_dob, patient_sex,
         retention_until, redacted_at,
         corridors(label, country, residency, safeguard, transfer_basis),
         hospitals(name, city, country),
         patient_consent(version, country, safeguard, items, captured_at, withdrawn_at),
         documents(name, type, size, uploaded_at),
         messages(direction, body, created_at, patient_visible),
         treatment_plans(proposed_care, cost_currency, cost_total, cost_items, earliest_start, submitted_at),
         clinical_summaries(treatment_performed, follow_up, medication_changes, restrictions, submitted_at),
         audit_log(seq, at, actor, event, detail)`,
      )
      .eq("id", referralId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
      exportedAt: new Date().toISOString(),
      notice:
        "This is the personal data LibaMed holds about the subject of this referral, provided under UK GDPR Article 15.",
      referral: data,
    };
  } catch (e) {
    console.warn("[db] buildSubjectExport failed:", (e as Error)?.message);
    return null;
  }
}

/* ── Retention ──────────────────────────────────────────────────────────── */

export interface RetentionRow {
  ref: string;
  corridorLabel: string;
  retentionUntil: string;
  /** Whole days until deletion is due; negative once due. */
  daysLeft: number;
  due: boolean;
  redacted: boolean;
}

/** Referrals ordered by how soon their retention period expires. */
export async function getRetentionSchedule(): Promise<RetentionRow[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select("ref, retention_until, redacted_at, corridors(label)")
      .order("retention_until", { ascending: true, nullsFirst: false });
    if (error) throw error;
    const rows =
      (data as unknown as {
        ref: string;
        retention_until: string | null;
        redacted_at: string | null;
        corridors: { label: string } | null;
      }[]) ?? [];
    return rows
      .filter((r) => r.retention_until)
      .map((r) => {
        const daysLeft = Math.ceil(
          (new Date(r.retention_until!).getTime() - Date.now()) / 86_400_000,
        );
        return {
          ref: r.ref,
          corridorLabel: r.corridors?.label ?? "",
          retentionUntil: formatDate(r.retention_until),
          daysLeft,
          due: daysLeft <= 0 && !r.redacted_at,
          redacted: Boolean(r.redacted_at),
        };
      });
  } catch (e) {
    console.warn("[db] getRetentionSchedule failed:", (e as Error)?.message);
    return [];
  }
}

/** Corridor retention periods, for the policy table. */
export async function getRetentionPolicy(): Promise<
  { id: string; label: string; country: string; years: number }[]
> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("corridors")
      .select("id, label, country, retention_years")
      .order("label");
    if (error) throw error;
    return (
      (data as unknown as { id: string; label: string; country: string; retention_years: number }[]) ??
      []
    ).map((c) => ({ id: c.id, label: c.label, country: c.country, years: c.retention_years }));
  } catch (e) {
    console.warn("[db] getRetentionPolicy failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * Erase the personal data on a referral while leaving the audit chain intact.
 * Calls the database function so every table is redacted in one transaction,
 * then clears the stored files.
 */
export async function redactReferral(referralId: string): Promise<boolean> {
  const sb = supabaseAdmin();
  // Remove the actual bytes first — the row update clears the paths.
  try {
    const { data: docs } = await sb
      .from("documents")
      .select("storage_path")
      .eq("referral_id", referralId);
    const paths = ((docs as { storage_path: string | null }[]) ?? [])
      .map((d) => d.storage_path)
      .filter((p): p is string => Boolean(p));
    if (paths.length) await sb.storage.from("case-documents").remove(paths);
  } catch (e) {
    console.warn("[db] redact: storage cleanup failed:", (e as Error)?.message);
  }

  const { error } = await sb.rpc("redact_referral", { p_referral_id: referralId });
  if (error) throw error;
  return true;
}
