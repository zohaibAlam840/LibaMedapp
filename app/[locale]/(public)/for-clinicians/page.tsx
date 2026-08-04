import { ArrowRight, BadgeCheck, Check, Clock3, HandCoins, Lock, MessageSquareText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import NumberedStepStrip from "@/components/ui/NumberedStepStrip";
import { AccordionItem } from "@/components/ui/Accordion";
import { FAQS } from "@/lib/marketing";
import { getPublishedCorridors } from "@/lib/db/corridors";

// 9A · For clinicians (spec V2 page 7): hero → benefits → GMC explainer →
// what you'll need → data handling → FAQ → CTA.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const corridors = await getPublishedCorridors();
  const base = `/${locale}`;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:px-8">
        <h1 className="max-w-2xl text-4xl font-semibold text-ink">
          Built for doctors working between patients
        </h1>
        <p className="mt-3 max-w-[60ch] text-lg text-ink-secondary">
          When the waiting list is the problem, LibaMed gives you a defensible
          route to a named specialist abroad — without adding admin to your day.
        </p>
        <Button size="lg" href={`${base}/register`} className="mt-6">
          Register — takes about 3 minutes
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Button>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-3 md:px-8">
        {[
          { icon: Clock3, title: "≤3 clicks to a new referral", text: "Guided intake, one question at a time, autosaved. Start a case in the gap between appointments." },
          { icon: MessageSquareText, title: "No email, no chasing", text: "Plans, costs, questions, and the final summary all live in the case thread — logged and auditable." },
          { icon: Lock, title: "Defensible by design", text: "Itemised consent, per-corridor data residency, and an immutable audit trail on every case." },
        ].map(({ icon: Icon, title, text }) => (
          <Card key={title} className="p-6">
            <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon aria-hidden className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{text}</p>
          </Card>
        ))}
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <div className="mb-2 flex items-center gap-2">
            <BadgeCheck aria-hidden className="size-5 text-accent" />
            <h2 className="text-2xl font-semibold text-ink">GMC verification at sign-up</h2>
          </div>
          <p className="mb-10 max-w-[60ch] text-[15px] text-ink-secondary">
            Every referrer is a verified doctor — that's the platform's first
            promise. Here's what happens when you register:
          </p>
          <NumberedStepStrip
            steps={[
              { title: "Enter your GMC number", description: "Along with your name and professional email — nothing else at this stage." },
              { title: "We check the public register", description: "Registration status, licence to practise, and a name match." },
              { title: "Usually instant", description: "If a manual review is needed, we email you within one working day." },
              { title: "Start referring", description: "Once verified, your first case is three clicks away." },
            ]}
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-ink">What you&rsquo;ll need</h2>
          <ul className="flex flex-col gap-2.5">
            {[
              "Your GMC number",
              "A professional email address",
              "Your patient's informed consent",
              "The clinical records worth sharing — letter, bloods, imaging",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="mb-3 text-lg font-semibold text-ink">
            How your patient&rsquo;s data is handled
          </h2>
          <p className="text-sm leading-relaxed text-ink-secondary">
            Records are encrypted in transit (TLS 1.3) and at rest (AES-256),
            stored in the region the destination corridor requires — France on
            HDS-certified EEA infrastructure — and visible only to the named
            specialist and their direct team. Every view, download, and export
            is logged immutably, and your patient can withdraw consent at any
            time through you.
          </p>
          <div className="mt-4 flex gap-4 text-[13px] font-medium">
            <a href={`${base}/security`} className="text-accent hover:underline">
              Security overview
            </a>
            <a href={`${base}/legal/privacy`} className="text-accent hover:underline">
              Privacy policy
            </a>
          </div>
        </Card>
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8">
          <h2 className="mb-2 text-2xl font-semibold text-ink">Referring safely, by design</h2>
          <p className="mb-8 max-w-[60ch] text-[15px] text-ink-secondary">
            Two things doctors ask us first: am I paid for this, and where does my
            patient&rsquo;s data actually go? Both answers are built into the platform.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <span className="mb-4 flex size-11 items-center justify-center rounded-full bg-success-bg text-success-text">
                <HandCoins aria-hidden className="size-5" />
              </span>
              <h3 className="text-lg font-semibold text-ink">No referrer fee — ever</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                No commission, payment, or benefit of any kind accrues to you for
                making a referral. LibaMed is paid by the receiving hospital, never by
                referral volume — so the clinical decision stays clean, and it&rsquo;s
                written into our partner contracts.
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-ink">Where each corridor sends data</h3>
              <p className="mt-1 text-[13px] text-ink-secondary">
                The legal basis for each transfer — shown to you again before you submit.
              </p>
              <ul className="mt-4 flex flex-col divide-y divide-line">
                {corridors.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-sm font-medium text-ink">{c.country}</span>
                    <span
                      className={
                        c.transferBasis === "scc"
                          ? "rounded-full bg-warning-bg px-2.5 py-0.5 text-[11px] font-semibold text-warning-text"
                          : "rounded-full bg-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-success-text"
                      }
                    >
                      {c.transferBasis === "scc" ? "Standard Contractual Clauses" : "UK adequacy"}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h2 className="mb-6 text-2xl font-semibold text-ink">Questions doctors ask</h2>
          <div className="flex flex-col gap-3">
            {FAQS.filter((f) => ["Referrals", "Data & privacy", "Access", "Costs"].includes(f.category))
              .slice(0, 8)
              .map((f) => (
                <AccordionItem key={f.q} question={f.q}>
                  {f.a}
                </AccordionItem>
              ))}
          </div>
        </div>
      </section>

      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">
            Your first referral could be this week
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
