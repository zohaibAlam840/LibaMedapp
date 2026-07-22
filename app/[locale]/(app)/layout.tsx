import Link from "next/link";
import { cookies } from "next/headers";
import { Sidebar, BottomTabs } from "@/components/shell/AppNav";
import TopBarCluster from "@/components/ui/TopBarCluster";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import {
  DEMO_ROLE_COOKIE,
  DEMO_ROLE_SIDEBAR_COOKIE,
  parseRole,
} from "@/lib/demoRole";

// Authenticated app shell (Vol III §0.2): one app, three experiences. The
// sidebar, dashboard, and permissions swap by role. The active demo role and
// the sidebar collapse state come from cookies; real RBAC is enforced
// server-side once auth lands.

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const store = await cookies();
  const role = parseRole(store.get(DEMO_ROLE_COOKIE)?.value);
  const collapsed = store.get(DEMO_ROLE_SIDEBAR_COOKIE)?.value === "collapsed";

  return (
    <div className="flex min-h-dvh">
      <Sidebar locale={locale} role={role} defaultCollapsed={collapsed} />

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
            <TopBarCluster locale={locale} role={role} />
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-10 md:px-8">
          {children}
        </main>
      </div>

      <BottomTabs locale={locale} role={role} />
    </div>
  );
}
