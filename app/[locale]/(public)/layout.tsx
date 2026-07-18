import Link from "next/link";
import Button from "@/components/ui/Button";

// Public site layout: clean header + footer on the calm surface.
// Structure + tokens only — final marketing design comes later.

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/specialties", label: "Specialties" },
  { href: "/hospitals", label: "Hospitals" },
  { href: "/pledge", label: "The Pledge" },
  { href: "/for-clinicians", label: "For clinicians" },
];

const FOOTER_LINKS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/cookies", label: "Cookies" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/acceptable-use", label: "Acceptable use" },
  { href: "/legal/accessibility", label: "Accessibility" },
  { href: "/security", label: "Security" },
  { href: "/legal/sub-processors", label: "Sub-processors" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-line bg-card">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link href={base} className="flex items-center gap-2.5 font-semibold text-ink">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              L
            </span>
            LibaMed
          </Link>

          <nav aria-label="Site" className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
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
            <Button variant="ghost" size="sm" href={`${base}/login`}>
              Log in
            </Button>
            <Button size="sm" href={`${base}/register`}>
              Register
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 md:px-8">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            {FOOTER_LINKS.map((item) => (
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
            © {new Date().getFullYear()} LibaMed Ltd, Cardiff, Wales. Clinician-led
            international referrals — patients cannot create or submit cases.
          </p>
        </div>
      </footer>
    </div>
  );
}
