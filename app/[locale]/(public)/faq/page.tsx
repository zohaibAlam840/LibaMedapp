import Link from "next/link";
import FaqBrowser from "@/components/marketing/FaqBrowser";
import { FAQS, GLOSSARY } from "@/lib/marketing";

// 9A · FAQ + glossary (spec V2 page 9): a centred column — pill-filtered
// questions, then the alphabetical glossary with a jump bar.
const CATEGORIES = ["About", "Referrals", "Data & privacy", "Hospitals", "Costs", "Access"];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const letters = [...new Set(GLOSSARY.map((g) => g.term[0].toUpperCase()))].sort();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-20">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Frequently asked questions
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-ink-secondary">
          Plain answers about how referrals work, and plain-language definitions
          of the regulatory terms you&rsquo;ll meet along the way. Can&rsquo;t
          find what you&rsquo;re looking for?{" "}
          <Link
            href={`/${locale}/contact`}
            className="font-medium text-accent underline underline-offset-2 hover:no-underline"
          >
            Get in touch
          </Link>
          .
        </p>
      </div>

      <FaqBrowser categories={CATEGORIES} faqs={FAQS} />

      <div className="flex flex-col gap-10 pt-16">
        {/* Glossary */}
        <section id="glossary" className="scroll-mt-24">
            <h2 className="mb-3 text-xl font-semibold text-ink">Glossary</h2>
            <nav aria-label="Glossary A to Z" className="mb-5 flex flex-wrap gap-1.5">
              {letters.map((l) => (
                <a
                  key={l}
                  href={`#g-${l}`}
                  className="flex size-8 items-center justify-center rounded-full bg-subtle text-[13px] font-medium text-ink-secondary transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {l}
                </a>
              ))}
            </nav>
            <dl className="flex flex-col gap-4">
              {GLOSSARY.sort((a, b) => a.term.localeCompare(b.term)).map((g, i, arr) => {
                const letter = g.term[0].toUpperCase();
                const first = i === 0 || arr[i - 1].term[0].toUpperCase() !== letter;
                return (
                  <div
                    key={g.term}
                    id={first ? `g-${letter}` : undefined}
                    className="scroll-mt-24 rounded-card border border-line bg-card p-4"
                  >
                    <dt className="text-[15px] font-semibold text-ink">{g.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-ink-secondary">
                      {g.def}
                    </dd>
                  </div>
                );
              })}
            </dl>
        </section>
      </div>
    </div>
  );
}
