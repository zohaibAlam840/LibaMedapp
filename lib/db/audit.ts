import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/db/format";

// Audit-log reader.
//
// The audit log is the compliance spine: append-only, hash-chained, and written
// by database triggers that block UPDATE and DELETE for everyone including
// service_role. This module only ever READS it.
//
// It follows the same rule as the referral layer — on misconfiguration or query
// error return EMPTY, never sample rows. An audit log that shows invented
// events is worse than one that shows none, because the whole point of the
// screen is that what it shows actually happened.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export interface AuditEvent {
  id: string;
  /** Per-chain sequence assigned by the trigger. */
  seq: number;
  at: string;
  atIso: string;
  actor: string;
  event: string;
  detail: string;
  /** Case reference, or "" for platform/configuration events. */
  caseRef: string;
  corridorId: string;
  corridorLabel: string;
  /** Full sha256 from the chain trigger; "" if the row predates it. */
  hash: string;
}

export interface AuditFilters {
  /** Free text over actor, event, detail, and case reference. */
  q?: string;
  /** Exact event name, as written by the app. */
  event?: string;
  corridor?: string;
  /** Only events in the last N days. */
  days?: number;
  limit?: number;
}

export interface AuditPage {
  events: AuditEvent[];
  /** Rows matching the filters (may exceed `events.length`). */
  matched: number;
  /** Rows in the log overall, ignoring filters. */
  total: number;
  /** True when a filter is actually narrowing the result. */
  filtered: boolean;
}

interface AuditRow {
  id: string;
  seq: number;
  at: string;
  actor: string;
  event: string;
  detail: string | null;
  hash: string | null;
  referrals: { ref: string; corridor_id: string; corridors: { label: string } | null } | null;
}

const COLS = "id, seq, at, actor, event, detail, hash, referrals(ref, corridor_id, corridors(label))";

function map(r: AuditRow): AuditEvent {
  return {
    id: r.id,
    seq: r.seq,
    at: formatDateTime(r.at),
    atIso: r.at,
    actor: r.actor,
    event: r.event,
    detail: r.detail ?? "",
    caseRef: r.referrals?.ref ?? "",
    corridorId: r.referrals?.corridor_id ?? "",
    corridorLabel: r.referrals?.corridors?.label ?? "",
    hash: r.hash ?? "",
  };
}

/** PostgREST `or=` values are comma-separated, so commas in the term break it. */
function escapeTerm(q: string): string {
  return q.replace(/[,()]/g, " ").trim();
}

export async function getAuditEvents(filters: AuditFilters = {}): Promise<AuditPage> {
  const empty: AuditPage = { events: [], matched: 0, total: 0, filtered: false };
  if (!configured()) return empty;

  const limit = filters.limit ?? 50;
  const q = escapeTerm(filters.q ?? "");
  const filtered = Boolean(q || filters.event || filters.corridor || filters.days);

  try {
    const sb = supabaseAdmin();

    // Unfiltered size, so the footer can say "showing 6 of 4" honestly rather
    // than quoting a made-up total.
    const { count: total } = await sb.from("audit_log").select("*", { count: "exact", head: true });

    // A case reference lives on the joined referral, which PostgREST cannot
    // filter inside an `or=`. Resolve it to ids first when the term looks like
    // one, so searching "LM-2026-0142" finds that case's events.
    let refIds: string[] | null = null;
    if (q) {
      const { data: refs } = await sb.from("referrals").select("id").ilike("ref", `%${q}%`);
      const ids = ((refs as { id: string }[] | null) ?? []).map((r) => r.id);
      if (ids.length > 0) refIds = ids;
    }

    let query = sb.from("audit_log").select(COLS, { count: "exact" });

    if (q) {
      const text = `actor.ilike.%${q}%,event.ilike.%${q}%,detail.ilike.%${q}%`;
      query = refIds ? query.or(`${text},referral_id.in.(${refIds.join(",")})`) : query.or(text);
    }
    if (filters.event) query = query.eq("event", filters.event);
    if (filters.corridor) query = query.eq("referrals.corridor_id", filters.corridor);
    if (filters.days) {
      const since = new Date(Date.now() - filters.days * 86_400_000).toISOString();
      query = query.gte("at", since);
    }

    const { data, error, count } = await query
      .order("at", { ascending: false })
      .limit(limit);
    if (error) throw error;

    // An inner-join filter on `referrals` still returns non-case rows with a
    // null join, so drop them here rather than showing admin events under a
    // corridor they have nothing to do with.
    const rows = ((data as unknown as AuditRow[]) ?? []).filter(
      (r) => !filters.corridor || r.referrals?.corridor_id === filters.corridor,
    );

    return {
      events: rows.map(map),
      matched: filters.corridor ? rows.length : (count ?? rows.length),
      total: total ?? 0,
      filtered,
    };
  } catch (e) {
    console.warn("[db] getAuditEvents failed:", (e as Error)?.message);
    return empty;
  }
}

