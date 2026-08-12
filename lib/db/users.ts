import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Role } from "@/lib/rbac";

// Read layer for the admin Users & roles screen. Lists real profiles; falls
// back to an empty list (never throws) when the DB isn't reachable.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  accountType: "clinician" | "introducer" | "patient";
  role: Role | null;
  org: string;
  status: "pending" | "verified" | "declined";
  createdAt: string;
}

interface Row {
  id: string;
  name: string;
  email: string | null;
  account_type: "clinician" | "introducer" | "patient";
  clinician_role: Role | null;
  company: string | null;
  account_status: "pending" | "verified" | "declined";
  created_at: string;
}

export async function getUsers(): Promise<AdminUser[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("profiles")
      .select("id, name, email, account_type, clinician_role, company, account_status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email ?? "",
      accountType: r.account_type,
      role: r.clinician_role,
      org: r.company ?? "",
      status: r.account_status,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.warn("[db] getUsers failed:", (e as Error)?.message);
    return [];
  }
}

export interface PendingAccount {
  id: string;
  name: string;
  email: string;
  accountType: "clinician" | "introducer" | "patient";
  role: Role | null;
  gmcNumber: string;
  fcaNumber: string;
  regStatus: string;
  company: string;
  jobTitle: string;
  status: "pending" | "verified" | "declined";
  createdAt: string;
}

interface PendingRow {
  id: string;
  name: string;
  email: string | null;
  account_type: "clinician" | "introducer" | "patient";
  clinician_role: Role | null;
  gmc_number: string | null;
  fca_number: string | null;
  reg_status: string | null;
  company: string | null;
  job_title: string | null;
  account_status: "pending" | "verified" | "declined";
  created_at: string;
}

/**
 * Registrations awaiting a human check against the GMC / FCA register, plus
 * recently decided ones so an admin can see and reverse a mistake.
 */
export async function getRegistrations(): Promise<PendingAccount[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("profiles")
      .select(
        "id, name, email, account_type, clinician_role, gmc_number, fca_number, reg_status, company, job_title, account_status, created_at",
      )
      .in("account_type", ["clinician", "introducer"])
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as PendingRow[]) ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email ?? "",
      accountType: r.account_type,
      role: r.clinician_role,
      gmcNumber: r.gmc_number ?? "",
      fcaNumber: r.fca_number ?? "",
      regStatus: r.reg_status ?? "",
      company: r.company ?? "",
      jobTitle: r.job_title ?? "",
      status: r.account_status,
      createdAt: r.created_at,
    }));
  } catch (e) {
    console.warn("[db] getRegistrations failed:", (e as Error)?.message);
    return [];
  }
}
