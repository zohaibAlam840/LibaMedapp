import Button from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import PasswordInput from "@/components/ui/PasswordInput";

// 9B · Reset password (from emailed link).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Choose a new password</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          At least 12 characters. A password manager or passkey is recommended.
        </p>
      </div>

      <Field label="New password" htmlFor="password">
        <PasswordInput id="password" autoComplete="new-password" />
      </Field>

      <Field label="Confirm new password" htmlFor="confirm">
        <PasswordInput id="confirm" autoComplete="new-password" />
      </Field>

      <Button href={`/${locale}/login`} className="w-full">
        Save and log in
      </Button>
    </div>
  );
}
