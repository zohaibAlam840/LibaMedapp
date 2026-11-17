import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEMO_HOSPITALS, getDemoHospital, type DemoHospital } from "@/lib/demo";

// Hospital directory data-access layer. Same pattern as lib/db/referrals: reads
// from Supabase when configured, falls back to the demo constants otherwise.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

// affiliation … brochures arrive with migration 010 (partner brochure content).
const HOSPITAL_COLS =
  "id, name, city, country, published, intro, accreditation, specialties, languages, clinicians, " +
  "affiliation, locations, about_long, intl_office, brochures, corridors(label)";

// Pre-010 column set. Selecting a column that does not exist makes PostgREST
// fail the whole query, which would blank the directory on any deployment that
// hasn't had migration 010 pasted in yet — so a failed select retries with the
// original columns before giving up.
const HOSPITAL_COLS_BASE =
  "id, name, city, country, published, intro, accreditation, specialties, languages, clinicians, corridors(label)";

// The 010 columns missing is the expected state until the migration is pasted
// in, and the retry below covers it — so say that, rather than logging it like
// a fault once per rendered page.
function logSelectFailure(fn: string, cols: string, e: Error): void {
  if (cols === HOSPITAL_COLS && /column .* does not exist/i.test(e?.message ?? "")) {
    console.info(
      `[db] ${fn}: partner-content columns unavailable (run migration 010) — reading base columns`,
    );
    return;
  }
  console.warn(`[db] ${fn} failed:`, e?.message);
}

interface HospitalRow {
  id: string;
  name: string;
  city: string;
  country: string;
  published: boolean;
  intro: string | null;
  accreditation: DemoHospital["accreditation"] | null;
  specialties: string[] | null;
  languages: string[] | null;
  clinicians: DemoHospital["clinicians"] | null;
  affiliation?: string | null;
  locations?: string[] | null;
  about_long?: string | null;
  intl_office?: DemoHospital["intlOffice"];
  brochures?: DemoHospital["brochures"] | null;
  corridors: { label: string } | null;
}

function mapHospital(r: HospitalRow): DemoHospital {
  return {
    id: r.id,
    name: r.name,
    city: r.city,
    country: r.country,
    published: r.published,
    corridorLabel: r.corridors?.label ?? "",
    intro: r.intro ?? "",
    accreditation: r.accreditation ?? [],
    specialties: r.specialties ?? [],
    languages: r.languages ?? [],
    clinicians: r.clinicians ?? [],
    affiliation: r.affiliation ?? undefined,
    locations: r.locations ?? [],
    aboutLong: r.about_long ?? undefined,
    intlOffice: r.intl_office ?? null,
    brochures: r.brochures ?? [],
  };
}

// The demo constants stand in ONLY when Supabase is not configured at all —
// local preview and the marketing build before any keys exist. Once the
// platform is configured they are never substituted: a query error means the
// directory is unknown, and answering "unknown" with four plausible partner
// hospitals (accreditation dates and named clinicians included) would put
// fiction in front of a clinician choosing where to send a patient.
export async function getHospitals(): Promise<DemoHospital[]> {
  if (!configured()) return DEMO_HOSPITALS;
  for (const cols of [HOSPITAL_COLS, HOSPITAL_COLS_BASE]) {
    try {
      const { data, error } = await supabaseAdmin().from("hospitals").select(cols).order("name");
      if (error) throw error;
      return ((data as unknown as HospitalRow[]) ?? []).map(mapHospital);
    } catch (e) {
      logSelectFailure("getHospitals", cols, e as Error);
    }
  }
  return [];
}

/** Null when the hospital is unknown — callers render notFound(). */
export async function getHospital(id: string): Promise<DemoHospital | null> {
  if (!configured()) return getDemoHospital(id) ?? null;
  for (const cols of [HOSPITAL_COLS, HOSPITAL_COLS_BASE]) {
    try {
      const { data, error } = await supabaseAdmin()
        .from("hospitals")
        .select(cols)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      // Found nothing, and the query itself worked — the hospital is unknown.
      if (!data) return null;
      return mapHospital(data as unknown as HospitalRow);
    } catch (e) {
      logSelectFailure("getHospital", cols, e as Error);
    }
  }
  return null;
}
