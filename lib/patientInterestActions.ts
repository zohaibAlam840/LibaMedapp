"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { appendAdminAudit } from "@/lib/db/write";
import { updateInterest } from "@/lib/db/patientInterest";
import { INTEREST_STATUSES, STATUS_LABEL, type InterestStatus } from "@/lib/patientInterest";

// Triage actions for patient enquiries.
//
// Manual only, by design: the brief rules out automation, and there is
// deliberately nothing here that creates a referral from an enquiry. Every
// export is a public endpoint, so the admin check is re-read here rather than
// inherited from the page.

export interface InterestState {
  error?: string;
  ok?: string;
}

async function admin() {
  const user = await getSessionUser();
  if (!user || user.accountType !== "clinician") return null;
  if (!user.canManageUsers) return null;
  return user;
}

export async function updateInterestAction(
  _prev: InterestState,
  formData: FormData,
): Promise<InterestState> {
  const user = await admin();
  if (!user) return { error: "You don't have permission to triage enquiries." };

  const locale = String(formData.get("locale") ?? "en");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as InterestStatus;
  const note = String(formData.get("note") ?? "").trim().slice(0, 2000);
  if (!id) return { error: "Missing enquiry." };
  if (status && !INTEREST_STATUSES.includes(status)) return { error: "Unknown status." };

  try {
    await updateInterest(id, {
      ...(status ? { status } : {}),
      note,
      handledBy: user.profileId,
    });
    // The enquiry itself is not named in the audit detail: it holds health
    // information volunteered by a member of the public, and the audit log is
    // readable by every admin and exportable. The id is enough to trace.
    await appendAdminAudit(
      user.name,
      "Patient enquiry triaged",
      `${id}${status ? ` → ${STATUS_LABEL[status]}` : ""}`,
    );
    revalidatePath(`/${locale}/admin/patient-enquiries`);
    return { ok: "Saved." };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not update the enquiry." };
  }
}
