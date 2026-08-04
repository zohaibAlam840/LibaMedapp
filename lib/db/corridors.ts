import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  CORRIDOR_LIST,
  isReferable,
  type CorridorConfig,
  type CorridorId,
  type CorridorSpecialty,
  type NhsAvailability,
  type TransferBasis,
} from "@/lib/corridors";

// Corridor directory — the RUNTIME source of truth. Admins create and edit
// corridors here, so anything user-visible (marketing site, intake wizard,
// consent wording) must read from this layer, not the code registry.
//
// lib/corridors.ts remains the compile-time TYPES plus an offline fallback: if
// the database is unreachable the four launch corridors still render, so the
// marketing site never goes blank.
//
// NOTE: selects use `*` deliberately — the publish columns arrive in migration
// 002, and `*` keeps this working before and after that migration is applied.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export interface CorridorRecord {
  id: CorridorId;
  label: string;
  country: string;
  residency: string;
  transferBasis: TransferBasis;
  safeguard: string;
  notification?: { authority: string; withinBusinessDays: number };
  primaryHospitalId?: string;
  published: boolean;
  displayOrder: number;
  /** Per-specialty NHS availability — drives intake eligibility gating (item 7). */
  specialties: CorridorSpecialty[];
}

interface Row {
  id: string;
  label: string;
  country: string;
  residency: string;
  transfer_basis: TransferBasis;
  safeguard: string;
  notification: { authority?: string; within_business_days?: number } | null;
  primary_hospital_id: string | null;
  published?: boolean;
  display_order?: number;
}

interface SpecialtyRow {
  corridor_id: string;
  name: string;
  nhs: NhsAvailability;
}

function fromConfig(c: CorridorConfig, i: number): CorridorRecord {
  return {
    id: c.id,
    label: c.label,
    country: c.country,
    residency: c.residency,
    transferBasis: c.transferBasis,
    safeguard: c.safeguard,
    notification: c.notification,
    primaryHospitalId: c.hospitalId,
    published: true,
    displayOrder: i,
    specialties: c.specialties,
  };
}

function mapRow(r: Row, i: number, specialties: CorridorSpecialty[]): CorridorRecord {
  const n = r.notification;
  return {
    id: r.id,
    label: r.label,
    country: r.country,
    residency: r.residency,
    transferBasis: r.transfer_basis,
    safeguard: r.safeguard,
    notification:
      n?.authority && n.within_business_days
        ? { authority: n.authority, withinBusinessDays: n.within_business_days }
        : undefined,
    primaryHospitalId: r.primary_hospital_id ?? undefined,
    // Pre-migration the column is absent → treat as published.
    published: r.published ?? true,
    displayOrder: r.display_order ?? i,
    specialties,
  };
}

/** All corridors (admin view), in display order, with their specialties. */
export async function getCorridors(): Promise<CorridorRecord[]> {
  if (!configured()) return CORRIDOR_LIST.map(fromConfig);
  try {
    const sb = supabaseAdmin();
    const [{ data, error }, { data: specs }] = await Promise.all([
      sb.from("corridors").select("*"),
      sb.from("corridor_specialties").select("corridor_id, name, nhs"),
    ]);
    if (error) throw error;
    const rows = (data as unknown as Row[]) ?? [];
    if (rows.length === 0) return CORRIDOR_LIST.map(fromConfig);

    const byCorridor = new Map<string, CorridorSpecialty[]>();
    for (const s of (specs as unknown as SpecialtyRow[]) ?? []) {
      const list = byCorridor.get(s.corridor_id) ?? [];
      list.push({ name: s.name, nhs: s.nhs });
      byCorridor.set(s.corridor_id, list);
    }

    return rows
      .map((r, i) => mapRow(r, i, (byCorridor.get(r.id) ?? []).sort((a, b) => a.name.localeCompare(b.name))))
      .sort((a, b) => a.displayOrder - b.displayOrder || a.label.localeCompare(b.label));
  } catch (e) {
    console.warn("[db] getCorridors → code registry:", (e as Error)?.message);
    return CORRIDOR_LIST.map(fromConfig);
  }
}

/** Corridors the admin has published — what the public site shows. */
export async function getPublishedCorridors(): Promise<CorridorRecord[]> {
  return (await getCorridors()).filter((c) => c.published);
}

/**
 * Corridors a GP may actually refer into: published AND with at least one
 * specialty that isn't routinely available on the NHS (eligibility gating).
 */
export async function getReferableCorridors(): Promise<CorridorRecord[]> {
  return (await getPublishedCorridors()).filter((c) => c.specialties.some(isReferable));
}

export async function getCorridorRecord(id: string): Promise<CorridorRecord | null> {
  return (await getCorridors()).find((c) => c.id === id) ?? null;
}

/** Two-letter code used by the corridor badges (IL / FR / TR / CH). */
export function corridorCode(c: { country: string; id: string }): string {
  const byId: Record<string, string> = {
    israel: "IL",
    france: "FR",
    turkey: "TR",
    switzerland: "CH",
  };
  return byId[c.id] ?? (c.country || c.id).slice(0, 2).toUpperCase();
}

/* ── writes (admin) ─────────────────────────────────────────────────────── */

export interface CorridorInput {
  id: string;
  label: string;
  country: string;
  residency: string;
  transferBasis: TransferBasis;
  safeguard: string;
  notificationAuthority?: string;
  notificationDays?: number;
  primaryHospitalId?: string;
  published: boolean;
}

/** Create a corridor. Throws on duplicate id so the action can report it. */
export async function insertCorridor(input: CorridorInput): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("corridors")
    .insert({
      id: input.id,
      label: input.label,
      country: input.country,
      residency: input.residency,
      transfer_basis: input.transferBasis,
      safeguard: input.safeguard,
      notification:
        input.notificationAuthority && input.notificationDays
          ? {
              authority: input.notificationAuthority,
              within_business_days: input.notificationDays,
            }
          : null,
      primary_hospital_id: input.primaryHospitalId || null,
      published: input.published,
    });
  if (error) throw error;
}

/** Delete a corridor. Refuses when referrals still reference it. */
export async function deleteCorridor(id: string): Promise<{ ok: boolean; reason?: string }> {
  const sb = supabaseAdmin();
  const { count } = await sb
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("corridor_id", id);
  if ((count ?? 0) > 0) {
    return {
      ok: false,
      reason: `${count} referral(s) still use this corridor — hide it instead of deleting.`,
    };
  }
  await sb.from("corridor_specialties").delete().eq("corridor_id", id);
  const { error } = await sb.from("corridors").delete().eq("id", id);
  if (error) return { ok: false, reason: error.message };
  return { ok: true };
}

/** Replace a corridor's specialty list (name + NHS availability). */
export async function setCorridorSpecialties(
  corridorId: string,
  specialties: CorridorSpecialty[],
): Promise<void> {
  const sb = supabaseAdmin();
  await sb.from("corridor_specialties").delete().eq("corridor_id", corridorId);
  if (specialties.length === 0) return;
  const { error } = await sb
    .from("corridor_specialties")
    .insert(specialties.map((s) => ({ corridor_id: corridorId, name: s.name, nhs: s.nhs })));
  if (error) throw error;
}
