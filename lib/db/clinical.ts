import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDate, formatDateTime } from "@/lib/db/format";
import { referralIdFromRef } from "@/lib/db/write";

// Clinical documents that travel back from the receiving team to the referring
// clinician: the treatment plan, the 5-working-day clinical summary (handback),
// and requests for missing information.
//
// Each is stored as its own record rather than a message, because the referring
// clinician needs to retrieve them as documents, and the handback is a
// contractual commitment that has to be provably present.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

/* ── Treatment plan ─────────────────────────────────────────────────────── */

export interface CostItem {
  label: string;
  amount: number;
}

export interface TreatmentPlan {
  proposedCare: string;
  inpatientStay: string;
  currency: string;
  costTotal: number | null;
  costItems: CostItem[];
  earliestStart: string;
  earliestStartRaw: string;
  notes: string;
  status: "draft" | "sent";
  submittedAt?: string;
}

interface PlanRow {
  proposed_care: string;
  inpatient_stay: string | null;
  cost_currency: string;
  cost_total: string | number | null;
  cost_items: CostItem[] | null;
  earliest_start: string | null;
  notes: string | null;
  status: "draft" | "sent";
  submitted_at: string | null;
}

export async function getTreatmentPlan(ref: string): Promise<TreatmentPlan | null> {
  if (!configured()) return null;
  try {
    const id = await referralIdFromRef(ref);
    if (!id) return null;
    const { data, error } = await supabaseAdmin()
      .from("treatment_plans")
      .select("proposed_care, inpatient_stay, cost_currency, cost_total, cost_items, earliest_start, notes, status, submitted_at")
      .eq("referral_id", id)
      .maybeSingle();
    if (error) throw error;
    const r = data as unknown as PlanRow | null;
    if (!r) return null;
    return {
      proposedCare: r.proposed_care,
      inpatientStay: r.inpatient_stay ?? "",
      currency: r.cost_currency,
      costTotal: r.cost_total === null ? null : Number(r.cost_total),
      costItems: r.cost_items ?? [],
      earliestStart: r.earliest_start ? formatDate(r.earliest_start) : "",
      earliestStartRaw: r.earliest_start ?? "",
      notes: r.notes ?? "",
      status: r.status,
      submittedAt: r.submitted_at ? formatDateTime(r.submitted_at) : undefined,
    };
  } catch (e) {
    console.warn("[db] getTreatmentPlan failed:", (e as Error)?.message);
    return null;
  }
}

export interface TreatmentPlanInput {
  proposedCare: string;
  inpatientStay?: string;
  currency?: string;
  costTotal?: number | null;
  costItems?: CostItem[];
  earliestStart?: string | null;
  notes?: string | null;
  status: "draft" | "sent";
  submittedBy: string;
}

/** Create or replace the plan for a referral (one current plan per case). */
export async function upsertTreatmentPlan(ref: string, p: TreatmentPlanInput): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin()
    .from("treatment_plans")
    .upsert(
      {
        referral_id: id,
        proposed_care: p.proposedCare,
        inpatient_stay: p.inpatientStay ?? null,
        cost_currency: p.currency ?? "GBP",
        cost_total: p.costTotal ?? null,
        cost_items: p.costItems ?? [],
        earliest_start: p.earliestStart || null,
        notes: p.notes ?? null,
        status: p.status,
        submitted_by: p.submittedBy,
        submitted_at: p.status === "sent" ? now : null,
        updated_at: now,
      },
      { onConflict: "referral_id" },
    );
  if (error) throw error;
  return true;
}

/* ── Clinical summary (handback) ────────────────────────────────────────── */

export interface ClinicalSummary {
  treatmentPerformed: string;
  followUp: string;
  medicationChanges: string;
  restrictions: string;
  status: "draft" | "sent";
  submittedAt?: string;
}

interface SummaryRow {
  treatment_performed: string;
  follow_up: string | null;
  medication_changes: string | null;
  restrictions: string | null;
  status: "draft" | "sent";
  submitted_at: string | null;
}

