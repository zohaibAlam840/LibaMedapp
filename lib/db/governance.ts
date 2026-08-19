import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getCases } from "@/lib/db/referrals";
import { getCorridors } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";
import { getRegistrations } from "@/lib/db/users";
import { formatDate } from "@/lib/db/format";
import type { SessionProfile } from "@/lib/auth";

// Governance figures for the admin dashboard and the attention list.
//
// Every number here is counted from live rows. Where the platform does not yet
// record something (whether a KVKK notification was actually filed, when a
// receiving clinician's access lapses) this module exposes what IS known — the
// cases that require a notification, say — and the UI states it that way. It
// never fills the gap with an invented figure, because an admin acting on a
// governance dashboard has no way to tell a real overdue task from a mock one.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export interface CorridorLoad {
  id: string;
  label: string;
  residency: string;
  cases: number;
  /** Set only for corridors whose transfer basis requires a regulator notice. */
  notificationAuthority?: string;
  notificationDays?: number;
}

export interface AccreditationExpiry {
  hospitalId: string;
  hospital: string;
  /** Accreditation body, e.g. "JCI". */
  name: string;
  /** As stored, e.g. "Sep 2026". */
  expires: string;
  monthsLeft: number;
}

export interface ConsentRecord {
  id: string;
  caseRef: string;
  patientRef: string;
  corridorId: string;
  corridorLabel: string;
  version: string;
  country: string;
  /** Items agreed / items presented. */
  agreed: number;
  items: number;
  capturedAt: string;
  withdrawnAt: string;
  status: "active" | "withdrawn";
}

export interface GovernanceSummary {
  corridors: CorridorLoad[];
  totalCases: number;
  /** Cases with a consent record captured. */
  consentCaptured: number;
  consentWithdrawn: number;
  /** Cases sitting in a corridor that requires a regulator notification. */
  casesNeedingNotification: number;
  notificationAuthorities: string[];
  pendingVerifications: number;
  accreditationExpiring: AccreditationExpiry[];
}

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** "Sep 2026" → whole months from now; null when the string isn't a date. */
function monthsUntil(expires: string): number | null {
  const m = /^([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(expires.trim());
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].toLowerCase());
  if (month < 0) return null;
  const now = new Date();
  return (Number(m[2]) - now.getUTCFullYear()) * 12 + (month - now.getUTCMonth());
}

/**
 * Badge state for one accreditation, from its stored expiry.
 *
 * "Expiring" is anything inside three months, matching the badge's own
 * documented rule. Unparseable dates read as valid rather than alarming — an
 * expiry we cannot understand is not evidence that it lapsed.
 */
export function accreditationState(expires: string): "valid" | "expiring" | "expired" {
  const months = monthsUntil(expires);
  if (months === null) return "valid";
  if (months < 0) return "expired";
  return months <= 3 ? "expiring" : "valid";
}

/** Accreditations expiring within `withinMonths` (or already lapsed). */
export async function getAccreditationExpiries(withinMonths = 6): Promise<AccreditationExpiry[]> {
  const hospitals = await getHospitals();
  const rows: AccreditationExpiry[] = [];
  for (const h of hospitals) {
    for (const a of h.accreditation) {
      const monthsLeft = monthsUntil(a.expires);
      if (monthsLeft === null || monthsLeft > withinMonths) continue;
      rows.push({
        hospitalId: h.id,
        hospital: h.name,
        name: a.name,
        expires: a.expires,
        monthsLeft,
      });
    }
  }
  return rows.sort((a, b) => a.monthsLeft - b.monthsLeft);
}

/**
 * Consent records for the cases the signed-in user may see.
 *
 * Version, country, item count and capture date all come from the stored
 * record — the wording shown to a patient is evidence, so none of it may be
 * defaulted or assumed when a field is absent.
 */
