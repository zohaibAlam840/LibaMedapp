"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { updateProfileAction, type AuthState } from "@/lib/authActions";

/**
 * Edit your own display name. Email is the login identity and role is set by an
 * administrator, so both are shown read-only — changing either has security
 * consequences and belongs in the admin area, not self-service.
 */
export default function ProfileForm({
  locale,
  name,
  email,
  roleLabel,
}: {
  locale: string;
  name: string;
  email: string;
  roleLabel: string;
}) {
  const [state, action, pending] = useActionState<AuthState & { ok?: boolean }, FormData>(
    updateProfileAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <Field label="Full name" htmlFor="pf-name">
        <Input id="pf-name" name="name" defaultValue={name} required autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="pf-email" hint="Your sign-in address — contact an administrator to change it.">
        <Input id="pf-email" defaultValue={email} disabled />
      </Field>
      <Field label="Role" htmlFor="pf-role" hint="Set by an administrator.">
        <Input id="pf-role" defaultValue={roleLabel} disabled />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Saved.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" size="sm" loading={pending} disabled={pending}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
