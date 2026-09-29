import Link from "next/link";
import { HeartHandshake, ShieldCheck, Stethoscope, UserRoundCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PatientEnquiryForm from "@/components/marketing/PatientEnquiryForm";
import { getDestinationOptions } from "@/lib/db/destinations";

export const metadata = {
  title: "For patients",
  description:
    "How LibaMed works for patients: your own doctor leads, and we help find specialist care abroad.",
};

// Phase 2a · the patient-facing entry point.
//
// The copy is deliberately unspecific about procedures. Naming hip or knee
// replacement would advertise exactly the treatments the platform's eligibility
// rules block as NHS-routine, so this stays at the level the rules allow:
// specialist treatment, second opinions, and care outside the NHS pathway.
//
// It also does not promise a referral. Everything here leads to one enquiry
// form, and the pathway section says in plain words that a clinician decides.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ area?: string }>;
}) {
  const { locale } = await params;
  // ?area= is how /en/second-opinion sends someone here with the right area of
  // care already chosen. It is validated against the offered list in the
  // action either way, so a hand-edited value cannot store anything odd.
  const { area } = await searchParams;
  const destinations = await getDestinationOptions();

  const steps = [
    {
      icon: HeartHandshake,
      title: "You tell us what you're looking for",
      body: "A short enquiry — no medical records, no forms to chase. Just the outline of what you need and where you are.",
    },
    {
      icon: Stethoscope,
      title: "We talk to your doctor, not around them",
      body: "Care abroad only happens on a doctor's referral. If what you need fits, we work with your GP or consultant to arrange it properly.",
    },
    {
      icon: UserRoundCheck,
      title: "A named specialist, not an inbox",
      body: "Your case goes to a named consultant at a partner hospital — never a general enquiry address — and your own doctor stays in the loop throughout.",
    },
    {
      icon: ShieldCheck,
      title: "Your records come back to the NHS",
      body: "A structured summary of your treatment is returned to your doctor, so your care here continues where it left off.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="max-w-[60ch]">
        <p className="text-[13px] font-medium text-accent">For patients</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink md:text-4xl">
          Specialist care abroad, arranged through your own doctor
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-secondary">
          Some people need specialist treatment, a second opinion, or care that sits
          outside the NHS pathway. LibaMed helps arrange that with hospitals abroad —
          but always through a UK-registered clinician, never around one.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {steps.map((s, i) => (
          <Card key={s.title} className="flex flex-col gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
              <s.icon aria-hidden className="size-5" />
            </span>
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">
              Step {i + 1}
            </p>
            <h2 className="text-[17px] font-semibold text-ink">{s.title}</h2>
            <p className="text-[14px] leading-relaxed text-ink-secondary">{s.body}</p>
          </Card>
        ))}
      </div>

      {/* Signposted before the form: someone whose question is specifically a
          cancer second opinion is better served by that page's detail than by
          a general enquiry, and sending them there first saves a round trip. */}
      <div className="mt-8 flex flex-col items-start gap-2 rounded-panel border border-line bg-card px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">
          Looking for a cancer second opinion?
        </h2>
        <p className="max-w-[62ch] text-[14px] leading-relaxed text-ink-secondary">
          We arrange review of digestive, liver, pancreatic and bile-duct cancer cases by
          a multidisciplinary tumour board in Z&uuml;rich, with a written opinion sent
          back to your own doctor. You don&rsquo;t travel.
        </p>
        <Link
          href={`/${locale}/second-opinion`}
          className="text-[14px] font-medium text-accent hover:underline"
        >
          How second opinions work
        </Link>
      </div>

      {/* Said before the form rather than after it, because someone who should
          be going to their GP instead should find that out before typing. */}
      <div className="mt-8 rounded-panel border border-line bg-subtle px-5 py-4">
        <h2 className="text-[15px] font-semibold text-ink">What we can&rsquo;t do</h2>
        <ul className="mt-2 flex flex-col gap-1.5 text-[14px] leading-relaxed text-ink-secondary">
          <li>
            We can&rsquo;t give medical advice, diagnose anything, or tell you whether a
            treatment is right for you. Only a clinician who knows your history can.
          </li>
          <li>
            We can&rsquo;t arrange care that the NHS already provides routinely — that
            belongs with your NHS team.
          </li>
          <li>
            We can&rsquo;t help in an emergency. If you need urgent help, contact your GP,
            call 111, or in an emergency call 999.
          </li>
        </ul>
      </div>

      <div className="mt-12 max-w-2xl" id="enquiry">
        <h2 className="text-2xl font-semibold text-ink">Tell us what you&rsquo;re looking for</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-secondary">
          A few details are enough to start. Nothing here commits you to anything, and we
          won&rsquo;t contact your doctor without asking you first.
        </p>
        <div className="mt-6">
          <PatientEnquiryForm destinations={destinations} presetArea={area} />
        </div>
      </div>

      <p className="mt-10 border-t border-line pt-6 text-[13px] text-ink-secondary">
        Are you a clinician?{" "}
        <Link
          href={`/${locale}/for-clinicians`}
          className="font-medium text-accent hover:underline"
        >
          See how referrals work
        </Link>
        .
      </p>
    </div>
  );
}
