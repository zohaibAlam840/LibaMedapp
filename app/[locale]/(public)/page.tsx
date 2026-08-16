import Link from "next/link";
import { ArrowRight, Check, Globe2, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NumberedStepStrip from "@/components/ui/NumberedStepStrip";
import FaqRow from "@/components/marketing/FaqRow";
import SpecialtyGrid from "@/components/marketing/SpecialtyGrid";
import Avatar from "@/components/ui/Avatar";
import { getDictionary } from "@/lib/dictionaries";
import { getPublishedCorridors } from "@/lib/db/corridors";
import { getFeaturedDoctors } from "@/lib/db/doctors";
import { getHospitals } from "@/lib/db/hospitals";
import CorridorCard from "@/components/marketing/CorridorCard";
import InteractiveGrid from "@/components/marketing/InteractiveGrid";

// 9A · Home (spec V2 page 1) — fully localised via the dictionary.
const VALUE_ICONS = [Stethoscope, ShieldCheck, Lock];
const SECURITY_ICONS = [Lock, ShieldCheck, Globe2];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = getDictionary(locale);
  const h = t.home;
  // Both are admin-controlled: corridors via /admin/corridors (publish toggle),
  // featured specialists via /admin/clinicians (approve + feature).
  const corridors = await getPublishedCorridors();
  const featured = await getFeaturedDoctors(6);
  const hospitals = await getHospitals();
  const hospitalName = (id?: string) => hospitals.find((x) => x.id === id)?.name;

  return (
    <div>
      {/* Hero — two separate shapes, the dark panel carrying the copy and the
          photograph beside it, with the page background showing through the
          gap between them. Below `lg` the composition collapses and the whole
          section is simply navy, which is why the section itself is navy and
          only turns light at `lg`.

          `-mt-16 pt-16` pulls the hero up under the sticky header (h-16), which
          floats transparently over it on this page only — see PublicHeader. */}
      <section className="relative isolate -mt-16 overflow-hidden bg-navy pt-16 lg:bg-page">
        {/* Both shapes as clip paths. Two paths rather than one, offset in x, is
            what produces the gutter — a single shape could only butt the two
            together.

            Tracing the dark panel's right edge from the top, it runs:
              1 · a large rounded top-right corner (~35px),
              2 · a flat vertical drop of ~90px, which is what separates the nav
                  links from the sign-in buttons,
              3 · an S-bend inward: one curve bending left out of the vertical,
                  then a second bending back right into the diagonal, meeting
                  tangent-to-tangent so the inflection reads as one motion,
              4 · a long straight diagonal down and to the RIGHT, and
              5 · a convex sweep into a large rounded bottom-right corner.

            The photo path is the same sequence shifted +0.0083 in x — about 12px
            — and that offset IS the gutter. Because the edge is predominantly
            vertical, a constant horizontal offset yields a near-constant
            perpendicular gap (12px on the vertical run, ~11.8px on the
            diagonal), which is why this shape holds its gutter better than a
            steep one.

            Units are objectBoundingBox, NOT `clip-path: path()`. `path()` takes
            fixed user units and does not scale with its element, so it cannot
            drive a fluid full-width hero; these fractions can. The trade-off is
            that the corner arcs render as ellipses rather than true circles. */}
        <svg aria-hidden className="pointer-events-none absolute size-0">
          <defs>
            <clipPath id="hero-panel" clipPathUnits="objectBoundingBox">
              <path d="M0,0 L0.6057,0 C0.6191,0 0.63,0.018 0.63,0.0398 L0.63,0.1 C0.63,0.133 0.612,0.15 0.606,0.18 C0.6008,0.206 0.5972,0.221 0.6,0.245 L0.685,0.9602 C0.685,0.9822 0.6716,1 0.6607,1 L0,1 Z" />
            </clipPath>
            <clipPath id="hero-photo" clipPathUnits="objectBoundingBox">
              <path d="M0.614,0 C0.6274,0 0.6383,0.018 0.6383,0.0398 L0.6383,0.1 C0.6383,0.133 0.6203,0.15 0.6143,0.18 C0.6091,0.206 0.6055,0.221 0.6083,0.245 L0.6933,0.9602 C0.6933,0.9822 0.6799,1 0.669,1 L1,1 L1,0 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* Desktop composition. Purely background layers so both shapes can
            bleed to the section edges; the grid below only holds the copy. The
            whole layer is mirrored under RTL (he) so the shapes lean the
            correct way and the dark panel stays behind the text. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden lg:block rtl:-scale-x-100"
        >
          <div className="absolute inset-0 bg-navy [clip-path:url(#hero-panel)]">
            <div className="absolute -start-40 -top-32 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.30),transparent_65%)]" />
          </div>

          {/* The clip is measured against the whole section (that is what its
              objectBoundingBox coordinates refer to), but the image must only
              fill the band the clip actually reveals — stretched across the
              full width it would be scaled up and cropped to a detail. */}
          <div className="absolute inset-0 [clip-path:url(#hero-photo)]">
            {/* Physical `right-0`, not logical `end-0`: this sits inside a layer
                whose RTL mirroring is already done by the transform above, and a
                logical property would flip it a second time — leaving the image
                and the clip on opposite sides, with only a sliver of overlap. */}
            <div className="absolute inset-y-0 right-0 w-[45%] overflow-hidden">
              {/* The outer layer is mirrored for RTL; this counter-flip keeps
                  the photograph itself the right way round. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-clinicians.jpg"
                alt=""
                className="size-full object-cover object-center rtl:-scale-x-100"
              />
              {/* A little navy in the shadows, so the photograph reads as part
                  of the same composition as the panel across the gap. */}
              <div className="absolute inset-0 bg-linear-to-r from-navy/45 via-navy/5 to-transparent" />
            </div>
          </div>
        </div>

        {/* Mobile: no panels, so the glow goes straight on the section. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -start-40 -top-32 size-[620px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.30),transparent_65%)] lg:hidden"
        />
        {/* Lights the dot grid under the cursor. Decorative — no-ops on touch
            devices and when reduced motion is requested. Clipped to the dark
            panel from `lg`, or the dots speckle the photograph. */}
        <InteractiveGrid tone="light" className="lg:[clip-path:url(#hero-panel)]" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.02fr_0.98fr] lg:py-28">
          <div>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-[3.5rem]">
              {h.title}
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-white/70">
              {h.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" variant="accent" href={`${base}/register`}>
                {h.ctaRegister}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Button>
              <Button size="lg" variant="inverse" href={`${base}/how-it-works`}>
                {h.ctaHow}
              </Button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/15 pt-6">
              {h.stats.map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-semibold tracking-tight text-white">{s.n}</dt>
                  <dd className="text-[13px] text-white/60">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Spacer only. The photograph is the background layer above so it can
              bleed to the section edges; this column just holds the copy in the
              left half and sets the hero's minimum height. */}
          <div aria-hidden className="hidden lg:block lg:min-h-[440px]" />
        </div>
      </section>

      {/* Value cards */}
      <section className="relative overflow-hidden">
        <InteractiveGrid />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {h.values.map((v, i) => {
            const Icon = VALUE_ICONS[i] ?? Stethoscope;
            return (
              <Card
                key={v.title}
                className="p-6 ring-1 ring-transparent transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-elevated hover:ring-accent-border"
              >
                <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Icon aria-hidden className="size-5.5" />
                </span>
                <h2 className="text-lg font-semibold text-ink">{v.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{v.text}</p>
              </Card>
            );
          })}
        </div>
        </div>
      </section>

      {/* Pathway — navy band (see .section-invert in globals.css: the tokens
          flip, the markup below is unchanged) */}
      <section className="section-invert relative isolate overflow-hidden bg-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute -start-32 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.28),transparent_65%)]"
        />
        <InteractiveGrid tone="light" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-2 text-2xl font-semibold text-ink">{h.pathwayTitle}</h2>
          <p className="mb-10 max-w-[60ch] text-[15px] text-ink-secondary">{h.pathwayLede}</p>
          <NumberedStepStrip
            steps={h.pathway.map((s) => ({ title: s.title, description: s.description }))}
          />
        </div>
      </section>

      {/* Corridor band */}
      <section className="relative overflow-hidden">
        <InteractiveGrid />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="mb-2 text-2xl font-semibold text-ink">{h.corridorsTitle}</h2>
        <p className="mb-8 max-w-[60ch] text-[15px] text-ink-secondary">{h.corridorsLede}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {corridors.map((c) => (
            <CorridorCard
              key={c.id}
              corridor={c}
              hospitalName={hospitalName(c.primaryHospitalId)}
              locale={locale}
            />
          ))}
        </div>
        <Button variant="secondary" href={`${base}/corridors`} className="mt-6">
          {h.corridorsCta}
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Button>
        </div>
      </section>

      {/* Featured specialists — admin-curated from /admin/clinicians */}
      {featured.length > 0 && (
        <section className="section-invert relative isolate overflow-hidden bg-navy">
          <div
            aria-hidden
            className="pointer-events-none absolute -end-32 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.28),transparent_65%)]"
          />
          <InteractiveGrid tone="light" />
          <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
            <h2 className="mb-2 text-2xl font-semibold text-ink">Specialists you can be referred to</h2>
            <p className="mb-8 max-w-[60ch] text-[15px] text-ink-secondary">
              Every referral goes to a named consultant at a partner hospital — never a general inbox.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((d) => (
                <Card key={d.id} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={d.name} size="lg" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">{d.name}</p>
                      <p className="truncate text-[13px] text-ink-secondary">{d.role}</p>
                    </div>
                  </div>
                  {d.bio && <p className="text-[13px] leading-relaxed text-ink-secondary">{d.bio}</p>}
                  {d.hospitalName && (
                    <p className="mt-auto text-[13px] font-medium text-ink-secondary">{d.hospitalName}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pledge teaser */}
      <section className="relative overflow-hidden border-y border-line bg-card">
        <InteractiveGrid />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-ink">{h.pledgeTitle}</h2>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-ink-secondary">
              {h.pledgeBody}
            </p>
            <Button variant="secondary" href={`${base}/pledge`} className="mt-6">
              {h.pledgeCta}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
          </div>
          <ul className="grid content-start gap-2.5">
            {h.pledgeItems.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Specialties — navy band */}
      <section className="section-invert relative isolate overflow-hidden bg-navy">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-32 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.28),transparent_65%)]"
        />
        <InteractiveGrid tone="light" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {h.specialtiesTitle}
          </h2>
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
            {h.specialtiesLede}
          </p>

          <SpecialtyGrid items={h.specialtyCategories} tone="dark" className="mt-8" />

          {/* Ties the categories back to the eligibility safeguard */}
          <div className="mt-8 flex flex-col gap-3 rounded-card border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[60ch] text-[13px] leading-relaxed text-ink-secondary">
              Availability differs by destination. Each corridor page lists exactly
              what can be referred there, and what is blocked because the NHS
              provides it routinely.
            </p>
            <Button variant="inverse" size="sm" href={`${base}/corridors`} className="shrink-0">
              {h.corridorsCta}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="relative overflow-hidden border-y border-line bg-card">
        <InteractiveGrid />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-3 text-2xl font-semibold text-ink">{h.securityTitle}</h2>
          <p className="mb-8 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
            {h.securityLede}
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            {h.security.map((fact, i) => {
              const Icon = SECURITY_ICONS[i] ?? ShieldCheck;
              return (
                <div
                  key={fact}
                  className="flex items-start gap-3 rounded-card border border-line bg-page p-5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Icon aria-hidden className="size-4.5" />
                  </span>
                  <p className="text-[15px] font-medium leading-snug text-ink">{fact}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-6">
            <p className="text-[13px] text-ink-secondary">
              Every view, download and export is written to a tamper-evident audit trail.
            </p>
            <Link
              href={`${base}/security`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {h.securityLink}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="relative overflow-hidden">
        <InteractiveGrid />
        <div className="relative mx-auto max-w-3xl px-4 py-20 md:px-8">
          {/* Same rows as the FAQ page (see FaqRow) so the preview and the full
              page read as one thing. */}
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight text-ink md:text-3xl">
            {h.faqTitle}
          </h2>
          <div className="flex flex-col divide-y divide-line border-y border-line">
            {h.faqs.map((f) => (
              <FaqRow key={f.q} question={f.q}>
                {f.a}
              </FaqRow>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href={`${base}/faq`}
              className="text-sm font-medium text-accent hover:underline"
            >
              {h.faqAll}
            </Link>
          </div>
        </div>
      </section>

      {/* The closing CTA now lives in PublicFooter, so it ends every public
          page rather than only this one. */}
    </div>
  );
}
