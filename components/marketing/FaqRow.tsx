import { ChevronDown, HelpCircle } from "lucide-react";

/**
 * One question row: icon, question, chevron, and the answer indented to the
 * question's text column. Shared by the FAQ page and the home page's preview so
 * the two cannot drift apart.
 *
 * Native <details>, so it opens without JavaScript and the answers stay
 * findable by the browser's in-page search.
 */
export default function FaqRow({
  question,
  icon: Icon = HelpCircle,
  children,
}: {
  question: string;
  icon?: typeof HelpCircle;
  children: React.ReactNode;
}) {
  return (
    <details className="accordion group">
      <summary className="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-inner border border-line bg-card text-ink-secondary transition-colors group-open:border-accent-border group-open:bg-accent-soft group-open:text-accent">
          <Icon aria-hidden className="size-4" />
        </span>
        <span className="flex-1 pt-1.5 text-[15px] font-semibold text-ink">{question}</span>
        <ChevronDown
          aria-hidden
          className="mt-2 size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
        />
      </summary>
      {/* ps-13 = size-9 (36px) + gap-4 (16px), so the answer lines up under the
          question rather than under the icon. */}
      <div className="pb-5 pe-8 ps-13 text-sm leading-relaxed text-ink-secondary">
        {children}
      </div>
    </details>
  );
}
