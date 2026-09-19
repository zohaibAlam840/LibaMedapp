import { redirect } from "next/navigation";
import NotificationPrefsForm from "@/components/auth/NotificationPrefsForm";
import { getSessionUser } from "@/lib/auth";
import { defaultPrefs, getNotificationPrefs, prefsArePersistable } from "@/lib/db/prefs";

// 9B · Notification preferences.
//
// These now persist, and each one corresponds to an email the platform really
// sends when a case moves or a message arrives (lib/notify.ts).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  const [prefs, persistable] = await Promise.all([
    getNotificationPrefs(user.profileId).catch(() => defaultPrefs()),
    prefsArePersistable(),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-[28px] font-semibold text-ink">Notification preferences</h1>
      <p className="mb-6 text-[15px] text-ink-secondary">
        Email alerts about your cases. Emails never contain patient details — only
        the case reference and what changed.
      </p>

      <NotificationPrefsForm locale={locale} prefs={prefs} persistable={persistable} />
    </div>
  );
}
