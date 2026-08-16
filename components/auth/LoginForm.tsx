"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import PasswordInput from "@/components/ui/PasswordInput";
import { signInAction, type AuthState } from "@/lib/authActions";

export default function LoginForm({ locale }: { locale: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signInAction, {});

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />

      <Field label="Work email" htmlFor="email">
        <Input id="email" name="email" type="email" required autoComplete="email" placeholder="name@nhs.net" />
      </Field>

      <Field label="Password" htmlFor="password">
        <PasswordInput id="password" name="password" required autoComplete="current-password" />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <Button type="submit" loading={pending} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
