import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";

// Named clinicians ("doctors") as first-class rows — migration 002.
//
// Lifecycle: a hospital coordinator submits a doctor (status "pending"); an
// admin approves them (visible on the hospital's public page) and may FEATURE a
// subset onto the public home page. Referrals only ever route to approved names.
//
// Every read fails soft: if migration 002 hasn't been applied the table is
// missing, the query errors, and we return an empty list rather than breaking
// the page.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export type DoctorStatus = "pending" | "approved" | "rejected";

export interface Doctor {
  id: string;
  hospitalId: string | null;
  hospitalName: string;
  name: string;
  role: string;
  bio: string;
  languages: string[];
  photoUrl?: string;
  status: DoctorStatus;
  featured: boolean;
  displayOrder: number;
}

interface Row {
  id: string;
  hospital_id: string | null;
  name: string;
  role: string | null;
  bio: string | null;
  languages: string[] | null;
  photo_url: string | null;
  status: DoctorStatus;
  featured: boolean;
  display_order: number;
  hospitals: { name: string } | null;
}

const COLS =
  "id, hospital_id, name, role, bio, languages, photo_url, status, featured, display_order, hospitals(name)";

function mapDoctor(r: Row): Doctor {
  return {
    id: r.id,
    hospitalId: r.hospital_id,
    hospitalName: r.hospitals?.name ?? "",
    name: r.name,
    role: r.role ?? "",
    bio: r.bio ?? "",
    languages: r.languages ?? [],
    photoUrl: r.photo_url ?? undefined,
    status: r.status,
    featured: r.featured,
    displayOrder: r.display_order,
  };
}

async function query(build: (q: ReturnType<typeof baseQuery>) => unknown): Promise<Doctor[]> {
  if (!configured()) return [];
  try {
    const { data, error } = (await build(baseQuery())) as {
      data: unknown;
      error: { message: string } | null;
    };
    if (error) throw error;
    return ((data as Row[]) ?? []).map(mapDoctor);
  } catch (e) {
    console.warn("[db] doctors query failed (run migration 002?):", (e as Error)?.message);
    return [];
  }
}

function baseQuery() {
  return supabaseAdmin().from("doctors").select(COLS);
}

/** Every doctor, for the admin directory. */
export async function getAllDoctors(): Promise<Doctor[]> {
  return query((q) => q.order("display_order").order("name"));
}

/** Approved doctors at one hospital — the public hospital page. */
export async function getHospitalDoctors(hospitalId: string): Promise<Doctor[]> {
  return query((q) =>
    q.eq("hospital_id", hospitalId).eq("status", "approved").order("display_order").order("name"),
  );
}

/** Approved + featured — the public home page highlight strip. */
export async function getFeaturedDoctors(limit = 6): Promise<Doctor[]> {
  const rows = await query((q) =>
    q.eq("status", "approved").eq("featured", true).order("display_order").order("name"),
  );
  return rows.slice(0, limit);
}

/** Doctors at a hospital regardless of status — coordinator's own list. */
export async function getDoctorsForHospital(hospitalId: string): Promise<Doctor[]> {
  return query((q) => q.eq("hospital_id", hospitalId).order("display_order").order("name"));
}
