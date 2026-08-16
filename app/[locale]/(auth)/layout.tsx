import Link from "next/link";
import { Card } from "@/components/ui/Card";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";

// Auth layout: a brand panel carrying the animated illustration beside the
// form card. Below `lg` the panel drops away entirely and it returns to the
// single centred column from the design spec (§6) — the illustration is
// decoration, and on a phone the form should own the screen.
//
// The panel is a LIGHT ground on purpose. The illustration is line art with
// dark outlines, so on navy its outlines would disappear into the background.

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-dvh">
      <aside className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden border-e border-line bg-linear-to-br from-accent-soft via-page to-card p-10 lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <Link
          href={`/${locale}`}
          className="relative flex w-fit items-center gap-2.5 text-xl font-semibold text-ink"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
            LM
          </span>
          LibaMed
        </Link>

        {/* The SVG's motion is SMIL — declarative, so it plays inside an <img>
            with no script. next/image is deliberately not used: it would
            rasterise this and the animation would be lost. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/doctor-check.svg"
          alt=""
          aria-hidden
          className="relative mx-auto w-full max-w-[420px]"
        />

        <p className="relative max-w-[42ch] text-[13px] leading-relaxed text-ink-secondary">
          Clinician-to-clinician referrals only. Patient data is encrypted in
          transit and at rest, and every access is logged.
        </p>
      </aside>

      <div className="relative flex flex-1 flex-col items-center justify-center p-4">
        <div className="absolute end-4 top-4">
          <LocaleSwitcher current={locale} />
        </div>

        {/* Only when the brand panel is not carrying the logo */}
        <Link
          href={`/${locale}`}
          className="mb-6 flex items-center gap-2.5 text-xl font-semibold text-ink lg:hidden"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
            LM
          </span>
          LibaMed
        </Link>

        <Card className="w-full max-w-md p-6 sm:p-8">{children}</Card>

        <p className="mt-6 max-w-md text-center text-xs text-ink-muted lg:hidden">
          Clinician-to-clinician referrals only. Patient data is encrypted in
          transit and at rest, and every access is logged.
        </p>
      </div>
    </div>
  );
}
