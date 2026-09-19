import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { FaqEditor, GlossaryEditor } from "@/components/admin/ContentEditor";
import { contentIsEditable, getFaqItems, getGlossaryTerms } from "@/lib/db/content";

// 9E · Help & glossary management (admin). The public /faq page is content —
// admins own it here without a developer.
//
// That was the intent from the start; the buttons just had nothing behind them,
// because the content was a constant in the codebase. Migration 005 moved it
// into a table and these editors write to it.
const CATEGORIES = ["About", "Referrals", "Data & privacy", "Hospitals", "Costs", "Access"] as const;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [faqs, glossary, editable] = await Promise.all([
    getFaqItems(true),
    getGlossaryTerms(true),
    contentIsEditable(),
  ]);

  // A question in a category that is no longer offered would otherwise vanish
  // from this screen while still showing on the public page.
  const categories = [
    ...CATEGORIES,
    ...new Set(faqs.map((f) => f.category).filter((c) => !CATEGORIES.includes(c as never))),
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Help &amp; glossary</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            The public help page — questions and plain-language definitions.
            Edit here; changes publish straight away.
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

      <FaqEditor locale={locale} items={faqs} categories={categories} editable={editable} />
      <GlossaryEditor locale={locale} terms={glossary} editable={editable} />
    </div>
  );
}
