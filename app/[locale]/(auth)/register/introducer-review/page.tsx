import Link from "next/link";
import { Clock, FileEdit, LifeBuoy, ShieldCheck } from "lucide-react";
import Button from "@/components/ui/Button";

// 9B · Introducer post-submit — "under review" (pending) state. Introducer
// verification never hard-rejects (unlike the GMC gate): FCA-regulated accounts
// attempt an automated register lookup and may verify instantly, otherwise this
// pending state applies; employer-verified always lands here for manual review.
//
// The real state machine (verified / pending / declined) + draft-only case
// gating live in the backend; this page represents the pending outcome.
//
// ⚠️ SLA COPY: "a few business days" is a placeholder — confirm the exact number
// with ops before this ships (the client flagged this).
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status } = await searchParams;
  const isFca = status === "fca";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center text-center">
        <span className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Clock aria-hidden className="size-6" />
        </span>
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-warning-bg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-warning-text">
          Under review
        </span>
        <h1 className="text-2xl font-semibold text-ink">Account created — you’re under review</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
          {isFca
            ? "We’re checking your FCA authorisation number against the public register. Most checks clear quickly; if yours needs a manual look, we’ll email you."
            : "Because you registered as employer-verified, one of our team will confirm your company and job title."}
        </p>
      </div>

      {/* Review-window banner (SLA number pending from ops) */}
      <div className="rounded-inner bg-subtle p-3.5 text-center text-[13px] text-ink-secondary">
        Your account is under review — expected within{" "}
        <b className="font-medium text-ink">a few business days</b>.
      </div>

      {/* What you can do meanwhile */}
      <ul className="flex flex-col gap-3">
        <li className="flex items-start gap-2.5 text-sm text-ink">
          <FileEdit aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          You can sign in now and start a case in <b className="font-medium">draft</b> — you’ll
          be able to submit it once your account is verified.
        </li>
        <li className="flex items-start gap-2.5 text-sm text-ink">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          Every case you originate is co-signed by a UK-registered clinician before it
          proceeds — verification only controls whether you can submit, not the clinical decision.
        </li>
        <li className="flex items-start gap-2.5 text-sm text-ink">
          <LifeBuoy aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          If we can’t confirm your details, we’ll get in touch — it’s never an automatic
          rejection. Reach us at{" "}
          <a href="mailto:support@libamed.co.uk" className="font-medium text-accent hover:underline">
            support@libamed.co.uk
          </a>
          .
        </li>
      </ul>

      <Button href={`/${locale}/login`} className="w-full">
        Go to sign in
      </Button>

      <p className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        Registered by mistake?{" "}
        <Link href={`/${locale}/register`} className="font-medium text-accent hover:underline">
          Back to register
        </Link>
      </p>
    </div>
  );
}
