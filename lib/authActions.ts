"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, landingPath } from "@/lib/auth";
import { sendEmail, siteUrl } from "@/lib/email";

export type AuthState = { error?: string };

/** Email + password sign-in. On success, redirects to the role's landing page. */
export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = String(formData.get("locale") || "en");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const user = await getSessionUser();
  if (!user) {
    // Authenticated with Supabase but no profiles row — the account is
    // half-created and cannot be used. End the session rather than leaving them
    // signed in to nothing.
    await supabase.auth.signOut();
    return {
      error:
        "This account isn't set up yet. Please contact your administrator so they can finish creating it.",
    };
  }
  // redirect() throws NEXT_REDIRECT (expected) — must be outside any try/catch.
  redirect(landingPath(locale, user));
}

/** Sign out and return to the login page. */
export async function signOutAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") || "en");
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect(`/${locale}/login`);
}

/**
 * Self-service sign-up. Two paths behind one form:
 *  · clinician  — referring doctor; GMC number recorded and checked BY HAND by
 *    an admin against the public register before the account is usable.
 *  · introducer — insurance/broker; FCA number reviewed the same way (and never
 *    hard-rejected). Receiving/coordinator/admin are invited, not self-
 *    registered — see scripts/create-account.mjs.
 * Both land on the "under review" screen until an admin approves them.
 * Creates the auth user (email pre-confirmed) + a profiles row, then signs in.
 */
export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = String(formData.get("locale") || "en");
  const mode = String(formData.get("mode") || "clinician");
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = `${String(formData.get("firstName") || "").trim()} ${String(formData.get("lastName") || "").trim()}`.trim();

  if (!email || password.length < 8) {
    return { error: "Enter a valid email and a password of at least 8 characters." };
  }

  const admin = supabaseAdmin();
  const { data: created, error: authErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (authErr) return { error: authErr.message };
  const authUserId = created.user.id;

  const introducer = mode === "introducer";
  const regStatus = String(formData.get("regStatus") || "");
  const profile: Record<string, unknown> = {
    auth_user_id: authUserId,
    name: name || email,
    email,
    account_type: introducer ? "introducer" : "clinician",
    clinician_role: introducer ? null : "referring",
    // Both paths start pending: an admin verifies the GMC / FCA number
    // against the public register before the account can be used.
    account_status: "pending",
    gmc_number: introducer ? null : String(formData.get("gmc") || "") || null,
    company: introducer ? String(formData.get("org") || "") || null : null,
    job_title: introducer ? String(formData.get("jobTitle") || "") || null : null,
    reg_status: introducer && (regStatus === "fca" || regStatus === "employer") ? regStatus : null,
    fca_number: introducer ? String(formData.get("fca") || "") || null : null,
    attested: introducer ? formData.get("attested") === "true" : false,
  };

  const { error: profErr } = await admin.from("profiles").insert(profile);
  if (profErr) {
    await admin.auth.admin.deleteUser(authUserId); // roll back the orphan
    return { error: profErr.message };
  }

  // Tell the applicant, and alert whoever has to do the checking.
  const reg = introducer
    ? `FCA ${String(formData.get("fca") || "") || "— employer-verified"}`
    : `GMC ${String(formData.get("gmc") || "") || "— not supplied"}`;
  await sendEmail({
    to: email,
    subject: "Your LibaMed registration is being reviewed",
    body: `Thanks for registering, ${name || email}.

Before you can create referrals we verify your registration against the public register. That check is done by a person, usually within one working day.

We'll email you as soon as it's done — there's nothing you need to do.`,
    footnote: "If you didn't create this account, please reply to this email.",
  });
  await notifyAdminsOfRegistration({ name: name || email, email, reg, locale });

  const supabase = await supabaseServer();
  const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signErr) return { error: signErr.message };

  if (introducer) redirect(`/${locale}/register/introducer-review?status=${regStatus}`);
  redirect(`/${locale}/account-pending`);
}

/** Update the signed-in user's own display name (email is the login identity). */
export async function updateProfileAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState & { ok?: boolean }> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  const locale = String(formData.get("locale") || "en");
  const name = String(formData.get("name") || "").trim();
  if (name.length < 2) return { error: "Enter your name." };

  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ name })
    .eq("id", user.profileId);
  if (error) return { error: error.message };

  revalidatePath(`/${locale}/account`);
  revalidatePath(`/${locale}`, "layout");
  return { ok: true };
}

/** Alert every admin that a registration is waiting to be checked. */
async function notifyAdminsOfRegistration(a: {
  name: string;
  email: string;
  reg: string;
  locale: string;
}): Promise<void> {
  try {
    const { data } = await supabaseAdmin()
      .from("profiles")
      .select("email")
      .eq("clinician_role", "admin")
      .not("email", "is", null);
    const admins = ((data as { email: string | null }[]) ?? [])
      .map((r) => r.email)
      .filter((e): e is string => Boolean(e));
    await Promise.all(
      admins.map((to) =>
        sendEmail({
          to,
          subject: `Registration to verify — ${a.name}`,
          body: `${a.name} (${a.email}) has registered and is waiting for verification.

Registration number: ${a.reg}

Check it against the public register, then approve or decline the account.`,
          action: {
            label: "Review registrations",
            url: `${siteUrl()}/${a.locale}/admin/verification`,
          },
        }),
      ),
    );
  } catch (e) {
    console.warn("[email] admin registration alert failed:", (e as Error)?.message);
  }
}
