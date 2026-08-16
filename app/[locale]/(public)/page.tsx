import Link from "next/link";
import { Activity, ArrowRight, Check, Globe2, Lock, Microscope, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NumberedStepStrip from "@/components/ui/NumberedStepStrip";
import { AccordionItem } from "@/components/ui/Accordion";
import HeroPreview from "@/components/marketing/HeroPreview";
import Avatar from "@/components/ui/Avatar";
import { getDictionary } from "@/lib/dictionaries";
import { getPublishedCorridors } from "@/lib/db/corridors";
import { getFeaturedDoctors } from "@/lib/db/doctors";
import { getHospitals } from "@/lib/db/hospitals";
import CorridorCard from "@/components/marketing/CorridorCard";
import InteractiveGrid from "@/components/marketing/InteractiveGrid";

// 9A · Home (spec V2 page 1) — fully localised via the dictionary.
const VALUE_ICONS = [Stethoscope, ShieldCheck, Lock];
const SPECIALTY_ICONS = [Activity, Stethoscope, Microscope, Sparkles];
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
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden
          className="pointer-events-none absolute -end-40 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.12),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />
        {/* Lights the grid above under the cursor. Decorative — no-ops on touch
            devices and when reduced motion is requested. */}
        <InteractiveGrid />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 text-[13px] font-medium text-accent">
              <span className="size-1.5 rounded-full bg-accent" />
              {h.eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[3.25rem]">
              {h.title}
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-secondary">
              {h.subhead}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" href={`${base}/register`}>
                {h.ctaRegister}
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Button>
              <Button size="lg" variant="secondary" href={`${base}/how-it-works`}>
                {h.ctaHow}
              </Button>
            </div>

            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6">
              {h.stats.map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-semibold tracking-tight text-ink">{s.n}</dt>
                  <dd className="text-[13px] text-ink-secondary">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hidden lg:block">
            <HeroPreview />
          </div>
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

      {/* Pathway */}
      <section className="relative overflow-hidden border-y border-line bg-card">
        <InteractiveGrid />
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
        <section className="relative overflow-hidden border-y border-line bg-card">
          <InteractiveGrid />
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

      {/* Specialties — kept generic on purpose: the exhaustive list changes per
          partner hospital, so we describe the breadth rather than enumerate it. */}
      <section className="relative overflow-hidden">
        <InteractiveGrid />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-3 text-2xl font-semibold text-ink">{h.specialtiesTitle}</h2>
          <p className="max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
            {h.specialtiesLede}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {h.specialtyCategories.map((cat, i) => {
              const Icon = SPECIALTY_ICONS[i] ?? Stethoscope;
              return (
                <Card
                  key={cat.title}
                  className="flex flex-col gap-3 p-5 ring-1 ring-transparent transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-elevated hover:ring-accent-border"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                    <Icon aria-hidden className="size-5" />
                  </span>
                  <h3 className="text-[15px] font-semibold text-ink">{cat.title}</h3>
                  <p className="text-[13px] leading-relaxed text-ink-secondary">{cat.text}</p>
                </Card>
              );
            })}
          </div>

          {/* Ties the categories back to the eligibility safeguard */}
          <div className="mt-8 flex flex-col gap-3 rounded-card border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[60ch] text-[13px] leading-relaxed text-ink-secondary">
              Availability differs by destination. Each corridor page lists exactly
              what can be referred there, and what is blocked because the NHS
              provides it routinely.
            </p>
            <Button variant="secondary" size="sm" href={`${base}/corridors`} className="shrink-0">
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
        <h2 className="mb-6 text-2xl font-semibold text-ink">{h.faqTitle}</h2>
        <div className="flex flex-col gap-3">
          {h.faqs.map((f) => (
            <AccordionItem key={f.q} question={f.q}>
              {f.a}
            </AccordionItem>
          ))}
        </div>
        <Link
          href={`${base}/faq`}
          className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
        >
          {h.faqAll}
        </Link>
        </div>
      </section>

      {/* CTA band */}
      <section className="relative overflow-hidden bg-navy">
        <InteractiveGrid tone="light" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">{h.ctaTitle}</h2>
          <Button size="lg" variant="accent" href={`${base}/register`}>
            {h.ctaButton}
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        </div>
      </section>
    </div>
  );
}
