import { redirect } from "next/navigation";
import { MonitorSmartphone, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import SubmitButton from "@/components/ui/SubmitButton";
import { getSessionUser } from "@/lib/auth";
import { signOutEverywhereAction } from "@/lib/accountActions";

// 9B · Sessions & devices.
//
// This page used to list three invented devices ("Windows · Chrome, London",
// "iPhone · LibaMed PWA") with Revoke buttons that did nothing. Supabase does
// not expose a per-device session list, so that list could never be made real —
// and a security screen that invents where you are signed in is worse than one
// that admits what it knows.
//
// What IS available is a global sign-out, which revokes every refresh token on
// the account. That is the action the page was pretending to offer, so it is
// the action the page now offers.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-[28px] font-semibold text-ink">Sessions &amp; devices</h1>
      <p className="mb-6 text-[15px] text-ink-secondary">
        Signed in as {user.email || user.name}. Sessions also expire on their own
        after a period of inactivity.
      </p>

      <Card className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
          <MonitorSmartphone aria-hidden className="size-4.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
            This browser
            <Chip selected size="sm">
              Current
            </Chip>
          </span>
          <span className="block text-[13px] text-ink-secondary">
            The session you are using right now.
          </span>
        </span>
      </Card>

      <p className="mt-3 text-[13px] text-ink-muted">
        A list of your other devices isn&rsquo;t shown because we can&rsquo;t read
        one reliably — so rather than guess, the control below covers all of them
        at once.
      </p>

      <Card className="mt-4">
        <CardTitle className="mb-1">Sign out everywhere</CardTitle>
        <p className="text-sm text-ink-secondary">
          Ends every session on every device, including this one. Use it if you
          have signed in on a shared or lost device. You will need to sign in
          again, and pass two-factor authentication if you have it enabled.
        </p>
        <form action={signOutEverywhereAction} className="mt-4 flex justify-end">
          <input type="hidden" name="locale" value={locale} />
          <SubmitButton variant="danger" size="sm" pendingLabel="Signing out…">
            Sign out on all devices
          </SubmitButton>
        </form>
      </Card>

      <Card className="mt-4 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <ShieldCheck aria-hidden className="size-4.5" />
        </span>
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Every sign-in, document access and case change is written to the audit
          log. If you think someone else has used your account, sign out
          everywhere, change your password, and tell your administrator — they
          can see exactly what was accessed.
        </p>
      </Card>
    </div>
  );
}
