import { AccordionItem } from "@/components/ui/Accordion";
import { FAQS, GLOSSARY } from "@/lib/marketing";

// 9A · FAQ + glossary (spec V2 page 9): category nav → grouped accordions →
// alphabetical glossary with a jump bar.
const CATEGORIES = ["About", "Referrals", "Data & privacy", "Hospitals", "Costs", "Access"] as const;

export default async function Page() {
  const letters = [...new Set(GLOSSARY.map((g) => g.term[0].toUpperCase()))].sort();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-ink">Questions &amp; glossary</h1>
        <p className="mt-2 text-[15px] text-ink-secondary">
          Plain answers, and plain-language definitions of the regulatory terms
          you&rsquo;ll meet along the way.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
        {/* Category nav */}
        <nav aria-label="FAQ categories" className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-1">
            {CATEGORIES.map((c) => (
              <a
                key={c}
                href={`#faq-${c.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                className="rounded-inner px-2.5 py-1.5 text-[13px] text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
              >
                {c}
              </a>
            ))}
            <a
              href="#glossary"
              className="mt-2 rounded-inner px-2.5 py-1.5 text-[13px] font-medium text-accent hover:bg-subtle"
            >
              Glossary
            </a>
          </div>
        </nav>

        <div className="flex flex-col gap-10">
          {CATEGORIES.map((category) => (
            <section
              key={category}
              id={`faq-${category.toLowerCase().replace(/[^a-z]+/g, "-")}`}
              className="scroll-mt-24"
            >
              <h2 className="mb-4 text-xl font-semibold text-ink">{category}</h2>
              <div className="flex flex-col gap-3">
                {FAQS.filter((f) => f.category === category).map((f) => (
                  <AccordionItem key={f.q} question={f.q}>
                    {f.a}
                  </AccordionItem>
                ))}
              </div>
            </section>
          ))}

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
    </div>
  );
}
