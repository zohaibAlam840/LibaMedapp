"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { appendAudit } from "@/lib/db/referrals";
import { applyCosign, declineCosign } from "@/lib/db/write";
import { notifyCosignOutcome, notifyNewReferral } from "@/lib/notify";
import { NON_SUBSTITUTION_LABELS, type NonSubstitutionReason } from "@/lib/referral";

// UK-clinician co-sign.
//
// This is the clinical gate on introducer-originated cases, so the checks are
// deliberately explicit rather than inherited: verified + clinician + referring.
// Signing makes the signer the REFERRING CLINICIAN of record, which is exactly
// what they are attesting to — not a rubber stamp on someone else's referral.

export interface CosignState {
  error?: string;
}

const REASONS = Object.keys(NON_SUBSTITUTION_LABELS) as NonSubstitutionReason[];

async function signer() {
  const user = await getSessionUser();
  if (!user || user.accountType !== "clinician") return null;
  if (user.role !== "referring" || user.accountStatus !== "verified") return null;
  return user;
}

export async function cosignCaseAction(
  _prev: CosignState,
  formData: FormData,
): Promise<CosignState> {
  const user = await signer();
  if (!user) {
    return { error: "Only a verified UK referring clinician can co-sign a case." };
  }

  const locale = String(formData.get("locale") ?? "en");
  const ref = String(formData.get("ref") ?? "").trim();
  const reason = String(formData.get("nsReason") ?? "") as NonSubstitutionReason;
  const justification = String(formData.get("nsJustification") ?? "").trim().slice(0, 2000);

  if (!ref) return { error: "Missing case reference." };
  if (!REASONS.includes(reason)) {
    return { error: "Choose the NHS non-substitution reason that applies." };
  }
  if (!justification) return { error: "Say briefly why this referral is appropriate." };
  if (formData.get("attest") !== "on") {
    return { error: "You must confirm you are taking clinical responsibility for this referral." };
  }

  try {
    const done = await applyCosign(ref, user.profileId, reason, justification, user.name);
    if (!done) {
      return { error: "This case is no longer awaiting co-sign — another clinician may have taken it." };
    }

    await appendAudit(ref, {
      actor: user.name,
      event: "Case co-signed",
      detail: `UK clinician co-signed and became the referrer of record · ${NON_SUBSTITUTION_LABELS[reason]}`,
    });
    await appendAudit(ref, {
      actor: user.name,
      event: "NHS non-substitution declared",
      detail: justification,
    });

    revalidatePath(`/${locale}/referring/cosign`);
    revalidatePath(`/${locale}/referring/cases`);
    revalidatePath(`/${locale}/referring`);

    await notifyNewReferral(ref, user.profileId, locale);
    await notifyCosignOutcome(ref, "signed", user.name, "", locale);
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not co-sign the case." };
  }
  // Outside the try: redirect() signals by throwing, and catching it here would
  // turn a successful co-sign into an error message.
  redirect(`/${locale}/referring/cases`);
}

export async function declineCosignAction(
  _prev: CosignState,
  formData: FormData,
): Promise<CosignState> {
  const user = await signer();
  if (!user) {
    return { error: "Only a verified UK referring clinician can review a case." };
  }

  const locale = String(formData.get("locale") ?? "en");
  const ref = String(formData.get("ref") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  if (!ref) return { error: "Missing case reference." };
  if (!note) return { error: "Tell the introducer why, so they can fix it." };

  try {
    const done = await declineCosign(ref, user.profileId, note);
    if (!done) return { error: "This case is no longer awaiting co-sign." };

    await appendAudit(ref, {
      actor: user.name,
      event: "Co-sign declined",
      detail: note,
    });

    revalidatePath(`/${locale}/referring/cosign`);
    await notifyCosignOutcome(ref, "declined", user.name, note, locale);
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not record the decision." };
  }
  redirect(`/${locale}/referring/cosign`);
}
