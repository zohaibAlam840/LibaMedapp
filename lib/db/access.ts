import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCases } from "@/lib/db/referrals";
import { formatDate } from "@/lib/db/format";
import type { SessionProfile } from "@/lib/auth";

// Receiving-access expiry (migration 007).
//
// A receiving hospital's access to a case is meant to lapse once its purpose is
// served. The `access-expired` status has existed since the first schema with
// nothing able to set it, so the window was a promise the platform could not
// keep. This is the record behind it.
//
// Three deliberate limits:
//  · the clock starts when the hospital ACCEPTS the case, not when it is
//    submitted — a case waiting in a queue is not being worked on, and dating
//    it from submission would expire cases nobody had opened.
//  · expiry restricts the RECEIVING side only. The referring clinician holds
//    the record and the admin oversees it; it is the hospital's window that
//    closes.
//  · an expired case is never hidden. A case that silently vanishes from a
//    clinician's list reads as data loss; it stays visible and read-only, with
//    the date and a way to ask for an extension.

export interface AccessWindow {
  ref: string;
  patientRef: string;
  hospital: string;
  corridorLabel: string;
  expiresAt: string;
  expiresAtIso: string;
  /** Negative once it has lapsed. */
  daysLeft: number;
  expired: boolean;
}

function isMissingColumn(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /column .* does not exist|could not find the .* column/i.test(msg);
}

/** True when migration 007 is applied. */
export async function accessTrackingReady(): Promise<boolean> {
  const { error } = await supabaseAdmin().from("referrals").select("access_expires_at").limit(1);
  return !error;
}

function daysBetween(iso: string): number {
  const then = Date.parse(`${iso}T00:00:00Z`);
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.round((then - today) / 86_400_000);
}

/**
 * The access window on one case, or null when none is set.
 *
 * Null is the honest answer for a case that has not been accepted yet, and for
 * every case if migration 007 is missing — never a default date, which would
 * put a deadline on the screen that nothing enforces.
 */
export async function getAccessWindow(ref: string): Promise<AccessWindow | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select("ref, patient_ref, access_expires_at, corridors(label), hospitals(name)")
      .eq("ref", ref)
      .maybeSingle();
    if (error) throw error;
    const row = data as unknown as {
      ref: string;
      patient_ref: string;
      access_expires_at: string | null;
      corridors: { label: string } | null;
      hospitals: { name: string } | null;
    } | null;
    if (!row?.access_expires_at) return null;
    const daysLeft = daysBetween(row.access_expires_at);
    return {
      ref: row.ref,
      patientRef: row.patient_ref,
      hospital: row.hospitals?.name ?? "",
      corridorLabel: row.corridors?.label ?? "",
      expiresAt: formatDate(row.access_expires_at),
      expiresAtIso: row.access_expires_at,
      daysLeft,
      expired: daysLeft < 0,
    };
  } catch (e) {
    if (!isMissingColumn(e)) console.warn("[db] getAccessWindow failed:", (e as Error)?.message);
    return null;
  }
}

/**
 * True when the RECEIVING side may no longer change this case.
 *
 * Fails OPEN on any error or missing migration: a clinician locked out of a
 * live case by a database hiccup is a worse failure than a window that runs a
 * day long, and the expiry is an administrative control rather than a
 * confidentiality boundary — scope already decides who can see the case at all.
 */
export async function receivingAccessExpired(ref: string): Promise<boolean> {
  const w = await getAccessWindow(ref);
  return w?.expired ?? false;
}

/** Start the clock when a hospital accepts a case. No-op if already set. */
export async function startAccessWindow(ref: string): Promise<void> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("referrals")
      .select("id, corridor_id, access_expires_at")
      .eq("ref", ref)
      .maybeSingle();
    if (error) throw error;
    const row = data as { id: string; corridor_id: string; access_expires_at: string | null } | null;
    if (!row || row.access_expires_at) return;

    const { data: corridor } = await sb
      .from("corridors")
      .select("access_window_days")
      .eq("id", row.corridor_id)
      .maybeSingle();
    const days = (corridor as { access_window_days?: number } | null)?.access_window_days ?? 90;
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    await sb
      .from("referrals")
      .update({ access_expires_at: d.toISOString().slice(0, 10) })
      .eq("id", row.id);
  } catch (e) {
    // Non-fatal: never block an acceptance because the window could not be set.
    if (!isMissingColumn(e)) console.warn("[db] startAccessWindow failed:", (e as Error)?.message);
  }
}

/** Push the window out by `days` from today. Returns the new date, or null. */
export async function extendAccessWindow(ref: string, days: number): Promise<string | null> {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  const next = d.toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin()
    .from("referrals")
    .update({ access_expires_at: next, access_extended_at: new Date().toISOString() })
    .eq("ref", ref)
    .select("ref")
    .maybeSingle();
  if (error) throw error;
  return data ? next : null;
}

/**
 * Windows closing soon or already closed, across the caller's own cases.
 *
 * Scoped through getCases, so an admin sees everything and a clinician sees
 * only theirs — this feeds the attention list, which must never widen access.
 */
export async function getExpiringAccess(
  user?: SessionProfile | null,
  withinDays = 14,
): Promise<AccessWindow[]> {
  const cases = await getCases(user);
  if (cases.length === 0) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select("ref, patient_ref, access_expires_at, corridors(label), hospitals(name)")
      .not("access_expires_at", "is", null)
      .in("ref", cases.map((c) => c.ref));
    if (error) throw error;
    const rows =
      (data as unknown as {
        ref: string;
        patient_ref: string;
        access_expires_at: string;
        corridors: { label: string } | null;
        hospitals: { name: string } | null;
      }[] | null) ?? [];

    return rows
      .map((r) => {
        const daysLeft = daysBetween(r.access_expires_at);
        return {
          ref: r.ref,
          patientRef: r.patient_ref,
          hospital: r.hospitals?.name ?? "",
          corridorLabel: r.corridors?.label ?? "",
          expiresAt: formatDate(r.access_expires_at),
          expiresAtIso: r.access_expires_at,
          daysLeft,
          expired: daysLeft < 0,
        };
      })
      .filter((w) => w.daysLeft <= withinDays)
      .sort((a, b) => a.daysLeft - b.daysLeft);
  } catch (e) {
    if (!isMissingColumn(e)) console.warn("[db] getExpiringAccess failed:", (e as Error)?.message);
    return [];
  }
}
