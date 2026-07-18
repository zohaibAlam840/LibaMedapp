import { BadgeCheck } from "lucide-react";
import Button from "@/components/ui/Button";

// 9B · GMC verification step — acceptance test §14.1.
// OPEN QUESTION (C2C spec §6.1): verification method against the public GMC
// register is unresolved (no obvious public API). This screen is the UI shell.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Verify your GMC registration</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          We check your details against the public GMC register before you can
          create a referral.
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-inner bg-subtle p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <BadgeCheck aria-hidden className="size-5" />
        </span>
        <div className="text-sm">
          <p className="font-medium text-ink">GMC number 7654321</p>
          <p className="text-ink-secondary">Dr. Amara Chen · entered at registration</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 text-sm text-ink-secondary">
        <li>· Registration status and licence to practise</li>
        <li>· Name match against your account details</li>
        <li>· Specialist register entry, where applicable</li>
      </ul>

      <Button href={`/${locale}/account-pending`} className="w-full">
        Run verification
      </Button>
      <p className="text-center text-xs text-ink-muted">
        Usually instant. If manual review is needed, we&rsquo;ll email you within
        one working day.
      </p>
    </div>
  );
}
