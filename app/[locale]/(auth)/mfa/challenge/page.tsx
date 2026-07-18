import Link from "next/link";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

// 9B · MFA challenge — second factor at every login (§7.4).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Enter your code</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Open your authenticator app and enter the current 6-digit code.
        </p>
      </div>

      <Field label="6-digit code" htmlFor="totp">
        <Input
          id="totp"
          inputMode="numeric"
          maxLength={6}
          placeholder="000000"
          className="text-center text-xl tracking-[0.5em]"
        />
      </Field>

      <Button href={`/${locale}/referring`} className="w-full">
        Verify
      </Button>

      <p className="text-center text-sm text-ink-secondary">
        Lost your device?{" "}
        <Link href={`/${locale}/contact`} className="font-medium text-accent hover:underline">
          Contact support
        </Link>
      </p>
    </div>
  );
}
