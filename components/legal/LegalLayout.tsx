import { TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface LegalSection {
  id: string;
  heading: string;
  children: React.ReactNode;
}

/**
 * Shared legal-page layout (design spec V2 §Part 3, pages 10–16): title,
 * last-updated + version, a DRAFT banner, sticky table-of-contents rail on
 * desktop, numbered sections capped ~70ch, and a contact footer.
 */
export default function LegalLayout({
  title,
  updated,
  version,
  sections,
  locale,
}: {
  title: string;
  updated: string;
  version: string;
  sections: LegalSection[];
  locale: string;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8">
      <header className="mb-6 max-w-[70ch]">
        <h1 className="text-3xl font-semibold text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-secondary">
          Last updated {updated} · version {version}
        </p>
      </header>

      <p className="mb-8 flex max-w-[70ch] items-start gap-2.5 rounded-inner bg-warning-bg px-4 py-3 text-[13px] font-medium text-warning-text">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        Draft — pending legal review. This wording is a working placeholder and
        must be approved by counsel for each corridor before launch.
      </p>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* TOC rail */}
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="mb-2 text-[13px] font-medium text-ink-secondary">
              On this page
            </p>
            <ol className="flex flex-col gap-1">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block rounded-inner px-2.5 py-1.5 text-[13px] text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
                  >
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        {/* Body */}
        <div className="flex max-w-[70ch] flex-col gap-8">
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="mb-3 text-xl font-semibold text-ink">
                {i + 1}. {s.heading}
              </h2>
              <div className="flex flex-col gap-3 text-[15px] leading-relaxed text-ink-secondary [&_strong]:text-ink">
                {s.children}
              </div>
            </section>
          ))}

          <Card className="mt-2">
            <p className="text-sm text-ink-secondary">
              Questions about this document? Contact{" "}
              <a
                href={`/${locale}/contact`}
                className="font-medium text-accent hover:underline"
              >
                LibaMed Ltd, Cardiff, Wales
              </a>{" "}
              — we aim to respond within two working days.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
