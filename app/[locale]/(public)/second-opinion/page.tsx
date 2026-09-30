import Link from "next/link";
import { ArrowRight, CalendarClock, FileText, Stethoscope, UserRoundCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { SECOND_OPINION_AREA } from "@/lib/patientInterest";

export const metadata = {
  title: "Second opinion from a Swiss tumour board",
  description:
    "A multidisciplinary tumour board in Zürich reviews your case and sends a written opinion to your own doctor. You don't travel.",
};

// B3 (change scope 2026-09-29) · the second-opinion service page.
//
// Copy is the client's, from Appendix A, used close to verbatim — it describes
// a clinical service and its prices, so it is not ours to rewrite.
//
// This page NAMES CONDITIONS, which nothing else on the public site does. That
// was a deliberate rule: naming procedures risks advertising care the NHS
// provides routinely, which the platform's own eligibility rules refuse. A
// remote second opinion is not NHS-routine and is the service being sold here,
// so naming what it covers is the point rather than a slip — but it is a
// departure, and the reason it is allowed is written down here so nobody
// "tidies" the rule away elsewhere later.
//
// Like the enquiry form, this page accepts NO files. Records go from the
// patient's own doctor to the board directly and never touch the platform.
/**
 * Tracking parameters carried across to the enquiry form.
 *
 * The form reads these from the URL at the moment someone presses send, so a
 * link that drops them loses the attribution entirely — and this page is the
 * one most likely to be the landing page of a paid campaign. Without this, an
 * ad click to /en/second-opinion?utm_campaign=X produced an enquiry with no
 * campaign at all, which is precisely the spend this page exists to report on.
 *
 * An allowlist rather than forwarding the whole query string: anything else on
 * the URL is not ours and has no business being replayed into another page.
 */
const TRACKING = ["utm_campaign", "utm_source", "utm_medium", "campaign_id", "lead_source"] as const;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const q = new URLSearchParams({ area: SECOND_OPINION_AREA });
  for (const key of TRACKING) {
    const raw = sp[key];
    const value = Array.isArray(raw) ? raw[0] : raw;
    // Capped at the same length the action stores, so a padded URL cannot be
    // used to bloat the page's own markup.
    if (value) q.set(key, value.slice(0, 120));
  }
  const enquire = `/${locale}/for-patients?${q.toString()}#enquiry`;

  const steps = [
    {
      icon: Stethoscope,
      title: "You or your doctor enquire",
      body: "Tell us briefly what the question is. Please don't send medical records to us.",
    },
    {
      icon: FileText,
      title: "Your doctor sends the records",
      body: "Your GP or consultant sends the histology report, recent scans (ideally as DICOM files), biopsy results, current medicines and treatment history directly to the tumour board.",
    },
    // Softened on the client's instruction, 1 Oct 2026: the Monday/Tuesday/
    // Wednesday rhythm is the board's normal working pattern, NOT a
    // contractual commitment. The original wording read as a guarantee on a
    // public page selling a cancer service, which is a promise nobody has
    // made. "Usually" and "normally" are load-bearing here — do not tighten
    // them back up without something contractual behind it.
    {
      icon: CalendarClock,
      title: "The board meets",
      body: "Complete records received by Monday morning (Swiss time) are usually discussed at the board meeting that Tuesday. Incomplete records or holidays can mean a later meeting.",
    },
    {
      icon: FileText,
      title: "The report comes back",
      body: "A written opinion is normally sent to your doctor the day after the meeting.",
    },
    {
      icon: UserRoundCheck,
      title: "You decide with your doctor",
      body: "Your doctor talks the report through with you. If the board suggests treatment in Switzerland, that is a separate conversation, and there is no obligation.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="max-w-[62ch]">
        <p className="text-[13px] font-medium text-accent">Second opinion</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink md:text-4xl">
          A second opinion from a Swiss cancer tumour board &mdash; arranged through your
          own doctor
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-secondary">
          If you or someone close to you has a cancer of the digestive system, liver,
          pancreas or bile ducts, a second opinion can confirm a plan or open up options.
          LibaMed arranges review of your case by a multidisciplinary tumour board in
          Z&uuml;rich: surgeons, oncologists, radiologists and pathologists who discuss
          your case together and send a written opinion back to your doctor.
        </p>
        <p className="mt-3 text-[17px] font-medium leading-relaxed text-ink">
          You don&rsquo;t travel. Your records are sent by your doctor, and the opinion
          comes back to your doctor.
        </p>
        <div className="mt-6">
          <Button size="lg" variant="accent" href={enquire}>
            Ask about a second opinion
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">Who it&rsquo;s for</h2>
        <ul className="mt-3 flex max-w-[62ch] flex-col gap-1.5 text-[15px] leading-relaxed text-ink-secondary">
          <li>
            Adults with a diagnosed cancer of the stomach, bowel, oesophagus, liver,
            pancreas or bile ducts
          </li>
          <li>
            People who want an independent view before starting, changing or stopping
            treatment
          </li>
          <li>
            People whose UK doctor is willing to send their records and receive the report
          </li>
        </ul>
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
          It is not for undiagnosed symptoms, emergencies, or replacing your NHS team.
          Your own doctor stays in charge of your care.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">How it works</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {steps.map((s, i) => (
            <Card key={s.title} className="flex flex-col gap-2">
              <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                <s.icon aria-hidden className="size-5" />
              </span>
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                Step {i + 1}
              </p>
              <h3 className="text-[17px] font-semibold text-ink">{s.title}</h3>
              <p className="text-[14px] leading-relaxed text-ink-secondary">{s.body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">What it costs</h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
          You pay each provider directly. LibaMed never holds your money.
        </p>

        <div className="mt-4 overflow-hidden rounded-panel border border-line">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-subtle text-[13px] text-ink-secondary">
              <tr>
                <th className="px-4 py-2.5 font-medium">Item</th>
                <th className="px-4 py-2.5 font-medium">Paid to</th>
                <th className="px-4 py-2.5 font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="text-ink-secondary">
              <tr className="border-t border-line">
                <td className="px-4 py-3 text-ink">Tumour board review and written report</td>
                <td className="px-4 py-3">The Z&uuml;rich tumour board</td>
                <td className="px-4 py-3 whitespace-nowrap">CHF 900 per case</td>
              </tr>
              <tr className="border-t border-line">
                <td className="px-4 py-3 text-ink">Review of your scans by a Swiss radiologist</td>
                <td className="px-4 py-3">The radiology provider</td>
                <td className="px-4 py-3 whitespace-nowrap">Up to about CHF 300</td>
              </tr>
              <tr className="border-t border-line">
                <td className="px-4 py-3 text-ink">
                  Coordination: checking records are complete, liaising with your doctor
                  and the board, keeping you updated
                </td>
                <td className="px-4 py-3">LibaMed</td>
                <td className="px-4 py-3 whitespace-nowrap">&pound;300</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* The Swiss prices are the authoritative ones: they are charged in
            francs, and a sterling total printed here would be wrong the moment
            the rate moved. Rather than bake in a figure that silently goes
            stale on a page about cancer treatment, the page promises a written
            quote — which is accurate on the day it is given. */}
        <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
          The Swiss fees are charged in francs, so the sterling equivalent moves with the
          exchange rate. You will get a written quote with the total before anything is
          booked, and you only pay once your doctor has agreed to send the records.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-ink">How LibaMed is paid</h2>
        <p className="mt-2 max-w-[62ch] text-[15px] leading-relaxed text-ink-secondary">
          We charge a fixed coordination fee of &pound;300 for this service. We receive no
          commission from the tumour board for second opinions. If you later go on to have
          treatment at a partner hospital, the hospital pays LibaMed a fee, and we will
          tell you what it is before you decide.
        </p>
      </section>

      <div className="mt-10 rounded-panel border border-line bg-subtle px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">What we can&rsquo;t do</h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink-secondary">
          <li>
            We can&rsquo;t tell you whether the second opinion is right for you &mdash;
            your doctor can.
          </li>
          <li>
            We can&rsquo;t guarantee the board will recommend a different treatment. Often
            a second opinion confirms the current plan, which is valuable too.
          </li>
          <li>
            If you need urgent help, contact your GP, call 111, or in an emergency call
            999.
          </li>
        </ul>
      </div>

      <div className="mt-10 flex flex-col items-start gap-3 rounded-panel border border-line p-6">
        <h2 className="text-xl font-semibold text-ink">Ready to ask?</h2>
        <p className="max-w-[60ch] text-[15px] leading-relaxed text-ink-secondary">
          Tell us briefly what the question is. Nothing here commits you to anything.
        </p>
        <Button size="lg" variant="accent" href={enquire}>
          Ask about a second opinion
          <ArrowRight aria-hidden className="size-4" />
        </Button>
      </div>

      <section className="mt-10 rounded-panel border border-line bg-card p-6">
        <h2 className="text-[15px] font-semibold text-ink">For clinicians</h2>
        <p className="mt-2 max-w-[68ch] text-[14px] leading-relaxed text-ink-secondary">
          Refer a patient for a multidisciplinary tumour board review in Z&uuml;rich. Send
          histology, imaging (DICOM preferred), biopsy results, medicines, comorbidities,
          family history and treatment status. Complete records by Monday morning (Swiss
          time) are usually reviewed that Tuesday; written opinion normally the following
          day. The report is addressed to you.
        </p>
        <Link
          href={`/${locale}/for-clinicians`}
          className="mt-3 inline-flex items-center gap-1 text-[14px] font-medium text-accent hover:underline"
        >
          How referrals work
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      </section>
    </div>
  );
}
