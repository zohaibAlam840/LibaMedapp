"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { appendAudit } from "@/lib/db/referrals";
import { updateReferralStatus } from "@/lib/db/write";
import {
  answerInfoRequest,
  insertInfoRequest,
  upsertClinicalSummary,
  upsertTreatmentPlan,
  type CostItem,
} from "@/lib/db/clinical";

// Server actions for the documents that travel back to the referring clinician.
// Sending a plan or a summary also advances the case status, so the pipeline
// and the paperwork can never disagree with each other.

export type ClinicalState = { ok?: boolean; error?: string };

function revalidateCase(locale: string, ref: string) {
  for (const side of ["receiving", "referring"]) {
    revalidatePath(`/${locale}/${side}/cases/${ref}`);
    revalidatePath(`/${locale}/${side}/cases/${ref}/treatment-plan`);
    revalidatePath(`/${locale}/${side}/cases/${ref}/summary`);
    revalidatePath(`/${locale}/${side}/cases/${ref}/request-info`);
    revalidatePath(`/${locale}/${side}/cases`);
    revalidatePath(`/${locale}/${side}`);
  }
  revalidatePath(`/${locale}/portal`);
}

/** Parse the parallel costLabel[] / costAmount[] fields into itemised costs. */
function parseCostItems(formData: FormData): CostItem[] {
  const labels = formData.getAll("costLabel").map(String);
  const amounts = formData.getAll("costAmount").map(String);
  return labels
    .map((label, i) => ({ label: label.trim(), amount: Number(amounts[i]) }))
    .filter((c) => c.label.length > 0 && Number.isFinite(c.amount) && c.amount >= 0);
}

/**
 * Save or send the treatment plan. "Send" moves the case to plan-received so
 * the referring clinician sees it, and writes the audit entry.
 */
export async function saveTreatmentPlanAction(
  _prev: ClinicalState,
  formData: FormData,
): Promise<ClinicalState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };
  if (user.role !== "receiving" && user.role !== "coordinator" && user.role !== "admin") {
    return { error: "Only the receiving team can submit a treatment plan." };
  }

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const send = String(formData.get("intent") || "draft") === "send";
  const proposedCare = String(formData.get("proposedCare") || "").trim();
  if (!ref) return { error: "Case not found." };
  if (send && proposedCare.length < 10) {
    return { error: "Describe the proposed treatment before sending (at least 10 characters)." };
  }

  const costItems = parseCostItems(formData);
  const totalRaw = String(formData.get("costTotal") || "").trim();
  const parsedTotal = totalRaw ? Number(totalRaw.replace(/[^0-9.]/g, "")) : NaN;
  // Fall back to the sum of the itemised lines when no total was typed.
  const costTotal = Number.isFinite(parsedTotal)
    ? parsedTotal
    : costItems.length
      ? costItems.reduce((sum, c) => sum + c.amount, 0)
      : null;

  try {
    const ok = await upsertTreatmentPlan(ref, {
      proposedCare,
      inpatientStay: String(formData.get("inpatientStay") || "") || undefined,
      currency: String(formData.get("currency") || "GBP"),
      costTotal,
      costItems,
      earliestStart: String(formData.get("earliestStart") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      status: send ? "sent" : "draft",
      submittedBy: user.profileId,
    });
    if (!ok) return { error: "Case not found." };

    if (send) {
      await updateReferralStatus(ref, "plan-received");
      await appendAudit(ref, {
        actor: user.name,
        event: "Treatment plan sent",
        detail: costTotal ? `Estimate ${costTotal} ${String(formData.get("currency") || "GBP")}` : undefined,
      });
    } else {
      await appendAudit(ref, { actor: user.name, event: "Treatment plan drafted" });
    }
    revalidateCase(locale, ref);
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not save the plan." };
  }

  if (send) redirect(`/${locale}/receiving/cases/${ref}`);
  return { ok: true };
}

/**
 * Save or return the clinical summary — the 5-working-day handback to UK care
 * (NHS safeguard #3). Returning it moves the case to summary-returned.
 */
export async function saveClinicalSummaryAction(
  _prev: ClinicalState,
  formData: FormData,
): Promise<ClinicalState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };
  if (user.role !== "receiving" && user.role !== "coordinator" && user.role !== "admin") {
    return { error: "Only the receiving team can return a clinical summary." };
  }

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const send = String(formData.get("intent") || "draft") === "send";
  const treatmentPerformed = String(formData.get("treatmentPerformed") || "").trim();
  if (!ref) return { error: "Case not found." };
  if (send && treatmentPerformed.length < 10) {
    return { error: "Describe the treatment performed before returning the summary." };
  }

  try {
    const ok = await upsertClinicalSummary(ref, {
      treatmentPerformed,
      followUp: String(formData.get("followUp") || "") || null,
      medicationChanges: String(formData.get("medicationChanges") || "") || null,
      restrictions: String(formData.get("restrictions") || "") || null,
      status: send ? "sent" : "draft",
      submittedBy: user.profileId,
    });
    if (!ok) return { error: "Case not found." };

    if (send) {
      await updateReferralStatus(ref, "summary-returned");
      await appendAudit(ref, {
        actor: user.name,
        event: "Clinical summary returned",
        detail: "Structured handback delivered to the referring clinician",
      });
    } else {
      await appendAudit(ref, { actor: user.name, event: "Clinical summary drafted" });
    }
    revalidateCase(locale, ref);
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not save the summary." };
  }

  if (send) redirect(`/${locale}/receiving/cases/${ref}`);
  return { ok: true };
}

/** Ask the referring clinician for missing records. */
export async function requestInfoAction(
  _prev: ClinicalState,
  formData: FormData,
): Promise<ClinicalState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const items = formData.getAll("items").map(String).filter(Boolean);
  const note = String(formData.get("note") || "").trim();
  if (!ref) return { error: "Case not found." };
  if (items.length === 0 && !note) {
    return { error: "Choose what you need, or write a note." };
  }

  try {
    const ok = await insertInfoRequest(ref, { items, note, requestedBy: user.profileId });
    if (!ok) return { error: "Case not found." };
    await appendAudit(ref, {
      actor: user.name,
      event: "Information requested",
      detail: items.length ? items.join(", ") : note.slice(0, 120),
    });
    revalidateCase(locale, ref);
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not send the request." };
  }

  redirect(`/${locale}/receiving/cases/${ref}`);
}

/** The referring clinician answers an outstanding request. */
export async function answerInfoRequestAction(
  _prev: ClinicalState,
  formData: FormData,
): Promise<ClinicalState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const requestId = String(formData.get("requestId") || "");
  const answer = String(formData.get("answer") || "").trim();
  if (!requestId || !answer) return { error: "Write a response before sending." };

  try {
    await answerInfoRequest(requestId, answer, user.profileId);
    await appendAudit(ref, {
      actor: user.name,
      event: "Information provided",
      detail: answer.length > 120 ? `${answer.slice(0, 117)}…` : answer,
    });
    revalidateCase(locale, ref);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not send your response." };
  }
}
