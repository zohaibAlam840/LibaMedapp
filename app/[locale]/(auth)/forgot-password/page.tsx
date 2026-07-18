import Link from "next/link";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

// 9B · Forgot password.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Enter your work email and we&rsquo;ll send a secure reset link.
        </p>
      </div>

      <Field label="Work email" htmlFor="email">
        <Input id="email" type="email" autoComplete="email" placeholder="name@nhs.net" />
      </Field>

      <Button href={`/${locale}/reset-password`} className="w-full">
        Send reset link
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        <Link href={`/${locale}/login`} className="font-medium text-accent hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  );
}
