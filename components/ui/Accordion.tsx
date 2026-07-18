import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/** Accordion item on native <details> — works without JS, keyboard accessible. */
export function AccordionItem({
  question,
  children,
  defaultOpen = false,
  className,
}: {
  question: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details
      open={defaultOpen || undefined}
      className={cn(
        "group rounded-card border border-line bg-card transition-colors open:border-accent-border",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-card px-5 py-4 text-[15px] font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown
          aria-hidden
          className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
        />
      </summary>
      <div className="px-5 pb-4 text-sm leading-relaxed text-ink-secondary">
        {children}
      </div>
    </details>
  );
}
