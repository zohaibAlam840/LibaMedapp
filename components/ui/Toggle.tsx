import { cn } from "@/lib/cn";

interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Switch toggle (native checkbox + styled track; no JS needed). */
export default function Toggle({ label, description, className, ...rest }: ToggleProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4 py-1.5",
        rest.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] text-ink">{label}</span>
        {description && (
          <span className="text-[13px] text-ink-secondary">{description}</span>
        )}
      </span>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" {...rest} />
        <span
          aria-hidden
          className={cn(
            "block h-6 w-11 rounded-full bg-line-strong transition-colors peer-checked:bg-accent",
            "after:absolute after:top-0.5 after:start-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-['']",
            "peer-checked:after:translate-x-5 rtl:peer-checked:after:-translate-x-5",
          )}
        />
      </span>
    </label>
  );
}
