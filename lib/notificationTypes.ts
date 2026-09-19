// Notification keys, labels, and defaults.
//
// Deliberately free of `server-only` and of any Supabase import: the
// preferences form is a client component and needs the labels, so putting
// these next to the database helpers would drag the service client into the
// browser bundle (and fail the build, which is how this file came to exist).

export const NOTIFICATION_KEYS = ["caseAssigned", "caseProgress", "newMessage"] as const;
export type NotificationKey = (typeof NOTIFICATION_KEYS)[number];

export const NOTIFICATION_LABELS: Record<NotificationKey, { label: string; description: string }> = {
  caseAssigned: {
    label: "New referral in your queue",
    description: "A case arrives at your hospital addressed to you.",
  },
  caseProgress: {
    label: "Case moves forward",
    description: "Accepted, treatment plan sent, confirmed, completed, or summary returned.",
  },
  newMessage: {
    label: "New secure message",
    description: "The clinician on the other side of one of your cases writes to you.",
  },
};

/** Everything on unless the person has turned it off. */
export type NotificationPrefs = Record<NotificationKey, boolean>;

export function defaultPrefs(): NotificationPrefs {
  return { caseAssigned: true, caseProgress: true, newMessage: true };
}
