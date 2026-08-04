import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { DEMO_HOSPITALS, getDemoHospital, type DemoHospital } from "@/lib/demo";

// Hospital directory data-access layer. Same pattern as lib/db/referrals: reads
// from Supabase when configured, falls back to the demo constants otherwise.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

const HOSPITAL_COLS =
  "id, name, city, country, published, intro, accreditation, specialties, languages, clinicians, corridors(label)";

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
  };
}

export async function getHospitals(): Promise<DemoHospital[]> {
  if (!configured()) return DEMO_HOSPITALS;
  try {
    const { data, error } = await supabaseAdmin().from("hospitals").select(HOSPITAL_COLS).order("name");
    if (error) throw error;
    return ((data as unknown as HospitalRow[]) ?? []).map(mapHospital);
  } catch (e) {
    console.warn("[db] getHospitals → demo fallback:", (e as Error)?.message);
    return DEMO_HOSPITALS;
  }
}

export async function getHospital(id: string): Promise<DemoHospital> {
  if (!configured()) return getDemoHospital(id);
  try {
    const { data, error } = await supabaseAdmin()
      .from("hospitals")
      .select(HOSPITAL_COLS)
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return getDemoHospital(id);
    return mapHospital(data as unknown as HospitalRow);
  } catch (e) {
    console.warn("[db] getHospital → demo fallback:", (e as Error)?.message);
    return getDemoHospital(id);
  }
}
