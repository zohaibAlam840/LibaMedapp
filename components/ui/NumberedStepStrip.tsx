import { cn } from "@/lib/cn";

interface Step {
  title: string;
  description: string;
}

/**
 * NumberedStepStrip (design spec V2 §2.23): the 5-step referral pathway for
 * marketing pages. Desktop = columns joined by a hairline connector behind the
 * numbered circles; mobile = vertical with a start-side connector.
 */
export default function NumberedStepStrip({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <ol
      className={cn(
        "relative flex flex-col gap-8 md:flex-row md:gap-6",
        className,
      )}
    >
      {/* Desktop connector line behind the circles */}
      <span
        aria-hidden
        className="absolute inset-x-10 top-5 hidden h-px bg-line md:block"
      />
      {/* Mobile connector line */}
      <span
        aria-hidden
        className="absolute bottom-4 start-5 top-4 w-px bg-line md:hidden"
      />
      {steps.map((step, i) => (
        <li
          key={step.title}
          className="relative flex gap-4 md:flex-1 md:flex-col md:gap-3"
        >
          <span className="relative z-[1] flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15px] font-semibold text-accent ring-4 ring-page">
            {i + 1}
          </span>
          <span>
            <span className="block text-[16px] font-semibold text-ink">
              {step.title}
            </span>
            <span className="mt-1 block max-w-[36ch] text-sm leading-relaxed text-ink-secondary">
              {step.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
