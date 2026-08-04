import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, type SessionProfile } from "@/lib/auth";
import { applyCaseScope, caseScopeFor } from "@/lib/db/scope";
import type { DemoCase, DemoDocument, DemoMessage } from "@/lib/demo";
import type { ConsentItem, ReferralCompliance } from "@/lib/referral";
import type { CorridorId } from "@/lib/corridors";
import type { CaseStatus } from "@/lib/caseStatus";
import { formatDate, formatDateTime, formatDayTime, relativeTime } from "@/lib/db/format";

// Referral data-access layer.
//
// TWO RULES, both safety-critical in a clinical app:
//  1. Every read is scoped to the signed-in user (lib/db/scope.ts). No caller
//     may fetch a case the session isn't entitled to see.
//  2. On misconfiguration or query error we return EMPTY, never sample data.
//     Rendering demo patients as if they were real is worse than an empty page.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

const CASE_COLS =
  "id, ref, patient_ref, corridor_id, specialist, specialty, status, unread, updated_at, corridors(label, residency), hospitals(name), referrer:referring_user_id(name)";

interface CaseRow {
  id: string;
  ref: string;
  patient_ref: string;
  corridor_id: CorridorId;
  specialist: string | null;
  specialty: string | null;
  status: CaseStatus;
  unread: number | null;
  updated_at: string;
  corridors: { label: string; residency: string } | null;
  hospitals: { name: string } | null;
  referrer: { name: string } | null;
}

function mapCase(r: CaseRow): DemoCase {
  return {
    id: r.ref,
    ref: r.ref,
    patientRef: r.patient_ref,
    corridor: r.corridor_id,
    corridorLabel: r.corridors?.label ?? "",
    residency: r.corridors?.residency ?? "",
    hospital: r.hospitals?.name ?? "",
    specialist: r.specialist ?? "",
    referrer: r.referrer?.name ?? undefined,
    specialty: r.specialty ?? "",
    status: r.status,
    updated: relativeTime(r.updated_at),
    updatedIso: r.updated_at,
    unread: r.unread ?? undefined,
  };
}

/** Resolve the session once per call-site; pass `user` in to avoid re-fetching. */
async function resolveUser(user?: SessionProfile | null): Promise<SessionProfile | null> {
  return user === undefined ? await getSessionUser() : user;
}

