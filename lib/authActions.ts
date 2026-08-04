"use server";

import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser, landingPath } from "@/lib/auth";

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
  // redirect() throws NEXT_REDIRECT (expected) — must be outside any try/catch.
  redirect(user ? landingPath(locale, user) : `/${locale}`);
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
 *  · clinician  — referring doctor (GMC verification is stubbed as passed for
 *    the demo → account_status "verified"); lands in the app.
 *  · introducer — insurance/broker; account_status "pending" (never hard-reject);
 *    lands on the under-review page. (Receiving/coordinator/admin are invited,
 *    not self-registered — see scripts/create-account.mjs.)
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
    account_status: introducer ? "pending" : "verified",
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

  const supabase = await supabaseServer();
  const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
  if (signErr) return { error: signErr.message };

  if (introducer) redirect(`/${locale}/register/introducer-review?status=${regStatus}`);
  const user = await getSessionUser();
  redirect(user ? landingPath(locale, user) : `/${locale}/referring`);
}
