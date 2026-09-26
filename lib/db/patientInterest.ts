import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/db/format";
import { type InterestStatus } from "@/lib/patientInterest";

// Patient enquiries (migration 008).
//
// An enquiry is NOT a case. Nothing in this module reads or writes `referrals`,
// and there is no function that converts one into the other — that is the
// brief, and keeping it true is easier if the capability simply does not exist
// here. The clinician-to-clinician system is untouched by any of this.
//
// `description` will contain health information volunteered by a member of the
// public, so these rows are personal data of the most sensitive kind the
// platform holds outside a case. They carry their own retention date (24
// months, set by the migration) rather than a corridor's 10-20 years.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

/** True when migration 008 hasn't been applied — the form says so rather than losing a submission. */
export function isMissingTable(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /could not find the table|relation .* does not exist/i.test(msg);
}

export interface NewInterest {
  name: string;
  email: string;
  phone?: string | null;
  ageRange?: string | null;
  postcode?: string | null;
  specialtyArea?: string | null;
  description?: string | null;
  destinationPreference?: string | null;
  fundingType?: string | null;
  budgetBand?: string | null;
  timeframe?: string | null;
  consentToContact: boolean;
  campaignId?: string | null;
  leadSource?: string | null;
}

export interface Interest extends Omit<NewInterest, "consentToContact"> {
  id: string;
  consentToContact: boolean;
  status: InterestStatus;
  note: string;
  handledBy: string;
  receivedAt: string;
  receivedIso: string;
}

interface Row {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  age_range: string | null;
  postcode: string | null;
  specialty_area: string | null;
  description: string | null;
  destination_preference: string | null;
  funding_type: string | null;
  budget_band: string | null;
  timeframe: string | null;
  consent_to_contact: boolean;
  campaign_id: string | null;
  lead_source: string | null;
  status: InterestStatus;
  note: string | null;
  created_at: string;
  handler: { name: string } | null;
}

const COLS =
  "id, name, email, phone, age_range, postcode, specialty_area, description, " +
  "destination_preference, funding_type, budget_band, timeframe, consent_to_contact, " +
  "campaign_id, lead_source, status, note, created_at, handler:handled_by(name)";

function map(r: Row): Interest {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    ageRange: r.age_range ?? "",
    postcode: r.postcode ?? "",
    specialtyArea: r.specialty_area ?? "",
    description: r.description ?? "",
    destinationPreference: r.destination_preference ?? "",
    fundingType: r.funding_type ?? "",
    budgetBand: r.budget_band ?? "",
    timeframe: r.timeframe ?? "",
    consentToContact: r.consent_to_contact,
    campaignId: r.campaign_id ?? "",
    leadSource: r.lead_source ?? "",
    status: r.status,
    note: r.note ?? "",
    handledBy: r.handler?.name ?? "",
    receivedAt: formatDateTime(r.created_at),
    receivedIso: r.created_at,
  };
}

/** Store an enquiry. Throws so the action can tell the sender it failed. */
export async function insertInterest(i: NewInterest): Promise<boolean> {
  const { error } = await supabaseAdmin().from("patient_interest").insert({
    name: i.name,
    email: i.email,
    phone: i.phone || null,
    age_range: i.ageRange || null,
    // Normalised so "sw1a 1aa" and "SW1A 1AA" are one postcode when filtering.
    postcode: i.postcode ? i.postcode.toUpperCase().replace(/\s+/g, " ").trim() : null,
    specialty_area: i.specialtyArea || null,
    description: i.description || null,
    destination_preference: i.destinationPreference || null,
    funding_type: i.fundingType || null,
    budget_band: i.budgetBand || null,
    timeframe: i.timeframe || null,
    consent_to_contact: i.consentToContact,
    consented_at: i.consentToContact ? new Date().toISOString() : null,
    campaign_id: i.campaignId || null,
    lead_source: i.leadSource || null,
  });
  if (error) throw error;
  return true;
}

export interface InterestFilters {
  status?: InterestStatus | "all";
  campaign?: string;
}

export async function getInterests(filters: InterestFilters = {}): Promise<Interest[]> {
  if (!configured()) return [];
  try {
    let q = supabaseAdmin().from("patient_interest").select(COLS);
    if (filters.status && filters.status !== "all") q = q.eq("status", filters.status);
    if (filters.campaign) q = q.eq("campaign_id", filters.campaign);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    if (!isMissingTable(e)) console.warn("[db] getInterests failed:", (e as Error)?.message);
    return [];
  }
}

/** True when the table exists, so the admin screen can explain an empty list. */
export async function interestReady(): Promise<boolean> {
  const { error } = await supabaseAdmin().from("patient_interest").select("id").limit(1);
  return !error;
}

/** Campaign ids actually present, for the filter — never a hardcoded list. */
export async function getCampaigns(): Promise<string[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("patient_interest")
      .select("campaign_id")
      .not("campaign_id", "is", null);
    if (error) throw error;
    const seen = new Set((data as { campaign_id: string }[] | null)?.map((r) => r.campaign_id) ?? []);
    return [...seen].sort();
  } catch {
    return [];
  }
}

export async function updateInterest(
  id: string,
  patch: { status?: InterestStatus; note?: string; handledBy?: string },
): Promise<boolean> {
  const { error } = await supabaseAdmin()
    .from("patient_interest")
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.handledBy ? { handled_by: patch.handledBy, handled_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  return true;
}

/** Counts per status, for the filter chips. */
export async function getInterestCounts(): Promise<Record<string, number>> {
  if (!configured()) return {};
  try {
    const { data, error } = await supabaseAdmin().from("patient_interest").select("status");
    if (error) throw error;
    const counts: Record<string, number> = {};
    for (const r of (data as { status: string }[] | null) ?? []) {
      counts[r.status] = (counts[r.status] ?? 0) + 1;
    }
    return counts;
  } catch {
    return {};
  }
}
