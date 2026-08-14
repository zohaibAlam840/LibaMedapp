"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { appendAdminAudit } from "@/lib/db/write";
import { appendAudit } from "@/lib/db/referrals";
import {
  buildSubjectExport,
  insertDataRequest,
  redactReferral,
  updateDataRequest,
} from "@/lib/db/dsar";
import type { RequestKind, RequestStatus } from "@/lib/dsarTypes";

// Data-subject request handling. Every action is admin-gated and audited: a
// regulator asking "who ran this erasure, and when?" must get an answer.

export type DsarState = { ok?: boolean; error?: string; payload?: string };

/** Log a request that has arrived (letter, email, phone). Starts the clock. */
export async function logDataRequestAction(
  _prev: DsarState,
  formData: FormData,
): Promise<DsarState> {
  const user = await getSessionUser();
  if (!user || !user.canExportAudit) {
    return { error: "You don't have permission to handle data requests." };
  }

  const locale = String(formData.get("locale") || "en");
  const subjectName = String(formData.get("subjectName") || "").trim();
  const kind = String(formData.get("kind") || "access") as RequestKind;
  if (!subjectName) return { error: "Enter the name of the person making the request." };

  try {
    await insertDataRequest({
      subjectName,
      subjectEmail: String(formData.get("subjectEmail") || "").trim() || undefined,
      caseRef: String(formData.get("caseRef") || "").trim() || undefined,
      kind,
      detail: String(formData.get("detail") || "").trim() || undefined,
    });
    await appendAdminAudit(
      user.name,
      "Data request logged",
      `${subjectName} · ${kind} · due in 1 month`,
    );
    revalidatePath(`/${locale}/admin/retention`);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not log the request." };
  }
}

/** Move a request through its states and record what was done. */
export async function updateDataRequestAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canExportAudit) return;

  const id = String(formData.get("requestId") || "");
  const locale = String(formData.get("locale") || "en");
  const status = String(formData.get("status") || "") as RequestStatus;
  const outcome = String(formData.get("outcome") || "").trim();
  if (!id || !status) return;

  try {
    await updateDataRequest(id, { status, outcome, handledBy: user.profileId });
    await appendAdminAudit(user.name, `Data request ${status}`, outcome || id);
    revalidatePath(`/${locale}/admin/retention`);
  } catch (e) {
    console.warn("[action] updateDataRequest failed:", (e as Error)?.message);
  }
}

/**
 * Assemble everything held about the subject of a referral, for handing over
 * under Article 15. Returned as JSON text the admin can save; the act of
 * exporting is itself written to the case audit trail.
 */
export async function exportSubjectDataAction(
  _prev: DsarState,
  formData: FormData,
): Promise<DsarState> {
  const user = await getSessionUser();
  if (!user || !user.canExportAudit) {
    return { error: "You don't have permission to export subject data." };
  }

  const referralId = String(formData.get("referralId") || "");
  const caseRef = String(formData.get("caseRef") || "");
  if (!referralId) return { error: "This request isn't linked to a case yet." };

  try {
    const payload = await buildSubjectExport(referralId);
    if (!payload) return { error: "Case not found." };
    if (caseRef) {
      await appendAudit(caseRef, {
        actor: user.name,
        event: "Subject access export",
        detail: "Personal data exported for a data-subject request",
      });
    }
    await appendAdminAudit(user.name, "Subject data exported", caseRef || referralId);
    return { ok: true, payload: JSON.stringify(payload, null, 2) };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not build the export." };
  }
}

/**
 * Erase a patient's personal data. This does NOT delete the audit trail — that
 * chain is the evidence the platform exists to keep, and breaking it would
 * destroy the compliance record for every other case too. The personal data is
 * redacted and the erasure itself is written into the audit trail.
 */
export async function eraseSubjectDataAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || !user.canExportAudit) return;

  const referralId = String(formData.get("referralId") || "");
  const caseRef = String(formData.get("caseRef") || "");
  const locale = String(formData.get("locale") || "en");
  const confirmed = formData.get("confirm") === "on";
  if (!referralId || !confirmed) return;

  try {
    // Write the audit entry BEFORE redacting, so the reason is captured while
    // the case is still intact.
    if (caseRef) {
      await appendAudit(caseRef, {
        actor: user.name,
        event: "Personal data erased",
        detail: "Erasure request fulfilled — personal data redacted, audit chain retained",
      });
    }
    await redactReferral(referralId);
    await appendAdminAudit(user.name, "Personal data erased", caseRef || referralId);
    revalidatePath(`/${locale}/admin/retention`);
    revalidatePath(`/${locale}/admin/cases`);
  } catch (e) {
    console.warn("[action] eraseSubjectData failed:", (e as Error)?.message);
  }
}
