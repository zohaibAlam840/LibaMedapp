"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";
import { appendAudit, canAccessCase } from "@/lib/db/referrals";
import {
  createPatientInvite,
  lookupInvite,
  markInviteRedeemed,
} from "@/lib/db/patientInvites";
import { sendEmail, siteUrl } from "@/lib/email";

// Patient access: the referring clinician issues a single-use invitation, and
// redeeming it creates an account bound to that ONE referral. The patient never
// self-registers, and the link cannot be replayed.

export type InviteState = {
  ok?: boolean;
  error?: string;
  link?: string;
  email?: string;
  /** Whether the invitation email actually went out. */
  emailed?: boolean;
};

/** Issue an invitation for the patient on this case. */
export async function invitePatientAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };
  // Treating clinician only. Admins were allowed here as a support escape
  // hatch; they are not now. Portal access hands someone sight of a clinical
  // record, and the person who authorises that should be the one with the
  // clinical relationship and the consent — not a compliance account. It also
  // keeps the case's audit entry honest about who granted the access.
  if (user.role !== "referring") {
    return { error: "Only the referring clinician on this case can invite the patient." };
  }

  const ref = String(formData.get("ref") || "");
  const locale = String(formData.get("locale") || "en");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!ref) return { error: "Case not found." };
  if (!email.includes("@")) return { error: "Enter the patient's email address." };
  // Being A referring clinician was the only check; it did not establish this
  // was YOUR case. Without this, any referring account could issue portal
  // access to a stranger's referral by posting its reference.
  if (!(await canAccessCase(ref, user))) return { error: "Case not found." };

  try {
    const token = await createPatientInvite(ref, email, user.profileId);
    if (!token) return { error: "Case not found." };
    await appendAudit(ref, {
      actor: user.name,
      event: "Patient invited",
      detail: `Read-only portal access issued to ${email}`,
    });
    const path = `/${locale}/portal/join?token=${token}`;
    const sent = await sendEmail({
      to: email,
      subject: "Follow your referral with LibaMed",
      body: `${user.name} has invited you to follow your referral${ref ? ` (${ref})` : ""}.

You'll be able to see where things stand, what you agreed to, and your documents. It's read-only — you can't change anything clinical, and you'll only ever see this one referral.

The link works once and expires in 14 days.`,
      action: { label: "Set up your access", url: `${siteUrl()}${path}` },
      footnote: "If you weren't expecting this, you can ignore this email.",
    });
    revalidatePath(`/${locale}/referring/cases/${ref}`);
    // Relative link — the caller renders it against the current origin.
    return { ok: true, email, link: path, emailed: sent };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not create the invitation." };
  }
}

/**
 * Redeem an invitation: create the patient's auth user, create a profile bound
 * to that referral, mark the invite used, and sign them in.
 */
export async function redeemPatientInviteAction(
  _prev: InviteState,
  formData: FormData,
): Promise<InviteState> {
  const locale = String(formData.get("locale") || "en");
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  if (password.length < 8) return { error: "Choose a password of at least 8 characters." };

  const invite = await lookupInvite(token);
  if (!invite) {
    return { error: "This invitation is no longer valid. Ask your clinician for a new one." };
  }

  const admin = supabaseAdmin();
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
  });
  if (authErr) return { error: authErr.message };

  const { error: profErr } = await admin.from("profiles").insert({
    auth_user_id: created.user.id,
    name: name || invite.email,
    email: invite.email,
    account_type: "patient",
    clinician_role: null,
    account_status: "verified",
    patient_referral_id: invite.referralId,
  });
  if (profErr) {
    await admin.auth.admin.deleteUser(created.user.id); // roll back the orphan
    return { error: profErr.message };
  }

  await markInviteRedeemed(invite.invitationId);
  if (invite.caseRef) {
    await appendAudit(invite.caseRef, {
      actor: name || invite.email,
      event: "Patient portal activated",
      detail: "Patient redeemed their invitation",
    });
  }

  const supabase = await supabaseServer();
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email: invite.email,
    password,
  });
  if (signErr) return { error: signErr.message };

  redirect(`/${locale}/portal`);
}
