import { ArrowRight, Check, Timer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { AccordionItem } from "@/components/ui/Accordion";
import { PATHWAY_STEPS, FAQS } from "@/lib/marketing";

// 9A · How it works (spec V2 page 2): compact hero → 5 alternating step rows →
// two role columns → 5-day timeline → FAQ preview → CTA band.
const PLATFORM_NOTES = [
  "The platform verifies your GMC registration once, then keeps every case ≤3 clicks from login.",
  "Files upload encrypted, resume if interrupted, and are stored in the destination corridor's region.",
  "Routing is automatic: corridor + specialty selects the named specialist's personal queue.",
  "Plans, costs, and questions all stay in the case thread — logged, never emailed.",
  "The summary is structured, timestamped, and tracked against the 5-working-day commitment.",
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div>
      {/* Compact hero */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:px-8">
        <h1 className="max-w-2xl text-4xl font-semibold text-ink">How it works</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-ink-secondary">
          One secure loop from your clinic to a named specialist abroad and back
          — five steps, no email.
        </p>
      </section>

      {/* Alternating step rows */}
      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 md:px-8">
        {PATHWAY_STEPS.map((step, i) => (
          <div
            key={step.title}
            className={`flex flex-col gap-6 rounded-panel border border-line bg-card p-6 md:items-center md:gap-12 md:p-10 ${
              i % 2 ? "md:flex-row-reverse" : "md:flex-row"
            }`}
          >
            <div className="md:flex-1">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-[15px] font-semibold text-accent">
                {i + 1}
              </span>
              <h2 className="mt-4 text-xl font-semibold text-ink">{step.title}</h2>
              <p className="mt-2 max-w-[48ch] text-[15px] leading-relaxed text-ink-secondary">
                {step.description}
              </p>
              <p className="mt-3 flex max-w-[48ch] items-start gap-2 text-[13px] text-ink-secondary">
                <Check aria-hidden className="mt-0.5 size-3.5 shrink-0 text-accent" />
                {PLATFORM_NOTES[i]}
              </p>
            </div>
            {/* Illustrative UI card */}
            <div className="md:flex-1">
              <Card className="border border-line bg-page p-4 shadow-none">
                <div className="rounded-inner bg-card p-4 shadow-card">
                  <p className="text-xs text-ink-muted">Case LM-2026-0142</p>
                  <p className="mt-1 text-[15px] font-semibold text-ink">
                    {step.title}
                  </p>
                  <div className="mt-3">
                    <StatusChip
                      status={
                        (["submitted", "submitted", "under-review", "plan-received", "summary-returned"] as const)[i]
                      }
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ))}
      </section>

      {/* Two role columns */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-2 md:px-8">
          {[
            {
              title: "For the referring clinician",
              items: [
                "Register once — GMC verified against the public register",
                "Guided intake with autosave, between patients",
                "Live status on every case, from Submitted to Summary returned",
                "Secure messaging with the named specialist",
                "A structured summary back for continuity of care",
              ],
            },
            {
              title: "For the receiving specialist",
              items: [
                "A personal queue — never a shared inbox",
                "Full records incl. DICOM, downloadable to your PACS",
                "A structured response template: plan, itemised costs, timeline",
                "Request missing information without leaving the platform",
                "One form to hand the patient back to UK care",
              ],
            },
          ].map((col) => (
            <Card key={col.title} className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-ink">{col.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* 5-day commitment */}
      <section className="mx-auto max-w-3xl px-4 py-20 text-center md:px-8">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Timer aria-hidden className="size-5" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-ink">
          Back to UK care within 5 working days
        </h2>
        <p className="mx-auto mt-3 max-w-[55ch] text-[15px] leading-relaxed text-ink-secondary">
          When treatment completes, the clock starts. The receiving specialist's
          structured summary — treatment given, outcome, medications, follow-up —
          reaches the referring clinician within five working days. It's a
          Pledge commitment, and the platform tracks it on every case.
        </p>
      </section>

      {/* FAQ preview */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h2 className="mb-6 text-2xl font-semibold text-ink">Common questions</h2>
          <div className="flex flex-col gap-3">
            {FAQS.filter((f) => f.category === "Referrals").slice(0, 4).map((f) => (
              <AccordionItem key={f.q} question={f.q}>
                {f.a}
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">
            Ready to refer your first patient?
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
