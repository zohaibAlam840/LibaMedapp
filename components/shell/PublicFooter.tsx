import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { getDictionary } from "@/lib/dictionaries";

// Marketing-site footer: a dark call-to-action card overlapping the top edge,
// three columns of links over an oversized ghosted wordmark, then a bottom bar
// carrying the registration details a UK site processing health data is
// expected to show.
//
// The CTA lives here rather than on the home page so it closes every public
// page, which is also why the home page's own CTA band was removed — two in a
// row read as a mistake.

export default async function PublicFooter({ locale }: { locale: string }) {
  const base = `/${locale}`;
  const t = getDictionary(locale);

  // Three unlabelled columns, as in the reference. Unlabelled is not only a
  // style choice: headings would mean four new strings to translate into fr,
  // tr and he, and every link here already exists.
  const columns: { href: string; label: string }[][] = [
    [
      { href: "/how-it-works", label: t.nav.howItWorks },
      { href: "/specialties", label: t.nav.specialties },
      { href: "/hospitals", label: t.nav.hospitals },
      { href: "/corridors", label: t.nav.corridors },
      { href: "/pledge", label: t.nav.pledge },
    ],
    [
      { href: "/for-clinicians", label: t.nav.forClinicians },
      { href: "/contact", label: t.footer.contact },
      { href: "/faq", label: t.footer.faq },
      { href: "/security", label: t.footer.security },
      { href: "/legal/accessibility", label: t.footer.accessibility },
    ],
    [
      { href: "/legal/privacy", label: t.footer.privacy },
      { href: "/legal/cookies", label: t.footer.cookies },
      { href: "/legal/terms", label: t.footer.terms },
      { href: "/legal/acceptable-use", label: t.footer.acceptableUse },
      { href: "/legal/sub-processors", label: t.footer.subProcessors },
    ],
  ];

  return (
    <footer className="relative bg-page">
      {/* Oversized wordmark bled off the bottom edge. Its own clipped box, so
          the CTA card above can still hang outside the footer's bounds. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden">
        <span className="block translate-y-[28%] text-center text-[22vw] font-semibold leading-none tracking-tight text-ink/[0.03] select-none">
          LibaMed
        </span>
      </div>

      <div className="relative mx-auto max-w-6xl px-4 md:px-8">
        {/* No negative margin. It used to be pulled up over the section above,
            which cost nothing visually — the footer's ground is `bg-page`, the
            same as most page bodies, so the "overlap" never read as one — while
            on any short page (hospitals, for one) the card rode up over live
            content. */}
        <div className="mt-20 overflow-hidden rounded-panel bg-navy shadow-elevated">
          <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
            <h2 className="max-w-lg text-2xl font-semibold leading-tight text-white md:text-3xl">
              {t.home.ctaTitle}
            </h2>
            <Button size="lg" variant="accent" href={`${base}/register`} className="shrink-0">
              {t.home.ctaButton}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
          </div>
        </div>

        {/* Brand + link columns */}
        <div className="grid gap-10 pt-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link href={base} className="flex items-center gap-2.5 font-semibold text-ink">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
                LM
              </span>
              LibaMed
            </Link>
            <p className="mt-4 max-w-[34ch] text-[13px] leading-relaxed text-ink-secondary">
              {t.footer.rights}
            </p>
          </div>

          {columns.map((column, i) => (
            <nav
              key={i}
              aria-label={`Footer links ${i + 1}`}
              className="flex flex-col gap-3"
            >
              {column.map((item) => (
                <Link
                  key={item.href}
                  href={`${base}${item.href}`}
                  className="text-[13px] text-ink-secondary transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ))}
        </div>

        {/* Bottom bar. The pill states a verifiable registration rather than a
            live service-status claim — there is no status source to back one,
            and inventing "all systems operational" on a health platform would
            be asserting something we cannot know. */}
        <div className="flex flex-col gap-4 pt-16 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-[12px] font-medium text-ink-secondary">
            <span className="size-2 rounded-full bg-success-text" />
            ICO registered · ZC220043
          </span>
          <p className="text-[12px] text-ink-muted">
            © {new Date().getFullYear()} Libamed Ltd, registered in Wales no. 17272473.
          </p>
        </div>
      </div>
    </footer>
  );
}