/** Cases the signed-in user is entitled to see, newest first. */
export async function getCases(user?: SessionProfile | null): Promise<DemoCase[]> {
  if (!configured()) return [];
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return [];
  try {
    const base = supabaseAdmin().from("referrals").select(CASE_COLS);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return [];
    const { data, error } = await scoped.order("updated_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as CaseRow[]) ?? []).map(mapCase);
  } catch (e) {
    console.warn("[db] getCases failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * One case by reference — or null when it doesn't exist OR the session isn't
 * entitled to it. Callers should `notFound()` on null (never leak existence).
 */
export async function getCase(
  ref: string,
  user?: SessionProfile | null,
): Promise<DemoCase | null> {
  if (!configured()) return null;
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return null;
  try {
    const base = supabaseAdmin().from("referrals").select(CASE_COLS).eq("ref", ref);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return null;
    const { data, error } = await scoped.maybeSingle();
    if (error) throw error;
    return data ? mapCase(data as unknown as CaseRow) : null;
  } catch (e) {
    console.warn("[db] getCase failed:", (e as Error)?.message);
    return null;
  }
}

export interface CaseThread extends DemoCase {
  /** Last message on the thread, for the conversations list. */
  preview: string;
  lastAt: string;
  unreadCount: number;
}

/** Cases that have a message thread, newest activity first (Messages pages). */
export async function getThreads(user?: SessionProfile | null): Promise<CaseThread[]> {
  if (!configured()) return [];
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return [];
  try {
    const base = supabaseAdmin()
      .from("referrals")
      .select(`${CASE_COLS}, messages(body, read, created_at)`);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return [];
    const { data, error } = await scoped.order("updated_at", { ascending: false });
    if (error) throw error;

    const rows = (data as unknown as (CaseRow & { messages: MessageRow[] })[]) ?? [];
    return rows
      .filter((r) => (r.messages ?? []).length > 0)
      .map((r) => {
        const msgs = [...r.messages].sort((a, b) => a.created_at.localeCompare(b.created_at));
        const last = msgs[msgs.length - 1];
        return {
          ...mapCase(r),
          preview: last?.body ?? "Attachment",
          lastAt: relativeTime(last?.created_at ?? r.updated_at),
          unreadCount: msgs.filter((m) => !m.read && m.direction === "incoming").length,
        };
      });
  } catch (e) {
    console.warn("[db] getThreads failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * The single referral a patient account is scoped to. Patients are linked by
 * referral id (not human ref), so this looks up by `profiles.patient_referral_id`.
 */
export async function getPatientCase(user?: SessionProfile | null): Promise<DemoCase | null> {
  if (!configured()) return null;
  const u = await resolveUser(user);
  if (!u || u.accountType !== "patient" || !u.patientReferralId) return null;
  try {
    const { data, error } = await supabaseAdmin()
      .from("referrals")
      .select(CASE_COLS)
      .eq("id", u.patientReferralId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapCase(data as unknown as CaseRow) : null;
  } catch (e) {
    console.warn("[db] getPatientCase failed:", (e as Error)?.message);
    return null;
  }
}

/** True when the session may act on this case (guards write actions). */
export async function canAccessCase(
  ref: string,
  user?: SessionProfile | null,
): Promise<boolean> {
  return (await getCase(ref, user)) !== null;
}

interface ComplianceRow {
  ref: string;
  corridor_id: CorridorId;
  treatment_scope: string | null;
  ns_reason: ReferralCompliance["nonSubstitution"]["reason"] | null;
  ns_justification: string | null;
  ns_declared_by: string | null;
  ns_declared_at: string | null;
  handback_state: ReferralCompliance["handback"]["state"];
  handback_due_by: string | null;
  handback_received_at: string | null;
  patient_consent: {
    version: string;
    country: string;
    safeguard: string;
    items: ConsentItem[];
    captured_at: string;
    withdrawn_at: string | null;
  }[];
  audit_log: {
    seq: number;
    at: string;
    actor: string;
    event: ReferralCompliance["audit"][number]["event"];
    detail: string | null;
    hash: string | null;
  }[];
}

export async function getReferralCompliance(
  ref: string,
  user?: SessionProfile | null,
): Promise<ReferralCompliance | undefined> {
  if (!configured()) return undefined;
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return undefined;
  try {
    const base = supabaseAdmin()
      .from("referrals")
      .select(
        `ref, corridor_id, treatment_scope,
         ns_reason, ns_justification, ns_declared_by, ns_declared_at,
         handback_state, handback_due_by, handback_received_at,
         patient_consent ( version, country, safeguard, items, captured_at, withdrawn_at ),
         audit_log ( seq, at, actor, event, detail, hash )`,
      )
      .eq("ref", ref);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return undefined;
    const { data, error } = await scoped.maybeSingle();
    if (error) throw error;
    const row = data as unknown as ComplianceRow | null;
    // No declaration → no compliance record yet.
    if (!row || !row.ns_reason) return undefined;

    const consent = row.patient_consent?.[0];
    const audit = [...(row.audit_log ?? [])].sort((a, b) => a.seq - b.seq);

    return {
      referralId: row.ref,
      corridor: row.corridor_id,
      noReferrerFee: true,
      nonSubstitution: {
        reason: row.ns_reason,
        justification: row.ns_justification ?? "",
        declaredBy: row.ns_declared_by ?? "",
        declaredAt: formatDateTime(row.ns_declared_at),
      },
      treatmentScope: row.treatment_scope ?? "",
      patientConsent: {
        version: consent?.version ?? "",
        country: consent?.country ?? "",
        safeguard: consent?.safeguard ?? "",
        items: consent?.items ?? [],
        capturedAt: formatDateTime(consent?.captured_at ?? null),
        withdrawnAt: consent?.withdrawn_at ? formatDateTime(consent.withdrawn_at) : undefined,
      },
      handback: {
        state: row.handback_state,
        dueBy: row.handback_due_by ?? "",
        receivedAt: row.handback_received_at ? formatDate(row.handback_received_at) : undefined,
      },
      audit: audit.map((a) => ({
        seq: a.seq,
        at: formatDateTime(a.at),
        actor: a.actor,
        event: a.event,
        detail: a.detail ?? "",
        hash: a.hash ?? undefined,
      })),
    };
  } catch (e) {
    console.warn("[db] getReferralCompliance failed:", (e as Error)?.message);
    return undefined;
  }
}

interface MessageRow {
  direction: "incoming" | "outgoing";
  body: string | null;
  attachment: { name: string; size: string } | null;
  read: boolean;
  patient_visible: boolean;
  created_at: string;
}

export async function getMessages(
  ref: string,
  user?: SessionProfile | null,
): Promise<DemoMessage[]> {
  if (!configured()) return [];
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return [];
  try {
    const base = supabaseAdmin()
      .from("referrals")
      .select("messages(direction, body, attachment, read, patient_visible, created_at)")
      .eq("ref", ref);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return [];
    const { data, error } = await scoped.maybeSingle();
    if (error) throw error;
    const rows = (data as unknown as { messages: MessageRow[] } | null)?.messages ?? [];
    return rows
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((m): DemoMessage => ({
        direction: m.direction,
        text: m.body ?? undefined,
        attachment: m.attachment ?? undefined,
        time: formatDayTime(m.created_at),
        read: m.read,
        patientVisible: m.patient_visible,
      }));
  } catch (e) {
    console.warn("[db] getMessages failed:", (e as Error)?.message);
    return [];
  }
}

interface DocumentRow {
  name: string;
  type: string | null;
  size: string | null;
  storage_path: string | null;
  uploaded_at: string;
}

export async function getDocuments(
  ref: string,
  user?: SessionProfile | null,
): Promise<DemoDocument[]> {
  if (!configured()) return [];
  const scope = caseScopeFor(await resolveUser(user));
  if (scope.kind === "none") return [];
  try {
    const base = supabaseAdmin()
      .from("referrals")
      .select("documents(name, type, size, storage_path, uploaded_at)")
      .eq("ref", ref);
    const scoped = applyCaseScope(base, scope);
    if (!scoped) return [];
    const { data, error } = await scoped.maybeSingle();
    if (error) throw error;
    const rows = (data as unknown as { documents: DocumentRow[] } | null)?.documents ?? [];
    return rows
      .slice()
      .sort((a, b) => a.uploaded_at.localeCompare(b.uploaded_at))
      .map((d): DemoDocument => ({
        name: d.name,
        type: d.type ?? "",
        size: d.size ?? "",
        uploaded: formatDate(d.uploaded_at),
        storagePath: d.storage_path ?? undefined,
      }));
  } catch (e) {
    console.warn("[db] getDocuments failed:", (e as Error)?.message);
    return [];
  }
}

/**
 * Append an immutable audit entry (the trigger fills seq + hash chain). Called
 * from server actions, which have already established the actor. No-op when the
 * DB isn't configured; never throws (audit must not break a user action).
 */
export async function appendAudit(
  ref: string,
  entry: { actor: string; event: string; detail?: string },
): Promise<void> {
  if (!configured()) return;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb.from("referrals").select("id").eq("ref", ref).maybeSingle();
    const id = (data as { id: string } | null)?.id;
    if (!id) return;
    await sb.from("audit_log").insert({
      referral_id: id,
      actor: entry.actor,
      event: entry.event,
      detail: entry.detail ?? null,
    });
  } catch (e) {
    console.warn("[db] appendAudit failed (non-fatal):", (e as Error)?.message);
  }
}
