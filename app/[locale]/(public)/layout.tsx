import Link from "next/link";
import Button from "@/components/ui/Button";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import { getDictionary } from "@/lib/dictionaries";

// Public site layout: clean header + footer on the calm surface.
// Nav + footer labels come from the locale dictionary.

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = getDictionary(locale);

  const nav = [
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/specialties", label: t.nav.specialties },
    { href: "/hospitals", label: t.nav.hospitals },
    { href: "/corridors", label: t.nav.corridors },
    { href: "/pledge", label: t.nav.pledge },
    { href: "/for-clinicians", label: t.nav.forClinicians },
  ];

  const footerLinks = [
    { href: "/legal/privacy", label: t.footer.privacy },
    { href: "/legal/cookies", label: t.footer.cookies },
    { href: "/legal/terms", label: t.footer.terms },
    { href: "/legal/acceptable-use", label: t.footer.acceptableUse },
    { href: "/legal/accessibility", label: t.footer.accessibility },
    { href: "/security", label: t.footer.security },
    { href: "/legal/sub-processors", label: t.footer.subProcessors },
    { href: "/contact", label: t.footer.contact },
    { href: "/faq", label: t.footer.faq },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href={base} className="flex items-center gap-2.5 font-semibold text-ink">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              LM
            </span>
            LibaMed
          </Link>

          <nav aria-label="Site" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={`${base}${item.href}`}
                className="rounded-full px-3.5 py-2 text-sm text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher current={locale} />
            <Button variant="ghost" size="sm" href={`${base}/login`} className="hidden sm:inline-flex">
              {t.nav.login}
            </Button>
            <Button size="sm" href={`${base}/register`}>
              {t.nav.register}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:px-8">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.map((item) => (
              <Link
                key={item.href}
                href={`${base}${item.href}`}
                className="text-[13px] text-ink-secondary hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} {t.footer.rights}
          </p>
          {/* Controller identity — expected on a UK site processing health data. */}
          <p className="text-xs text-ink-muted">
            Libamed Ltd, registered in Wales no. 17272473. Registered with the
            Information Commissioner&rsquo;s Office, reference ZC220043.
          </p>
        </div>
      </footer>
    </div>
  );
}
