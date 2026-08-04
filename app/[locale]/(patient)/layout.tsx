import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import { getSessionUser } from "@/lib/auth";
import { signOutAction } from "@/lib/authActions";

// Patient portal shell — a DATA SUBJECT's read-only view of their single
// referral. Deliberately minimal: no sidebar, no role switching, no app nav.
// Access requires a signed-in PATIENT account scoped to one referral; every
// other account type (and anonymous visitors) is sent to the login screen.
export default async function PatientLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user || user.accountType !== "patient") redirect(`/${locale}/login`);

  return (
    <div className="flex min-h-dvh flex-col bg-page">
      <header className="sticky top-0 z-20 border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 font-semibold text-ink">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              LM
            </span>
            LibaMed
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-[13px] text-ink-secondary sm:inline-flex">
              <ShieldCheck aria-hidden className="size-3.5 text-accent" />
              Read-only
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

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
