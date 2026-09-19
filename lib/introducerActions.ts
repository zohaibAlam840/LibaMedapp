"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { appendAudit } from "@/lib/db/referrals";
import {
  insertOriginatedCase,
  updateOriginatedCase,
  submitForCosign,
  type OriginationInput,
} from "@/lib/db/write";

// Introducer-side server actions.
//
// EVERY export here is a public endpoint, so each one re-reads the session and
// re-checks the account type — the layout's guard protects the page, not the
// action behind it.
//
// The rule the whole file exists to enforce: an introducer writes a case and
// submits it FOR CO-SIGN. There is no path from here to a hospital.

export interface OriginationState {
  error?: string;
  ok?: boolean;
}

function readForm(formData: FormData): OriginationInput & { locale: string } {
  const text = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max);
  return {
    locale: text("locale", 8) || "en",
    patientRef: text("patientRef", 64),
    corridorId: text("corridorId", 64),
    hospitalId: text("hospitalId", 64) || null,
    specialty: text("specialty", 120) || null,
    treatmentScope: text("treatmentScope", 2000) || null,
    clinicalSummary: text("clinicalSummary", 5000) || null,
    urgency: text("urgency", 40) || null,
  };
}

function validate(input: OriginationInput): string | null {
  if (!input.patientRef) return "Give the case a patient reference.";
  if (!input.corridorId) return "Choose a corridor.";
  return null;
}

/** Create a draft, or save changes to one. Drafts are visible to nobody else. */
export async function saveDraftAction(
  _prev: OriginationState,
  formData: FormData,
): Promise<OriginationState> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "introducer") {
    return { error: "Only an introducer account can open a case." };
  }

  const { locale, ...input } = readForm(formData);
  const problem = validate(input);
  if (problem) return { error: problem };

  const existing = String(formData.get("ref") ?? "").trim();
  try {
    if (existing) {
      const done = await updateOriginatedCase(existing, user.profileId, input);
      if (!done) return { error: "This case can no longer be edited." };
      await appendAudit(existing, {
        actor: user.name,
        event: "Draft updated",
        detail: "Introducer edited the draft case",
      });
      revalidatePath(`/${locale}/introducer/cases/${existing}`);
      revalidatePath(`/${locale}/introducer`);
      return { ok: true };
    }

    const ref = await insertOriginatedCase(user.profileId, input);
    await appendAudit(ref, {
      actor: user.name,
      event: "Case originated",
      detail: `Draft ${ref} opened by introducer`,
    });
    revalidatePath(`/${locale}/introducer`);
    redirect(`/${locale}/introducer/cases/${ref}`);
  } catch (e) {
    if (typeof (e as { digest?: unknown })?.digest === "string") throw e; // NEXT_REDIRECT
    return { error: (e as Error)?.message ?? "Could not save the case." };
  }
}

/**
 * Submit a draft for co-sign.
 *
 * Verification is checked HERE and nowhere earlier: a pending introducer is
 * deliberately allowed to write a case while their FCA or employer check runs,
 * because that check gates sending, not drafting.
 */
export async function submitForCosignAction(formData: FormData): Promise<void> {
  const user = await getSessionUser();
  if (!user || user.accountType !== "introducer") return;
  if (user.accountStatus !== "verified") return;

  const locale = String(formData.get("locale") ?? "en");
  const ref = String(formData.get("ref") ?? "").trim();
  if (!ref) return;

  const done = await submitForCosign(ref, user.profileId);
  if (!done) return;

  await appendAudit(ref, {
    actor: user.name,
    event: "Submitted for co-sign",
    detail: "Awaiting a UK-registered clinician's signature",
  });
  revalidatePath(`/${locale}/introducer`);
  revalidatePath(`/${locale}/introducer/cases/${ref}`);
  revalidatePath(`/${locale}/referring/cosign`);
}
