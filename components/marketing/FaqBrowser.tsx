"use client";

import { useState } from "react";
import { Banknote, Building2, HelpCircle, KeyRound, Lock, Stethoscope } from "lucide-react";
import FaqRow from "@/components/marketing/FaqRow";
import { cn } from "@/lib/cn";
import type { Faq } from "@/lib/marketing";

// FAQ list with pill filters. Filtering rather than the previous anchor-linked
// sidebar: with six categories and short answers, jumping between headings made
// the page feel longer than it is.
//
// The rows are native <details>, so every answer is still openable — and
// findable by the browser's in-page search — without JavaScript. Only the
// category filter needs client state.

const CATEGORY_ICONS: Record<string, typeof HelpCircle> = {
  About: HelpCircle,
  Referrals: Stethoscope,
  "Data & privacy": Lock,
  Hospitals: Building2,
  Costs: Banknote,
  Access: KeyRound,
};

export default function FaqBrowser({
  categories,
  faqs,
}: {
  categories: string[];
  faqs: Faq[];
}) {
  const [active, setActive] = useState<string>(categories[0] ?? "");
  const shown = faqs.filter((f) => f.category === active);

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        role="tablist"
        aria-label="FAQ categories"
        className="flex flex-wrap justify-center gap-2"
      >
        {categories.map((c) => {
          const on = c === active;
          return (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => setActive(c)}
              className={cn(
                "rounded-full border px-4 py-2 text-[13px] font-medium transition-colors",
                on
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-card text-ink-secondary hover:border-line-strong hover:text-ink",
              )}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="flex w-full flex-col divide-y divide-line border-y border-line">
        {shown.map((f) => (
          <FaqRow key={f.q} question={f.q} icon={CATEGORY_ICONS[f.category] ?? HelpCircle}>
            {f.a}
          </FaqRow>
        ))}
      </div>
    </div>
  );
}
