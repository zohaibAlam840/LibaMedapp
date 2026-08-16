"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
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

  let user: Awaited<ReturnType<typeof getSessionUser>>;
  try {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };

    user = await getSessionUser();
    if (!user) {
      // Authenticated with Supabase but no profiles row — the account is
      // half-created and cannot be used. End the session rather than leaving
      // them signed in to nothing.
      await supabase.auth.signOut();
      return {
        error:
          "This account isn't set up yet. Please contact your administrator so they can finish creating it.",
      };
    }
  } catch (err) {
    // Misconfigured host or Supabase outage — don't hand the clinician a stack
    // trace, and don't leave the form spinning.
    console.error("[auth] sign-in failed:", (err as Error)?.message ?? err);
    return { error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }

  // redirect() throws NEXT_REDIRECT (expected) — must be outside any try/catch.
  redirect(landingPath(locale, user));
}

/**
 * Sign out and return to the login page.
 *
 * Always ends at /login. Sign-out is the one action that must not be able to
 * strand someone: if the session is already gone, or Supabase can't be reached,
 * dropping the local cookies and moving on is the correct outcome anyway.
 */
export async function signOutAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") || "en");

  try {
    const supabase = await supabaseServer();
    // Default scope on purpose: this revokes the refresh token at Supabase, so
    // the session is dead server-side and not merely forgotten by this browser.
    const { error } = await supabase.auth.signOut();
    if (error) console.warn("[auth] sign-out revoke failed:", error.message);
  } catch (err) {
    console.error("[auth] sign-out failed:", (err as Error)?.message ?? err);
  }

  await clearSupabaseCookies();

  // redirect() throws NEXT_REDIRECT (expected) — must be outside any try/catch.
  redirect(`/${locale}/login`);
}

/**
 * Belt and braces: delete any leftover `sb-*` auth cookies directly. If
 * signOut() threw before its own cookie writes, a stale token would otherwise
 * survive and the next page would sign the person straight back in.
 */
async function clearSupabaseCookies(): Promise<void> {
  try {
    const store = await cookies();
    for (const { name } of store.getAll()) {
      if (name.startsWith("sb-")) store.delete(name);
    }
  } catch {
    /* read-only cookie store (not a Server Action) — nothing to clear */
  }
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

  let admin: ReturnType<typeof supabaseAdmin>;
  try {
    admin = supabaseAdmin();
  } catch (err) {
    console.error("[auth] sign-up failed:", (err as Error)?.message ?? err);
    return { error: "Registration is temporarily unavailable. Please try again shortly." };
  }

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
