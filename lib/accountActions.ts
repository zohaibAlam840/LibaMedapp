"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { clearSupabaseCookies } from "@/lib/supabase/cookies";
import { supabaseServer } from "@/lib/supabase/server";
import {
  NOTIFICATION_KEYS,
  defaultPrefs,
  prefsArePersistable,
  setNotificationPrefs,
  type NotificationPrefs,
} from "@/lib/db/prefs";

export type AccountState = { ok?: boolean; error?: string };

/** Save which case emails this person wants. */
export async function saveNotificationPrefsAction(
  _prev: AccountState,
  formData: FormData,
): Promise<AccountState> {
  const user = await getSessionUser();
  if (!user) return { error: "Your session has expired — please sign in again." };

  if (!(await prefsArePersistable())) {
    return { error: "Preferences can't be saved yet — the database is missing migration 005." };
  }

  // An unchecked checkbox posts nothing, so absence means off. Reading the
  // known keys rather than the submitted ones stops a crafted form writing
  // arbitrary keys into the jsonb column.
  const prefs = defaultPrefs();
  for (const key of NOTIFICATION_KEYS) {
    prefs[key] = formData.get(key) === "on";
  }

  try {
    await setNotificationPrefs(user.profileId, prefs as NotificationPrefs);
    revalidatePath(`/${String(formData.get("locale") || "en")}/account/notifications`);
    return { ok: true };
  } catch (e) {
    return { error: (e as Error)?.message ?? "Could not save your preferences." };
  }
}

/**
 * Sign out of every device.
 *
 * Supabase exposes no per-device session list, which is why the sessions page
 * used to show three invented devices with revoke buttons that did nothing.
 * A global sign-out IS available, and it is the action that page was pretending
 * to offer: it revokes every refresh token for the account, so every other
 * browser is signed out at its next request.
 */
export async function signOutEverywhereAction(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") || "en");
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  try {
    const supabase = await supabaseServer();
    await supabase.auth.signOut({ scope: "global" });
  } catch (e) {
    console.warn("[action] signOutEverywhere failed:", (e as Error)?.message);
  }
  // Clear this browser's cookies too — a global revocation leaves the local
  // cookie in place, and the user would appear signed in until it expired.
  await clearSupabaseCookies();
  redirect(`/${locale}/login?signedOut=all`);
}
