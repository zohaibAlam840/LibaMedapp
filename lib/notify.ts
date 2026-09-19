import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail, siteUrl } from "@/lib/email";
import { defaultPrefs, type NotificationKey } from "@/lib/notificationTypes";

// Case notifications.
//
// Until now the preferences page offered toggles for emails nobody sent. These
// are the sends that make those toggles mean something.
//
// Rules that matter clinically:
//  · the email carries the case REFERENCE and nothing else about the patient —
//    no name, no condition, no summary. An inbox is not a clinical system, and
//    these messages travel to whatever mail provider the clinician uses.
//  · the actor is never notified of their own action.
//  · every send is best-effort. A notification must never roll back the
//    clinical action that triggered it.

interface Recipient {
  profileId: string;
  name: string;
  email: string;
  prefs: Record<string, unknown> | null;
}

function wants(r: Recipient, key: NotificationKey): boolean {
  const prefs = r.prefs && typeof r.prefs === "object" ? (r.prefs as Record<string, unknown>) : {};
  const value = prefs[key];
  return typeof value === "boolean" ? value : defaultPrefs()[key];
}

/**
 * The clinicians on the other side of a case from `actorProfileId`.
 *
 * Referring side = the one who created it. Receiving side = the verified
 * receiving clinicians posted to the case's hospital, which is exactly the set
 * that can already open the case (lib/db/scope.ts) — so this tells nobody about
 * a case they could not already see.
 */
async function counterparts(
  ref: string,
  actorProfileId: string | undefined,
): Promise<{ recipients: Recipient[]; caseRef: string } | null> {
  const sb = supabaseAdmin();
  const { data: referral, error } = await sb
    .from("referrals")
    .select("ref, hospital_id, referring_user_id")
    .eq("ref", ref)
    .maybeSingle();
  if (error || !referral) return null;

  const row = referral as { ref: string; hospital_id: string | null; referring_user_id: string | null };
  const ids = new Set<string>();
  if (row.referring_user_id) ids.add(row.referring_user_id);

  if (row.hospital_id) {
    const { data: receiving } = await sb
      .from("profiles")
      .select("id")
      .eq("hospital_id", row.hospital_id)
      .eq("clinician_role", "receiving")
      .eq("account_status", "verified");
    for (const p of (receiving as { id: string }[] | null) ?? []) ids.add(p.id);
  }

  if (actorProfileId) ids.delete(actorProfileId);
  if (ids.size === 0) return { recipients: [], caseRef: row.ref };

  // notification_prefs arrives with migration 005. Until it does, ask for the
  // columns that definitely exist rather than letting the whole select fail and
  // silently cancel every notification — no stored preference just means the
  // defaults apply, which is "send".
  type PersonRow = {
    id: string;
    name: string;
    email: string | null;
    notification_prefs?: Record<string, unknown> | null;
  };
  let people: PersonRow[] = [];
  const withPrefs = await sb.from("profiles").select("id, name, email, notification_prefs").in("id", [...ids]);
  if (withPrefs.error) {
    const basic = await sb.from("profiles").select("id, name, email").in("id", [...ids]);
    people = (basic.data as PersonRow[] | null) ?? [];
  } else {
    people = (withPrefs.data as PersonRow[] | null) ?? [];
  }

  const recipients = people
    .filter((p) => p.email)
    .map((p) => ({ profileId: p.id, name: p.name, email: p.email!, prefs: p.notification_prefs ?? null }));

  return { recipients, caseRef: row.ref };
}

async function notify(
  ref: string,
  actorProfileId: string | undefined,
  key: NotificationKey,
  build: (caseRef: string) => { subject: string; body: string; label: string; path: string },
): Promise<void> {
  try {
    const result = await counterparts(ref, actorProfileId);
    if (!result || result.recipients.length === 0) return;
    const { subject, body, label, path } = build(result.caseRef);

    await Promise.all(
      result.recipients
        .filter((r) => wants(r, key))
        .map((r) =>
          sendEmail({
            to: r.email,
            subject,
            body,
            action: { label, url: `${siteUrl()}${path}` },
            footnote:
              "You can turn these emails off under Profile & settings → Notification preferences.",
          }),
        ),
    );
  } catch (e) {
    console.warn("[notify] failed (non-fatal):", (e as Error)?.message);
  }
}

/** A new secure message was posted on a case. */
export async function notifyNewMessage(
  ref: string,
  actorProfileId: string | undefined,
  locale = "en",
): Promise<void> {
  await notify(ref, actorProfileId, "newMessage", (caseRef) => ({
    subject: `New message on ${caseRef}`,
    // Deliberately no message body: the content stays inside the platform.
    body: `There is a new secure message on case ${caseRef}.

Sign in to read and reply. The message itself is not included in this email.`,
    label: "Open the case",
    path: `/${locale}/login`,
  }));
}

/** The case moved along the pipeline. */
export async function notifyStatusChange(
  ref: string,
  actorProfileId: string | undefined,
  statusLabel: string,
  locale = "en",
): Promise<void> {
  await notify(ref, actorProfileId, "caseProgress", (caseRef) => ({
    subject: `${caseRef} — ${statusLabel}`,
    body: `Case ${caseRef} has moved to: ${statusLabel}.

Sign in to see what changed.`,
    label: "Open the case",
    path: `/${locale}/login`,
  }));
}

/** A referral has arrived at a hospital. Receiving side only. */
export async function notifyNewReferral(
  ref: string,
  actorProfileId: string | undefined,
  locale = "en",
): Promise<void> {
  await notify(ref, actorProfileId, "caseAssigned", (caseRef) => ({
    subject: `New referral — ${caseRef}`,
    body: `A referral has been sent to your hospital: case ${caseRef}.

Sign in to review it and accept it for review.`,
    label: "Open your queue",
    path: `/${locale}/login`,
  }));
}
