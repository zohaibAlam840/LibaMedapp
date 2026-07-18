import { cn } from "@/lib/cn";

interface SelectableCardProps {
  /** Radio/checkbox group name (native input — selection works without JS). */
  name: string;
  value: string;
  multiple?: boolean;
  defaultSelected?: boolean;
  /** Leading 40px element (Avatar, icon circle…). */
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Optional meta row under the subtitle. */
  meta?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

/**
 * Selectable card (design spec V2 §2.2): white, radius 12, 1px border.
 * Selected = accent-soft fill + accent border (fill AND border, never fill alone).
 */
export default function SelectableCard({
  name,
  value,
  multiple = false,
  defaultSelected = false,
  leading,
  title,
  subtitle,
  meta,
  disabled = false,
  className,
}: SelectableCardProps) {
  return (
    <label
      className={cn(
        "flex w-full cursor-pointer items-center gap-3 rounded-inner border border-line bg-card p-3.5 text-start transition-colors",
        "hover:border-line-strong",
        "has-[:checked]:border-accent-border has-[:checked]:bg-accent-soft",
        disabled && "pointer-events-none cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input
        type={multiple ? "checkbox" : "radio"}
        name={name}
        value={value}
        defaultChecked={defaultSelected}
        disabled={disabled}
        className="sr-only"
      />
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-ink">
          {title}
        </span>
        {subtitle && (
          <span className="block truncate text-[13px] text-ink-secondary">
            {subtitle}
          </span>
        )}
        {meta && <span className="mt-1 block text-xs text-ink-muted">{meta}</span>}
      </span>
    </label>
  );
}