export async function getConsentRecords(user?: SessionProfile | null): Promise<ConsentRecord[]> {
  if (!configured()) return [];
  const cases = await getCases(user);
  if (cases.length === 0) return [];
  const byRef = new Map(cases.map((c) => [c.ref, c]));
  try {
    const { data, error } = await supabaseAdmin()
      .from("patient_consent")
      .select("id, version, country, items, captured_at, withdrawn_at, referrals!inner(ref)")
      .order("captured_at", { ascending: false });
    if (error) throw error;
    const rows =
      (data as unknown as {
        id: string;
        version: string | null;
        country: string | null;
        items: { agreed?: boolean }[] | null;
        captured_at: string;
        withdrawn_at: string | null;
        referrals: { ref: string } | null;
      }[] | null) ?? [];

    return rows
      .filter((r) => r.referrals && byRef.has(r.referrals.ref))
      .map((r) => {
        const c = byRef.get(r.referrals!.ref)!;
        const items = r.items ?? [];
        return {
          id: r.id,
          caseRef: c.ref,
          patientRef: c.patientRef,
          corridorId: c.corridor,
          corridorLabel: c.corridorLabel,
          version: r.version ?? "",
          country: r.country ?? "",
          agreed: items.filter((i) => i.agreed).length,
          items: items.length,
          capturedAt: formatDate(r.captured_at),
          withdrawnAt: r.withdrawn_at ? formatDate(r.withdrawn_at) : "",
          status: r.withdrawn_at ? ("withdrawn" as const) : ("active" as const),
        };
      });
  } catch (e) {
    console.warn("[db] getConsentRecords failed:", (e as Error)?.message);
    return [];
  }
}

export async function getGovernanceSummary(user?: SessionProfile | null): Promise<GovernanceSummary> {
  const [cases, corridorRecords, registrations, accreditationExpiring] = await Promise.all([
    getCases(user),
    getCorridors(),
    getRegistrations(),
    getAccreditationExpiries(),
  ]);

  const counts = new Map<string, number>();
  for (const c of cases) counts.set(c.corridor, (counts.get(c.corridor) ?? 0) + 1);

  const corridors: CorridorLoad[] = corridorRecords.map((c) => ({
    id: c.id,
    label: c.label,
    residency: c.residency,
    cases: counts.get(c.id) ?? 0,
    notificationAuthority: c.notification?.authority,
    notificationDays: c.notification?.withinBusinessDays,
  }));

  const notifying = new Set(corridors.filter((c) => c.notificationAuthority).map((c) => c.id));
  const casesNeedingNotification = cases.filter((c) => notifying.has(c.corridor)).length;

  // Consent is counted from the consent table itself rather than inferred from
  // case status — a case can reach any status with consent later withdrawn.
  let consentCaptured = 0;
  let consentWithdrawn = 0;
  if (configured() && cases.length > 0) {
    try {
      const { data, error } = await supabaseAdmin()
        .from("patient_consent")
        .select("referral_id, withdrawn_at, referrals!inner(ref)");
      if (error) throw error;
      const rows = (data as { referral_id: string; withdrawn_at: string | null }[] | null) ?? [];
      const seen = new Set<string>();
      for (const r of rows) {
        if (seen.has(r.referral_id)) continue;
        seen.add(r.referral_id);
        if (r.withdrawn_at) consentWithdrawn++;
        else consentCaptured++;
      }
    } catch (e) {
      console.warn("[db] getGovernanceSummary consent count failed:", (e as Error)?.message);
    }
  }

  return {
    corridors,
    totalCases: cases.length,
    consentCaptured,
    consentWithdrawn,
    casesNeedingNotification,
    notificationAuthorities: [
      ...new Set(
        corridors
          .filter((c) => c.notificationAuthority && (counts.get(c.id) ?? 0) > 0)
          .map((c) => c.notificationAuthority!),
      ),
    ],
    pendingVerifications: registrations.filter((r) => r.status === "pending").length,
    accreditationExpiring,
  };
}
