import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, CloudUpload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { INTAKE_STEPS, intakeStepIndex } from "@/lib/intake";
import { cn } from "@/lib/cn";

interface WizardShellProps {
  locale: string;
  step: string;
  /** One-line helper under the title. */
  lede?: string;
  /** Persistent summary bar content (chosen values so far). */
  summary?: React.ReactNode;
  /**
   * Overrides the default Continue/Submit button in the sticky footer. Used by
   * steps that gate progress on client-side validation (e.g. the NHS
   * non-substitution declaration must be complete before continuing).
   */
  footerNext?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Intake wizard shell (design spec V2 §2.15): step counter + title + helper,
 * numbered-dot stepper on desktop / thin-track stepper on mobile, one question
 * per step (max-w 640), and a sticky footer — Back + "Saved just now" autosave
 * hint + Continue. Autosave itself is a stub (no data layer yet).
 */
export default function WizardShell({
  locale,
  step,
  lede,
  summary,
  footerNext,
  children,
}: WizardShellProps) {
  const index = intakeStepIndex(step);
  const current = INTAKE_STEPS[index];
  const prev = INTAKE_STEPS[index - 1];
  const next = INTAKE_STEPS[index + 1];

  return (
    <div className="mx-auto w-full max-w-[640px]">
      {/* Desktop stepper — numbered dots with labels */}
      <ol className="mb-6 hidden items-center gap-1.5 overflow-x-auto py-1 sm:flex">
        {INTAKE_STEPS.map((s, i) => {
          const done = i < index;
          const active = i === index;
          return (
            <li key={s.id} className="flex shrink-0 items-center gap-1.5">
              {i > 0 && <span aria-hidden className="h-px w-4 bg-line-strong" />}
              <Link
                href={`/${locale}${s.href}`}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-full py-1 pe-3 ps-1 text-[13px] transition-colors",
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : done
                      ? "text-ink-secondary hover:bg-subtle"
                      : "pointer-events-none text-ink-muted",
                )}
              >
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-xs font-medium",
                    active
                      ? "bg-accent text-white"
                      : done
                        ? "bg-navy text-white"
                        : "bg-subtle text-ink-muted",
                  )}
                >
                  {done ? <Check aria-hidden className="size-3.5" /> : i + 1}
                </span>
                {s.short}
              </Link>
            </li>
          );
        })}
      </ol>

      {/* Mobile stepper — thin track */}
      <div
        aria-hidden
        className="mb-5 flex items-center gap-1.5 sm:hidden"
      >
        {INTAKE_STEPS.map((s, i) => (
          <span
            key={s.id}
            className={cn(
              "flex-1 rounded-full transition-colors",
              i < index && "h-1.5 bg-accent",
              i === index && "h-2 bg-accent",
              i > index && "h-1.5 bg-subtle",
            )}
          />
        ))}
      </div>

      <Card className="p-6">
        <p className="text-[13px] font-medium text-ink-secondary">
          Step {index + 1} of {INTAKE_STEPS.length}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">{current.title}</h1>
        {lede && <p className="mt-2 text-sm text-ink-secondary">{lede}</p>}

        <div className="mt-6">{children}</div>

        {summary && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-inner bg-subtle p-3">
            {summary}
          </div>
        )}
      </Card>

      {/* Sticky footer — above the mobile tab bar */}
      <div className="sticky bottom-[72px] z-10 mt-4 flex items-center justify-between gap-3 rounded-card bg-card p-3 shadow-elevated md:bottom-4">
        <div className="flex items-center gap-3">
          {prev ? (
            <Button variant="ghost" size="sm" href={`/${locale}${prev.href}`}>
              <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
              Back
            </Button>
          ) : (
            <Button variant="ghost" size="sm" href={`/${locale}/referring`}>
              <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
              Cancel
            </Button>
          )}
          <span className="hidden items-center gap-1.5 text-xs text-ink-muted sm:flex">
            <CloudUpload aria-hidden className="size-3.5" />
            Saved just now
          </span>
        </div>

        {footerNext ? (
          footerNext
        ) : next ? (
          <Button href={`/${locale}${next.href}`} className="flex-1 sm:flex-none">
            Continue
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        ) : (
          <Button
            href={`/${locale}/referring/intake/confirmation`}
            className="flex-1 sm:flex-none"
          >
            Submit referral
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        )}
      </div>
    </div>
  );
}
