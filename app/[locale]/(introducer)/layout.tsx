import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, PenLine } from "lucide-react";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/lib/authActions";

// Introducer workspace shell.
//
// An introducer is not a clinician, so this is NOT the (app) shell: no case
// queue, no messages, no clinical rail. They originate cases and watch for a
// UK clinician's signature, and that is the whole surface.
//
// Pending accounts are let IN on purpose. Registration tells them they can
// start writing while their FCA or employer check runs, and the submit button —
// not the front door — is what verification gates.
export default async function IntroducerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user || user.accountType !== "introducer") redirect(`/${locale}/login`);
  if (user.accountStatus === "declined") redirect(`/${locale}/account-pending?status=declined`);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4">
          <Link
            href={`/${locale}/introducer`}
            className="flex items-center gap-2.5 font-semibold text-ink"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              LM
            </span>
            LibaMed
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-[13px] text-ink-secondary sm:inline-flex">
              <PenLine aria-hidden className="size-3.5 text-accent" />
              Introducer
            </span>
            <LocaleSwitcher current={locale} />
            <form action={signOutAction}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
              >
                <LogOut aria-hidden className="size-4 rtl:-scale-x-100" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
