import { cn } from "@/lib/cn";

// Chip anatomy (design spec V2 §2.1): sm h-28/12px, md h-34/14px; variants
// default / selected / disabled / outline; hover = border-strong; wraps.

type Size = "sm" | "md";
type Variant = "default" | "selected" | "outline" | "disabled";

const SIZES: Record<Size, string> = {
  sm: "h-7 px-3 text-xs",
  md: "h-[34px] px-4 text-sm",
};

const VARIANTS: Record<Variant, string> = {
  default:
    "border-transparent bg-subtle text-ink hover:border-line-strong",
  selected: "border-accent-border bg-accent-soft font-medium text-accent",
  outline: "border-line bg-card text-ink hover:border-line-strong",
  disabled: "border-transparent bg-transparent text-ink-muted",
};

interface StaticChipProps {
  size?: Size;
  variant?: Variant;
  /** Shorthand for variant="selected". */
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface SelectableChipProps extends StaticChipProps {
  /** Form-group name → native radio (or checkbox with `multiple`); selection works without JS. */
  name: string;
  value: string;
  multiple?: boolean;
  defaultSelected?: boolean;
}

type ChipProps = StaticChipProps & Partial<SelectableChipProps>;

export default function Chip({
  name,
  value,
  multiple = false,
  defaultSelected = false,
  size = "md",
  variant,
  selected = false,
  disabled = false,
  className,
  children,
}: ChipProps) {
  const resolved: Variant = disabled
    ? "disabled"
    : (variant ?? (selected ? "selected" : "default"));

  const base = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full border transition-colors",
    SIZES[size],
  );

  if (name) {
    return (
      <label
        className={cn(
          base,
          VARIANTS.default,
          "cursor-pointer select-none active:scale-[.98]",
          "has-[:checked]:border-accent-border has-[:checked]:bg-accent-soft has-[:checked]:font-medium has-[:checked]:text-accent",
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
        {children}
      </label>
    );
  }

  return (
    <span
      className={cn(
        base,
        VARIANTS[resolved],
        resolved === "disabled" && "cursor-not-allowed",
        className,
      )}
    >
      {children}
    </span>
  );
}
