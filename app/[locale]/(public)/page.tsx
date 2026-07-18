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
import { PATHWAY_STEPS, PLEDGE_COMMITMENTS, FAQS } from "@/lib/marketing";

// 9A · Home (spec V2 page 1): hero → value cards → pathway → corridor band →
// pledge teaser → specialties → security strip → FAQ preview → CTA band.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        {/* Subtle layered background — gradient wash + dotted grid, no photos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -end-40 -top-40 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(59,130,214,0.12),transparent_60%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.5] [background-image:radial-gradient(var(--color-line)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-8 md:py-24 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left: copy */}
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent-border bg-accent-soft px-3.5 py-1.5 text-[13px] font-medium text-accent">
              <span className="size-1.5 rounded-full bg-accent" />
              Clinician-to-clinician referrals only
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-ink md:text-5xl lg:text-[3.25rem]">
              International referrals, without leaving your patient&rsquo;s side
            </h1>
            <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-ink-secondary">
              Refer to a named specialist at an accredited hospital abroad — with
              consent, security, and a structured summary back to UK care. No
              email, ever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" href={`${base}/register`}>
                Register as a clinician
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Button>
              <Button size="lg" variant="secondary" href={`${base}/how-it-works`}>
                How it works
              </Button>
            </div>

            {/* Trust stats */}
            <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 border-t border-line pt-6">
              {[
                { n: "4", l: "live corridors" },
                { n: "5-day", l: "care handback" },
                { n: "100%", l: "clinician-led" },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="text-2xl font-semibold tracking-tight text-ink">{s.n}</dt>
                  <dd className="text-[13px] text-ink-secondary">{s.l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right: product preview */}
          <div className="hidden lg:block">
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Value cards */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Stethoscope,
              title: "Clinician-led, always",
              text: "Only a verified referring doctor can create a case. Patients never book treatment through LibaMed.",
            },
            {
              icon: ShieldCheck,
              title: "Named specialists, vetted hospitals",
              text: "Every referral goes to a named receiving specialist at an accredited partner hospital — never a general inbox.",
            },
            {
              icon: Lock,
              title: "Protected to the stricter standard",
              text: "Records are encrypted and stored under the stricter of both countries' rules — including HDS-certified hosting for France.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <Card
              key={title}
              className="p-6 ring-1 ring-transparent transition-all duration-150 ease-out hover:-translate-y-1 hover:shadow-elevated hover:ring-accent-border"
            >
              <span className="mb-5 flex size-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                <Icon aria-hidden className="size-5.5" />
              </span>
              <h2 className="text-lg font-semibold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pathway */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-2 text-2xl font-semibold text-ink">
            One loop, start to finish
          </h2>
          <p className="mb-10 max-w-[60ch] text-[15px] text-ink-secondary">
            The whole referral happens in one place — no email threads, no
            couriered discs, no chasing.
          </p>
          <NumberedStepStrip steps={PATHWAY_STEPS} />
        </div>
      </section>

      {/* Corridor band */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <h2 className="mb-2 text-2xl font-semibold text-ink">Four corridors at launch</h2>
        <p className="mb-8 max-w-[60ch] text-[15px] text-ink-secondary">
          Each corridor carries its own data-protection rules, applied
          automatically to every case.
        </p>
        <div className="flex flex-wrap gap-3">
          <CorridorBadge code="IL" label="UK → Israel" />
          <CorridorBadge code="FR" label="UK → France" residency="EEA · HDS" />
          <CorridorBadge code="TR" label="UK → Turkey" />
          <CorridorBadge code="CH" label="UK → Switzerland" />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {DEMO_HOSPITALS.map((h) => (
            <Link
              key={h.id}
              href={`${base}/hospitals/${h.id}`}
              className="rounded-full border border-line bg-card px-4 py-2 text-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              {h.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Pledge teaser */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-2 md:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-ink">The LibaMed Pledge</h2>
            <p className="mt-3 max-w-[50ch] text-[15px] leading-relaxed text-ink-secondary">
              Eight commitments the platform is built to keep — from four-stage
              hospital vetting to cost transparency and a guaranteed handback to
              UK care.
            </p>
            <Button variant="secondary" href={`${base}/pledge`} className="mt-6">
              Read the full Pledge
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
          </div>
          <ul className="grid content-start gap-2.5">
            {PLEDGE_COMMITMENTS.map((c) => (
              <li key={c.title} className="flex items-start gap-2.5 text-sm text-ink">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                {c.title}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Specialties preview */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-ink">Specialties</h2>
          <Link
            href={`${base}/specialties`}
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
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
          <FactPill>AES-256 encryption at rest</FactPill>
          <FactPill>TLS 1.3 in transit</FactPill>
          <FactPill>HDS-certified EEA hosting for France</FactPill>
          <Link
            href={`${base}/security`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Security overview
          </Link>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="mx-auto max-w-3xl px-4 py-20 md:px-8">
        <h2 className="mb-6 text-2xl font-semibold text-ink">Common questions</h2>
        <div className="flex flex-col gap-3">
          {FAQS.slice(0, 4).map((f) => (
            <AccordionItem key={f.q} question={f.q}>
              {f.a}
            </AccordionItem>
          ))}
        </div>
        <Link
          href={`${base}/faq`}
          className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
        >
          All questions &amp; glossary
        </Link>
      </section>

      {/* CTA band */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">
            Give your patient options beyond the waiting list
          </h2>
          <Button size="lg" variant="accent" href={`${base}/register`}>
            Register as a clinician
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        </div>
      </section>
    </div>
  );
}
