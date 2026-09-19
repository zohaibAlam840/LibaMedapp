"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { appendAudit } from "@/lib/db/referrals";
import { appendAdminAudit } from "@/lib/db/write";
import { deleteFiling, insertFiling } from "@/lib/db/regulatory";
import { extendAccessWindow, getAccessWindow } from "@/lib/db/access";

// Governance server actions: recording a regulator notification, and extending
// a receiving hospital's access window.
//
// Both are admin-and-above only, re-checked here rather than inherited from the
// page — every export in a "use server" file is a public endpoint. Both write
// to the audit log, because the whole value of recording these is being able to
// show afterwards who said the notice was filed, and when.

export interface GovernanceState {
  error?: string;
  ok?: string;
}

async function admin() {
  const user = await getSessionUser();
  if (!user || user.accountType !== "clinician") return null;
  if (user.role !== "admin" && user.role !== "caseManager") return null;
  if (user.accountStatus !== "verified") return null;
  return user;
}

/** ISO yyyy-mm-dd, or null. Rejects anything a date input would not produce. */
function isoDate(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
}

/** Record that a corridor's regulator notification has been filed. */
export async function recordFilingAction(
  _prev: GovernanceState,
  formData: FormData,
): Promise<GovernanceState> {
  const user = await admin();
  if (!user) return { error: "Only an admin can record a regulatory filing." };

  const locale = String(formData.get("locale") ?? "en");
  const corridorId = String(formData.get("corridorId") ?? "").trim();
  const authority = String(formData.get("authority") ?? "").trim().slice(0, 120);
  const reference = String(formData.get("reference") ?? "").trim().slice(0, 200);
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  const filedAt = isoDate(formData.get("filedAt"));
  const reviewBy = isoDate(formData.get("reviewBy"));

  if (!corridorId || !authority) return { error: "Choose the corridor and name the authority." };
  if (!filedAt) return { error: "Give the date the notification was filed." };
  if (filedAt > new Date().toISOString().slice(0, 10)) {
    return { error: "A filing cannot be dated in the future." };
  }
  if (reviewBy && reviewBy < filedAt) {
    return { error: "The review date must come after the filing date." };
  }

  try {
    await insertFiling({ corridorId, authority, reference, filedAt, reviewBy, note }, user.profileId);
    await appendAdminAudit(
      user.name,
      "Regulatory filing recorded",
      `${authority} · ${corridorId} · filed ${filedAt}${reference ? ` · ref ${reference}` : ""}`,
    );
    revalidatePath(`/${locale}/admin/regulatory`);
    revalidatePath(`/${locale}/admin/attention`);
    return { ok: "Filing recorded." };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not record the filing." };
  }
}

/** Remove a filing entered in error. */
export async function deleteFilingAction(formData: FormData): Promise<void> {
  const user = await admin();
  if (!user) return;
  const locale = String(formData.get("locale") ?? "en");
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  try {
    if (await deleteFiling(id)) {
      await appendAdminAudit(user.name, "Regulatory filing removed", `Filing ${id} deleted`);
      revalidatePath(`/${locale}/admin/regulatory`);
      revalidatePath(`/${locale}/admin/attention`);
    }
  } catch (e) {
    console.warn("[action] deleteFiling failed:", (e as Error)?.message);
  }
}

/**
 * Extend a receiving hospital's access window.
 *
 * Capped at a year in one step: an extension long enough to be indefinite would
 * defeat the control, and a person who needs longer than that should be making
 * the decision consciously, twice.
 */
export async function extendAccessAction(
  _prev: GovernanceState,
  formData: FormData,
): Promise<GovernanceState> {
  const user = await admin();
  if (!user) return { error: "Only an admin can extend a case's access window." };

  const locale = String(formData.get("locale") ?? "en");
  const ref = String(formData.get("ref") ?? "").trim();
  const days = Number(formData.get("days") ?? 0);
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 500);

  if (!ref) return { error: "Missing case reference." };
  if (!Number.isFinite(days) || days < 1 || days > 365) {
    return { error: "Choose an extension between 1 and 365 days." };
  }
  if (!reason) return { error: "Say why the window is being extended." };

  try {
    const current = await getAccessWindow(ref);
    if (!current) {
      return { error: "This case has no access window — it hasn't been accepted by a hospital yet." };
    }
    const next = await extendAccessWindow(ref, days);
    if (!next) return { error: "Could not find that case." };

    await appendAudit(ref, {
      actor: user.name,
      event: "Access window extended",
      detail: `${current.expiresAtIso} → ${next} · ${reason}`,
    });
    revalidatePath(`/${locale}/admin/attention`);
    revalidatePath(`/${locale}/admin/cases/${ref}`);
    return { ok: `Access now runs to ${next}.` };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not extend the window." };
  }
}
