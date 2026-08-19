import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar, BottomTabs } from "@/components/shell/AppNav";
import UserMenu from "@/components/auth/UserMenu";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import { getSessionUser, landingPath, needsMfaChallenge } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { DEMO_ROLE_SIDEBAR_COOKIE } from "@/lib/demoRole";
import { navBadgesFor } from "@/lib/nav";
import { getCases } from "@/lib/db/referrals";

// Authenticated app shell (Vol III §0.2): one app, three experiences by role.
// Access is now gated by a real Supabase session — non-clinicians and
// unauthenticated visitors are redirected to /login. (Per the proxy docs,
// authz is enforced here + in each server action, not by the proxy alone.)

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getSessionUser();
  if (!user || user.accountType !== "clinician") {
    redirect(`/${locale}/login`);
  }
  // A registration an admin hasn't verified yet cannot reach patient data.
  if (user.accountStatus !== "verified") {
    redirect(`/${locale}/account-pending?status=${user.accountStatus}`);
  }
  // A verified second factor that hasn't been satisfied on this sign-in blocks
  // the app until the code is entered.
  if (await needsMfaChallenge()) {
    // Carry the role's home through so verifying lands them in the app,
    // not back on the marketing site.
    redirect(`/${locale}/mfa/challenge?next=${encodeURIComponent(landingPath(locale, user))}`);
  }

  const role = user.role;
  const store = await cookies();
  const collapsed = store.get(DEMO_ROLE_SIDEBAR_COOKIE)?.value === "collapsed";
  // Sidebar counts are per user, so they are computed here from the caller's
  // own scoped cases rather than baked into the nav table.
  const badges = navBadgesFor(role, await getCases(user));

  return (
    <div className="flex min-h-dvh">
      <Sidebar
        locale={locale}
        role={role}
        userName={user.name}
        defaultCollapsed={collapsed}
        badges={badges}
      />

      <div className="flex min-w-0 flex-1 flex-col pb-16 md:pb-0">
        <header className="flex items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4 print:hidden">
          <Link
            href={`/${locale}`}
            className="text-lg font-semibold text-ink md:invisible"
          >
            LibaMed
          </Link>
          <div className="flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <UserMenu locale={locale} name={user.name} roleLabel={ROLE_LABEL[role]} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 md:px-8">
          {children}
        </main>
      </div>

      <BottomTabs locale={locale} role={role} badges={badges} />
    </div>
  );
}
