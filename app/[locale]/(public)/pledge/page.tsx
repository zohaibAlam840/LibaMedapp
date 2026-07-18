import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { PLEDGE_COMMITMENTS } from "@/lib/marketing";

// 9A · The Pledge (spec V2 page 3): promise hero → 8 commitment cards →
// governance summary → CTA band.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 md:px-8">
        <h1 className="max-w-2xl text-4xl font-semibold text-ink">The LibaMed Pledge</h1>
        <p className="mt-3 max-w-[60ch] text-lg text-ink-secondary">
          Eight commitments, built into how the platform works — what it allows,
          what it prevents, and what it discloses. Not marketing copy: product
          behaviour.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pb-20 md:grid-cols-2 md:px-8">
        {PLEDGE_COMMITMENTS.map((c, i) => (
          <Card key={c.title} className="p-6">
            <span
              aria-hidden
              className="text-4xl font-semibold leading-none text-line-strong"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-3 text-lg font-semibold text-ink">{c.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{c.body}</p>
            {c.proof && (
              <Link
                href={`${base}${c.proof.href}`}
                className="mt-3 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
              >
                {c.proof.label}
                <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" />
              </Link>
            )}
          </Card>
        ))}
      </section>

      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
          <h2 className="text-2xl font-semibold text-ink">How we hold ourselves to it</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
            A named Clinical Director owns clinical governance. Concerns raised
            through the platform route to a monitored governance channel, are
            logged with a reference, investigated, and answered. Partner
            hospitals are reviewed against the four accreditation criteria on a
            recurring cycle — and the Pledge itself is re-reviewed every time a
            new corridor opens.
          </p>
        </div>
      </section>

      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center md:px-8">
          <h2 className="max-w-2xl text-3xl font-semibold text-white">
            A referral platform you can defend to your patients
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
