import Link from "next/link";
import { ArrowRight, Check, Lock, ShieldCheck, Stethoscope } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import NumberedStepStrip from "@/components/ui/NumberedStepStrip";
import { CorridorBadge, FactPill } from "@/components/ui/Badges";
import { AccordionItem } from "@/components/ui/Accordion";
import HeroPreview from "@/components/marketing/HeroPreview";
import { DEMO_HOSPITALS } from "@/lib/demo";
import { getDictionary } from "@/lib/dictionaries";

// 9A · Home (spec V2 page 1) — fully localised via the dictionary.
const VALUE_ICONS = [Stethoscope, ShieldCheck, Lock];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const t = getDictionary(locale);
  const h = t.home;

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
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
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
      </section>

      {/* Pathway */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-2 text-2xl font-semibold text-ink">{h.pathwayTitle}</h2>
          <p className="mb-10 max-w-[60ch] text-[15px] text-ink-secondary">{h.pathwayLede}</p>
          <NumberedStepStrip
            steps={h.pathway.map((s) => ({ title: s.title, description: s.description }))}
          />
        </div>
      </section>

      {/* Corridor band */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="mb-2 text-2xl font-semibold text-ink">{h.corridorsTitle}</h2>
        <p className="mb-8 max-w-[60ch] text-[15px] text-ink-secondary">{h.corridorsLede}</p>
        <div className="flex flex-wrap gap-3">
          <CorridorBadge code="IL" label="UK → Israel" />
          <CorridorBadge code="FR" label="UK → France" residency="EEA · HDS" />
          <CorridorBadge code="TR" label="UK → Turkey" />
          <CorridorBadge code="CH" label="UK → Switzerland" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {DEMO_HOSPITALS.filter((hosp) => hosp.published).map((hosp) => (
            <Link
              key={hosp.id}
              href={`${base}/hospitals/${hosp.id}`}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              {hosp.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Pledge teaser */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
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

      {/* Specialties preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink">{h.specialtiesTitle}</h2>
          <Link
            href={`${base}/specialties`}
            className="text-sm font-medium text-accent hover:underline"
          >
            {h.viewAll}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Oncology", "Orthopedics", "Fertility", "Cardiology", "Neurosurgery", "Transplantation", "Reconstructive surgery", "Thoracic surgery"].map(
            (s) => (
              <Chip key={s} variant="outline">
                {s}
              </Chip>
            ),
          )}
        </div>
      </section>

      {/* Security strip */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-10 md:px-8">
          {h.security.map((fact) => (
            <FactPill key={fact}>{fact}</FactPill>
          ))}
          <Link
            href={`${base}/security`}
            className="text-sm font-medium text-accent hover:underline"
          >
            {h.securityLink}
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8">
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
      </section>

      {/* CTA band */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
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