export async function getClinicalSummary(ref: string): Promise<ClinicalSummary | null> {
  if (!configured()) return null;
  try {
    const id = await referralIdFromRef(ref);
    if (!id) return null;
    const { data, error } = await supabaseAdmin()
      .from("clinical_summaries")
      .select("treatment_performed, follow_up, medication_changes, restrictions, status, submitted_at")
      .eq("referral_id", id)
      .maybeSingle();
    if (error) throw error;
    const r = data as unknown as SummaryRow | null;
    if (!r) return null;
    return {
      treatmentPerformed: r.treatment_performed,
      followUp: r.follow_up ?? "",
      medicationChanges: r.medication_changes ?? "",
      restrictions: r.restrictions ?? "",
      status: r.status,
      submittedAt: r.submitted_at ? formatDateTime(r.submitted_at) : undefined,
    };
  } catch (e) {
    console.warn("[db] getClinicalSummary failed:", (e as Error)?.message);
    return null;
  }
}

export interface ClinicalSummaryInput {
  treatmentPerformed: string;
  followUp?: string | null;
  medicationChanges?: string | null;
  restrictions?: string | null;
  status: "draft" | "sent";
  submittedBy: string;
}

export async function upsertClinicalSummary(
  ref: string,
  s: ClinicalSummaryInput,
): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin()
    .from("clinical_summaries")
    .upsert(
      {
        referral_id: id,
        treatment_performed: s.treatmentPerformed,
        follow_up: s.followUp ?? null,
        medication_changes: s.medicationChanges ?? null,
        restrictions: s.restrictions ?? null,
        status: s.status,
        submitted_by: s.submittedBy,
        submitted_at: s.status === "sent" ? now : null,
        updated_at: now,
      },
      { onConflict: "referral_id" },
    );
  if (error) throw error;
  return true;
}

/* ── Information requests ───────────────────────────────────────────────── */

export interface InfoRequest {
  id: string;
  items: string[];
  note: string;
  status: "open" | "answered";
  answer: string;
  createdAt: string;
  answeredAt?: string;
}

interface InfoRow {
  id: string;
  items: string[] | null;
  note: string | null;
  status: "open" | "answered";
  answer: string | null;
  created_at: string;
  answered_at: string | null;
}

export async function getInfoRequests(ref: string): Promise<InfoRequest[]> {
  if (!configured()) return [];
  try {
    const id = await referralIdFromRef(ref);
    if (!id) return [];
    const { data, error } = await supabaseAdmin()
      .from("info_requests")
      .select("id, items, note, status, answer, created_at, answered_at")
      .eq("referral_id", id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as InfoRow[]) ?? []).map((r) => ({
      id: r.id,
      items: r.items ?? [],
      note: r.note ?? "",
      status: r.status,
      answer: r.answer ?? "",
      createdAt: formatDateTime(r.created_at),
      answeredAt: r.answered_at ? formatDateTime(r.answered_at) : undefined,
    }));
  } catch (e) {
    console.warn("[db] getInfoRequests failed:", (e as Error)?.message);
    return [];
  }
}

export async function insertInfoRequest(
  ref: string,
  req: { items: string[]; note: string; requestedBy: string },
): Promise<boolean> {
  const id = await referralIdFromRef(ref);
  if (!id) return false;
  const { error } = await supabaseAdmin().from("info_requests").insert({
    referral_id: id,
    items: req.items,
    note: req.note || null,
    requested_by: req.requestedBy,
  });
  if (error) throw error;
  return true;
}

export async function answerInfoRequest(
  requestId: string,
  answer: string,
  answeredBy: string,
): Promise<boolean> {
  const { error } = await supabaseAdmin()
    .from("info_requests")
    .update({
      status: "answered",
      answer,
      answered_by: answeredBy,
      answered_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) throw error;
  return true;
}

/** Count of unanswered requests — surfaced as a prompt to the referring side. */
export async function openInfoRequestCount(ref: string): Promise<number> {
  if (!configured()) return 0;
  try {
    const id = await referralIdFromRef(ref);
    if (!id) return 0;
    const { count } = await supabaseAdmin()
      .from("info_requests")
      .select("*", { count: "exact", head: true })
      .eq("referral_id", id)
      .eq("status", "open");
    return count ?? 0;
  } catch {
    return 0;
  }
}