/** Every audit entry for one case, oldest first — the case's own trail. */
export async function getCaseAuditTrail(ref: string): Promise<AuditEvent[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("audit_log")
      .select(COLS)
      .eq("referrals.ref", ref)
      .order("seq", { ascending: true });
    if (error) throw error;
    return ((data as unknown as AuditRow[]) ?? [])
      .filter((r) => r.referrals?.ref === ref)
      .map(map);
  } catch (e) {
    console.warn("[db] getCaseAuditTrail failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * The event names actually present in the log.
 *
 * Derived rather than hardcoded: events are free-text strings written by the
 * server actions, so a fixed list would offer filters that match nothing and
 * omit ones that do.
 */
export async function getAuditEventNames(): Promise<string[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("audit_log")
      .select("event")
      .order("at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    const names = new Set(((data as { event: string }[] | null) ?? []).map((r) => r.event));
    return [...names].sort((a, b) => a.localeCompare(b));
  } catch (e) {
    console.warn("[db] getAuditEventNames failed:", (e as Error)?.message);
    return [];
  }
}

export interface ChainStatus {
  /** Links compared (rows minus one per chain). */
  links: number;
  rows: number;
  /** False when a row's prev_hash does not match the previous row's hash. */
  intact: boolean;
  /** True when the log has rows but no hashes — chain trigger not applied. */
  unhashed: boolean;
}

/**
 * Verify the chain LINKAGE: every row's prev_hash must equal the hash of the
 * row before it in the same chain, and each chain must open with GENESIS.
 *
 * This deliberately does not recompute the sha256 digests. Those are produced
 * by Postgres from its own timestamp rendering, and reproducing that byte for
 * byte in JavaScript would make a mismatch mean "our formatting differs", not
 * "the log was tampered with" — a false alarm on the one screen that must never
 * cry wolf. Recomputation belongs in SQL, next to the trigger that wrote them.
 */
export async function verifyAuditChain(): Promise<ChainStatus> {
  const empty: ChainStatus = { links: 0, rows: 0, intact: true, unhashed: false };
  if (!configured()) return empty;
  try {
    const { data, error } = await supabaseAdmin()
      .from("audit_log")
      .select("referral_id, seq, prev_hash, hash")
      .order("seq", { ascending: true });
    if (error) throw error;

    const rows =
      (data as { referral_id: string | null; seq: number; prev_hash: string | null; hash: string | null }[] | null) ??
      [];
    if (rows.length === 0) return empty;
    if (rows.every((r) => !r.hash)) return { links: 0, rows: rows.length, intact: true, unhashed: true };

    // The trigger chains per referral (`referral_id is not distinct from`), so
    // platform events form their own chain under the null key.
    const chains = new Map<string, typeof rows>();
    for (const r of rows) {
      const key = r.referral_id ?? "__platform__";
      const list = chains.get(key) ?? [];
      list.push(r);
      chains.set(key, list);
    }

    let links = 0;
    let intact = true;
    for (const chain of chains.values()) {
      chain.sort((a, b) => a.seq - b.seq);
      if (chain[0].prev_hash !== "GENESIS") intact = false;
      for (let i = 1; i < chain.length; i++) {
        links++;
        if (chain[i].prev_hash !== chain[i - 1].hash) intact = false;
      }
    }
    return { links, rows: rows.length, intact, unhashed: false };
  } catch (e) {
    console.warn("[db] verifyAuditChain failed:", (e as Error)?.message);
    return empty;
  }
}

/** The whole log as CSV, for the export button (gated on `canExportAudit`). */
export function auditCsv(events: AuditEvent[]): string {
  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const head = ["timestamp", "actor", "event", "detail", "case", "corridor", "hash"];
  const lines = events.map((e) =>
    [e.atIso, e.actor, e.event, e.detail, e.caseRef, e.corridorLabel, e.hash].map(cell).join(","),
  );
  return [head.join(","), ...lines].join("\n");
}
