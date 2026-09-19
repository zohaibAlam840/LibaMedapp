import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  NOTIFICATION_KEYS,
  defaultPrefs,
  type NotificationPrefs,
} from "@/lib/notificationTypes";

// Reading and writing notification preferences, stored as a jsonb bag on the
// profile. The keys and labels live in lib/notificationTypes.ts so the client
// form can import them without pulling the service client into the browser.
//
// The page used to render six toggles that forgot on reload. Three of them
// described events the platform does not detect at all — an SLA breach, a
// consent nearing expiry, a case access window closing — so a saved preference
// for them would be a setting that can never fire. Only real events are kept.

export {
  NOTIFICATION_KEYS,
  NOTIFICATION_LABELS,
  defaultPrefs,
  type NotificationKey,
  type NotificationPrefs,
} from "@/lib/notificationTypes";

function coerce(raw: unknown): NotificationPrefs {
  const prefs = defaultPrefs();
  if (raw && typeof raw === "object") {
    for (const key of NOTIFICATION_KEYS) {
      const value = (raw as Record<string, unknown>)[key];
      if (typeof value === "boolean") prefs[key] = value;
    }
  }
  return prefs;
}

/** Missing column (migration 005 not applied) reads as the defaults. */
export async function getNotificationPrefs(profileId: string): Promise<NotificationPrefs> {
  try {
    const { data, error } = await supabaseAdmin()
      .from("profiles")
      .select("notification_prefs")
      .eq("id", profileId)
      .maybeSingle();
    if (error) throw error;
    return coerce((data as { notification_prefs?: unknown } | null)?.notification_prefs);
  } catch (e) {
    console.warn("[db] getNotificationPrefs failed:", (e as Error)?.message);
    return defaultPrefs();
  }
}

export async function setNotificationPrefs(
  profileId: string,
  prefs: NotificationPrefs,
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("profiles")
    .update({ notification_prefs: prefs })
    .eq("id", profileId);
  if (error) throw error;
}

/** True when the column exists, so the UI can say why saving is unavailable. */
export async function prefsArePersistable(): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin().from("profiles").select("notification_prefs").limit(1);
    return !error;
  } catch {
    return false;
  }
}
