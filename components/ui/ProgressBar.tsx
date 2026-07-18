import { cn } from "@/lib/cn";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  variant?: "solid" | "gradient" | "striped";
  /** Accessible name for the progressbar. */
  label: string;
  /** Show a right-aligned percentage label. */
  showValue?: boolean;
  className?: string;
}

/**
 * Progress bar (design spec V2 §2.7): h 10 track, radius 999, gradient fill
 * rounded both ends; `striped` = projected/target variant.
 */
export default function ProgressBar({
  value,
  variant = "gradient",
  label,
  showValue = false,
  className,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-subtle"
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-400 ease-out",
            variant === "gradient" && "bg-accent-gradient",
            variant === "solid" && "bg-accent",
            variant === "striped" && "bg-accent-soft",
          )}
          style={{
            width: `${clamped}%`,
            ...(variant === "striped" && {
              backgroundImage:
                "repeating-linear-gradient(45deg, rgba(59,130,214,0.35) 0 6px, transparent 6px 12px)",
            }),
          }}
        />
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ink-secondary">{clamped}%</span>
      )}
    </div>
  );
}
