import { QrCode, Smartphone } from "lucide-react";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

// 9B · MFA enrolment — required for all clinician + admin accounts (§7.4).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Set up two-factor authentication</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Required for every account. Scan the code with an authenticator app,
          then enter the 6-digit code to confirm.
        </p>
      </div>

      <div className="flex items-center justify-center rounded-inner bg-subtle p-6">
        {/* TODO: real TOTP QR — stub */}
        <span className="flex size-36 items-center justify-center rounded-inner bg-card text-ink-muted shadow-card">
          <QrCode aria-label="QR code placeholder" className="size-16" />
        </span>
      </div>

      <div className="flex items-start gap-2.5 text-[13px] text-ink-secondary">
        <Smartphone aria-hidden className="mt-0.5 size-4 shrink-0" />
        Works with any TOTP app (e.g. Microsoft or Google Authenticator). NHS
        smartcard / passkey support is planned.
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
        Confirm and finish
      </Button>
    </div>
  );
}
