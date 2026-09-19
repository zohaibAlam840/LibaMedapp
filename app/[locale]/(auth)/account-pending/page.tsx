import { Hourglass, ShieldCheck, ShieldX } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { signOutAction } from "@/lib/authActions";
import { getSessionUser } from "@/lib/auth";

// Where an account waits when it can't reach the app yet:
//  · pending   — a person is checking the GMC / FCA number by hand
//  · declined  — the check didn't pass
//
// An introducer is NOT sent here any more — verified or pending, they have a
// workspace to go to (migration 006). The branch below stays for anyone who
// reaches this URL directly, and points them at it rather than stranding them.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;

  const user = await getSessionUser();
  const state = user?.accountStatus ?? status ?? "pending";
  const isIntroducer = user?.accountType === "introducer";

  const view =
    state === "declined"
      ? {
          icon: ShieldX,
          title: "We couldn't verify your registration",
          body: "We weren't able to match your registration number to the public register, so the account isn't active. If you think that's a mistake — a mistyped number, for instance — reply to the email we sent and we'll look again.",
        }
      : isIntroducer
        ? {
            icon: ShieldCheck,
            title: "Your workspace is open",
            body: "You can write cases now. Each one stays a private draft until you submit it, and a UK-registered clinician co-signs it before it reaches a hospital.",
          }
        : {
            icon: Hourglass,
            title: "Your account is under review",
            body: "Someone is checking your registration number against the public register. It usually takes less than one working day, and we'll email you as soon as it's done. There's nothing you need to do.",
          };

  const Icon = view.icon;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <EmptyState icon={Icon} title={view.title} description={view.body} className="py-4">
        <div className="flex flex-wrap justify-center gap-2">
          {isIntroducer && state !== "declined" && (
            <Button size="sm" href={`/${locale}/introducer`}>
              Open your workspace
            </Button>
          )}
          <Button variant="secondary" size="sm" href={`/${locale}`}>
            Back to home
          </Button>
          <form action={signOutAction}>
            <input type="hidden" name="locale" value={locale} />
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </EmptyState>
    </div>
  );
}
