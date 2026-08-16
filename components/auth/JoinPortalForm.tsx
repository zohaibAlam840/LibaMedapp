"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import PasswordInput from "@/components/ui/PasswordInput";
import { redeemPatientInviteAction, type InviteState } from "@/lib/patientActions";

/** Redeems a patient invitation: sets a password and opens the portal. */
export default function JoinPortalForm({
  locale,
  token,
  email,
}: {
  locale: string;
  token: string;
  email: string;
}) {
  const [state, action, pending] = useActionState<InviteState, FormData>(
    redeemPatientInviteAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="locale" value={locale} />

      <Field label="Email" htmlFor="jp-email">
        <Input id="jp-email" value={email} disabled />
      </Field>
      <Field label="Your name" htmlFor="jp-name">
        <Input id="jp-name" name="name" autoComplete="name" required />
      </Field>
      <Field label="Choose a password" htmlFor="jp-password" hint="At least 8 characters.">
        <PasswordInput id="jp-password" name="password" autoComplete="new-password" required />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} disabled={pending} className="w-full">
        Open my referral
      </Button>
    </form>
  );
}
