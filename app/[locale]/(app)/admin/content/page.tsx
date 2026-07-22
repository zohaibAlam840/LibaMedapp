import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FAQS, GLOSSARY } from "@/lib/marketing";

// 9E · Help & glossary management (admin). The public /faq page is content —
// admins own it here without a developer. Editing is a stub until the content
// store lands; the structure mirrors the public page 1:1.
const CATEGORIES = ["About", "Referrals", "Data & privacy", "Hospitals", "Costs", "Access"] as const;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Help &amp; glossary</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            The public help page — questions and plain-language definitions.
            Edit here; changes publish to the Help &amp; glossary page.
          </p>
        </div>
        <Link
          href={`/${locale}/faq`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          Preview public page
          <ExternalLink aria-hidden className="size-4" />
        </Link>
      </div>

      {/* Questions */}
      <Card>
        <CardTitle
          action={
            <Button size="sm">
              <Plus aria-hidden className="size-4" /> Add question
            </Button>
          }
        >
          Questions · {FAQS.length}
        </CardTitle>
        <div className="flex flex-col gap-5">
          {CATEGORIES.map((category) => {
            const items = FAQS.filter((f) => f.category === category);
            return (
              <div key={category}>
                <SectionLabel className="mb-2">
                  {category} · {items.length}
                </SectionLabel>
                <div className="divide-y divide-line rounded-card border border-line">
                  {items.map((f) => (
                    <div key={f.q} className="flex items-start gap-3 p-3.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium text-ink">{f.q}</p>
                        <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-secondary">
                          {f.a}
                        </p>
                      </div>
                      <button className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft">
                        <Pencil aria-hidden className="size-3.5" />
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Glossary */}
      <Card>
        <CardTitle
          action={
            <Button variant="secondary" size="sm">
              <Plus aria-hidden className="size-4" /> Add term
            </Button>
          }
        >
          Glossary · {GLOSSARY.length}
        </CardTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-inner border border-line p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[15px] font-semibold text-ink">{g.term}</p>
                <button
                  aria-label={`Edit ${g.term}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-medium text-accent transition-colors hover:bg-accent-soft"
                >
                  <Pencil aria-hidden className="size-3.5" />
                </button>
              </div>
              <p className="mt-0.5 line-clamp-2 text-[13px] text-ink-secondary">{g.def}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
