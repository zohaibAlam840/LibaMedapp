import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCorridors } from "@/lib/db/corridors";
import { formatDate } from "@/lib/db/format";

// Regulatory filings (migration 007).
//
// The question this answers is the one /admin/attention could not: has the
// notification this corridor requires actually been filed, and is it still
// current? Before this, a completed task and an outstanding one looked the
// same, so the page cried wolf on every load and an admin learned to ignore it.
//
// A filing is per CORRIDOR and per AUTHORITY, not per case: one notification
// covers the transfer route, which is how the regulators themselves treat it.

export interface Filing {
  id: string;
  corridorId: string;
  authority: string;
  reference: string;
  filedAt: string;
  filedAtIso: string;
  reviewBy: string;
  reviewByIso: string;
  note: string;
  filedBy: string;
  /** False once `review_by` has passed — the filing needs renewing. */
  current: boolean;
}

/** One corridor's notification duty and whether it has been met. */
export interface CorridorDuty {
  corridorId: string;
  label: string;
  authority: string;
  withinBusinessDays: number;
  cases: number;
  latest: Filing | null;
  state: "not-required" | "satisfied" | "due-for-review" | "outstanding";
}

function isMissingTable(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /relation .* does not exist|could not find the table|schema cache/i.test(msg);
}

/** True when migration 007 is applied. */
export async function regulatoryReady(): Promise<boolean> {
  const { error } = await supabaseAdmin().from("regulatory_filings").select("id").limit(1);
  return !error;
}

interface Row {
  id: string;
  corridor_id: string;
  authority: string;
  reference: string | null;
  filed_at: string;
  review_by: string | null;
  note: string | null;
  filer: { name: string } | null;
}

function map(r: Row): Filing {
  const today = new Date().toISOString().slice(0, 10);
  return {
    id: r.id,
    corridorId: r.corridor_id,
    authority: r.authority,
    reference: r.reference ?? "",
    filedAt: formatDate(r.filed_at),
    filedAtIso: r.filed_at,
    reviewBy: r.review_by ? formatDate(r.review_by) : "",
    reviewByIso: r.review_by ?? "",
    note: r.note ?? "",
    filedBy: r.filer?.name ?? "",
    current: !r.review_by || r.review_by >= today,
  };
}

export async function getFilings(corridorId?: string): Promise<Filing[]> {
  try {
    let q = supabaseAdmin()
      .from("regulatory_filings")
      .select("id, corridor_id, authority, reference, filed_at, review_by, note, filer:filed_by(name)")
      .order("filed_at", { ascending: false });
    if (corridorId) q = q.eq("corridor_id", corridorId);
    const { data, error } = await q;
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    if (!isMissingTable(e)) console.warn("[db] getFilings failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * Every corridor that owes a regulator a notification, with its filing state.
 *
 * `caseCounts` comes from the caller so this stays scope-aware — an admin sees
 * every case, and nothing here should widen that.
 */
export async function getCorridorDuties(caseCounts: Map<string, number>): Promise<CorridorDuty[]> {
  const [corridors, filings] = await Promise.all([getCorridors(), getFilings()]);
  const byCorridor = new Map<string, Filing>();
  for (const f of filings) if (!byCorridor.has(f.corridorId)) byCorridor.set(f.corridorId, f);

  return corridors
    .filter((c) => c.notification?.authority)
    .map<CorridorDuty>((c) => {
      const cases = caseCounts.get(c.id) ?? 0;
      const latest = byCorridor.get(c.id) ?? null;
      // No cases on the route means nothing has been transferred, so nothing is
      // owed yet — a duty that has not arisen is not an outstanding task.
      const state: CorridorDuty["state"] =
        cases === 0 && !latest
          ? "not-required"
          : !latest
            ? "outstanding"
            : latest.current
              ? "satisfied"
              : "due-for-review";
      return {
        corridorId: c.id,
        label: c.label,
        authority: c.notification!.authority,
        withinBusinessDays: c.notification!.withinBusinessDays ?? 5,
        cases,
        latest,
        state,
      };
    });
}

export interface FilingInput {
  corridorId: string;
  authority: string;
  reference?: string | null;
  filedAt: string;
  reviewBy?: string | null;
  note?: string | null;
}

export async function insertFiling(input: FilingInput, filedBy: string): Promise<void> {
  const { error } = await supabaseAdmin().from("regulatory_filings").insert({
    corridor_id: input.corridorId,
    authority: input.authority,
    reference: input.reference || null,
    filed_at: input.filedAt,
    review_by: input.reviewBy || null,
    note: input.note || null,
    filed_by: filedBy,
  });
  if (error) throw error;
}

/**
 * Remove a filing. Kept for genuine mistakes only — a superseded filing should
 * be replaced by recording the new one, so the history stays readable.
 */
export async function deleteFiling(id: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("regulatory_filings")
    .delete()
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
