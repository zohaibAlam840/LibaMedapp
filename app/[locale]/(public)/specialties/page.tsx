import { ArrowRight, Hourglass } from "lucide-react";
import Button from "@/components/ui/Button";
import SpecialtyGrid from "@/components/marketing/SpecialtyGrid";
import { getDictionary } from "@/lib/dictionaries";

// 9A · Specialties. The searchable directory is intentionally deferred — the
// specialty list changes per partner hospital, and the checkable per-corridor
// lists already live on the corridor pages. So rather than a bare "coming soon"
// screen, this shows the four categories (the same grid the home page uses) and
// is honest about what is still being built.
//
// Categories come from the `home` dictionary: they are the same four strings,
// already translated into fr/tr/he, and duplicating them under a new key would
// mean four more translations to keep in sync.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const h = getDictionary(locale).home;

  return (
    <div>
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            {h.specialtiesTitle}
          </h1>
          <p className="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink-secondary">
            {h.specialtiesLede}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        <SpecialtyGrid items={h.specialtyCategories} />

        {/* What is genuinely not built yet, said plainly rather than as a
            full-page "coming soon" that gives the visitor nothing. */}
        <div className="mt-10 flex flex-col gap-5 rounded-panel border border-line bg-card p-6 md:flex-row md:items-center md:gap-8 md:p-8">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Hourglass aria-hidden className="size-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-ink">
              The searchable directory is still being built
            </h2>
            <p className="mt-1.5 max-w-[64ch] text-sm leading-relaxed text-ink-secondary">
              Availability differs by destination, so the authoritative list lives
              on each corridor page — including what is blocked because the NHS
              provides it routinely. If you have a specific case in mind, ask us
              and we&rsquo;ll tell you whether it can be referred.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:shrink-0">
            <Button href={`${base}/corridors`}>
              {h.corridorsCta}
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
            <Button variant="secondary" href={`${base}/contact`}>
              Ask about a case
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
