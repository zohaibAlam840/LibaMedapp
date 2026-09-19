"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import SubmitButton from "@/components/ui/SubmitButton";
import Toggle from "@/components/ui/Toggle";
import { saveNotificationPrefsAction, type AccountState } from "@/lib/accountActions";
import {
  NOTIFICATION_KEYS,
  NOTIFICATION_LABELS,
  type NotificationPrefs,
} from "@/lib/notificationTypes";

/**
 * Notification preferences.
 *
 * Every toggle here maps to an email the platform actually sends (lib/notify).
 * The page previously offered six, three of which described events nothing in
 * the system detects — an SLA breach, a consent nearing expiry, an access
 * window closing. A preference for an event that can never fire is a setting
 * that does nothing, so those are gone until the events exist.
 */
export default function NotificationPrefsForm({
  locale,
  prefs,
  persistable,
}: {
  locale: string;
  prefs: NotificationPrefs;
  /** False when migration 005 hasn't been applied — saving would silently fail. */
  persistable: boolean;
}) {
  const [state, action] = useActionState<AccountState, FormData>(
    saveNotificationPrefsAction,
    {},
  );

  return (
    <form action={action}>
      <input type="hidden" name="locale" value={locale} />

      <Card>
        <CardTitle>Case activity</CardTitle>
        <div className="divide-y divide-line">
          {NOTIFICATION_KEYS.map((key) => (
            <Toggle
              key={key}
              name={key}
              defaultChecked={prefs[key]}
              disabled={!persistable}
              label={NOTIFICATION_LABELS[key].label}
              description={NOTIFICATION_LABELS[key].description}
            />
          ))}
        </div>
      </Card>

      {!persistable && (
        <p className="mt-4 flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          These can&rsquo;t be saved yet — the database is missing migration 005.
          Until then every notification is on.
        </p>
      )}
      {state.error && (
        <p className="mt-4 flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="mt-4 rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Saved.
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <SubmitButton size="sm" disabled={!persistable} pendingLabel="Saving…">
          Save preferences
        </SubmitButton>
      </div>
    </form>
  );
}
