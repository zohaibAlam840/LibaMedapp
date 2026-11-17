import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Partner-supplied profile content — migration 010.
//
// A partner's brochure becomes rows: `hospital_stats` for the numbers it leads
// with, `hospital_sections` for its centres, programmes, services and patient
// support. Both carry `source` (which brochure a claim came from) and
// `published` (an admin can retire a claim without losing it).
//
// Every read fails soft, exactly as lib/db/doctors does: if migration 010
// hasn't been applied the tables are missing, the query errors, and the profile
// renders without these panels rather than 500ing. Partner marketing copy is
// not worth taking a hospital profile down for.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export type SectionKind = "centre" | "programme" | "service" | "support";

export interface HospitalStat {
  value: string;
  label: string;
  source: string;
}

export interface HospitalSection {
  kind: SectionKind;
  title: string;
  body: string;
  items: string[];
  source: string;
}

interface StatRow {
  value: string;
  label: string;
  source: string | null;
}

interface SectionRow {
  kind: SectionKind;
  title: string;
  body: string | null;
  items: string[] | null;
  source: string | null;
}

/** Published "by the numbers" entries, in admin display order. */
export async function getHospitalStats(hospitalId: string): Promise<HospitalStat[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("hospital_stats")
      .select("value, label, source")
      .eq("hospital_id", hospitalId)
      .eq("published", true)
      .order("display_order");
    if (error) throw error;
    return ((data as StatRow[]) ?? []).map((r) => ({
      value: r.value,
      label: r.label,
      source: r.source ?? "",
    }));
  } catch (e) {
    console.warn("[db] hospital_stats failed (run migration 010?):", (e as Error)?.message);
    return [];
  }
}

/** Published narrative sections, in admin display order. */
export async function getHospitalSections(hospitalId: string): Promise<HospitalSection[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("hospital_sections")
      .select("kind, title, body, items, source")
      .eq("hospital_id", hospitalId)
      .eq("published", true)
      .order("display_order");
    if (error) throw error;
    return ((data as SectionRow[]) ?? []).map((r) => ({
      kind: r.kind,
      title: r.title,
      body: r.body ?? "",
      items: r.items ?? [],
      source: r.source ?? "",
    }));
  } catch (e) {
    console.warn("[db] hospital_sections failed (run migration 010?):", (e as Error)?.message);
    return [];
  }
}

/** Sections of one kind — the profile renders each group under its own heading. */
export function sectionsOfKind(
  sections: HospitalSection[],
  kind: SectionKind,
): HospitalSection[] {
  return sections.filter((s) => s.kind === kind);
}
