"use client";

import { useActionState, useState } from "react";
import { Check, Copy, KeyRound, TriangleAlert, X } from "lucide-react";
import Button from "@/components/ui/Button";
import { resetUserPasswordAction, type InviteState } from "@/lib/adminActions";

/**
 * Issue a new one-time password for an existing account.
 *
 * Several accounts had passwords nobody knew and no way to change them: the
 * only routes were the public reset email (which needs the account's mailbox)
 * or deleting the person. The new password is shown ONCE here and emailed to
 * the account holder — it is never stored by us, so if it is lost the reset
 * simply runs again.
 */
export default function ResetPasswordButton({
  locale,
  profileId,
  name,
}: {
  locale: string;
  profileId: string;
  name: string;
}) {
  const [state, action, pending] = useActionState<InviteState, FormData>(
    resetUserPasswordAction,
    {},
  );
  const [confirming, setConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (state.ok && state.tempPassword) {
    return (
      <div className="flex flex-col gap-1.5 rounded-inner border border-success-bg bg-success-bg/40 p-2.5">
        <p className="text-[12px] text-ink-secondary">
          New password for {name}
          {state.emailed ? " — emailed to them." : " — email not sent, pass it on securely."}
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded bg-card px-2 py-1 font-mono text-[12px] text-ink">
            {state.tempPassword}
          </code>
          <button
            type="button"
            aria-label="Copy password"
            onClick={() => {
              navigator.clipboard?.writeText(state.tempPassword!);
              setCopied(true);
            }}
            className="text-ink-secondary hover:text-ink"
          >
            {copied ? (
              <Check aria-hidden className="size-4 text-success-text" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-ink-muted">Shown once — it is not stored.</p>
      </div>
    );
  }

  if (!confirming) {
    return (
      <div className="flex flex-col gap-1">
        <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
          <KeyRound aria-hidden className="size-3.5" /> Reset password
        </Button>
        {state.error && (
          <p className="flex items-start gap-1.5 text-[12px] text-danger-text">
            <TriangleAlert aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            {state.error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-1.5">
      <input type="hidden" name="profileId" value={profileId} />
      <input type="hidden" name="locale" value={locale} />
      <p className="text-[12px] text-ink-secondary">
        Sign {name} out and issue a new password?
      </p>
      <div className="flex items-center gap-1.5">
        <Button type="submit" variant="danger" size="sm" loading={pending} disabled={pending}>
          Reset
        </Button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          aria-label="Cancel"
          className="text-ink-secondary hover:text-ink"
        >
          <X aria-hidden className="size-4" />
        </button>
      </div>
    </form>
  );
}
