import { Check } from "lucide-react";
import { CASE_PIPELINE, CASE_STATUS_LABELS, type CaseStatus } from "@/lib/caseStatus";
import { cn } from "@/lib/cn";

/**
 * Horizontal case status tracker over the §8.1 pipeline:
 * Submitted → Under review → Plan received → Confirmed → Complete → Summary returned.
 * Exception states (withdrawn / expired) are shown by StatusChip, not here.
 */
export default function StatusTracker({ status }: { status: CaseStatus }) {
  const currentIndex = CASE_PIPELINE.findIndex((s) => s === status);

  return (
    <ol className="flex items-start gap-0 overflow-x-auto py-1">
      {CASE_PIPELINE.map((step, i) => {
        const done = currentIndex >= 0 && i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex min-w-24 flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <span
                aria-hidden
                className={cn(
                  "h-0.5 flex-1",
                  i === 0 ? "bg-transparent" : done || active ? "bg-accent" : "bg-line",
                )}
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  done && "bg-navy text-white",
                  active && "bg-accent text-white ring-4 ring-accent-soft",
                  !done && !active && "bg-subtle text-ink-muted",
                )}
              >
                {done ? <Check aria-hidden className="size-4" /> : i + 1}
              </span>
              <span
                aria-hidden
                className={cn(
                  "h-0.5 flex-1",
                  i === CASE_PIPELINE.length - 1
                    ? "bg-transparent"
                    : done
                      ? "bg-accent"
                      : "bg-line",
                )}
              />
            </div>
            <span
              className={cn(
                "px-1 text-center text-[11px] leading-tight",
                active ? "font-medium text-ink" : "text-ink-muted",
              )}
            >
              {CASE_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
