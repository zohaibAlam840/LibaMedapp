import { cn } from "@/lib/cn";

type Variant = "default" | "soft" | "outline" | "active";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  default: "text-ink-secondary hover:bg-subtle hover:text-ink",
  soft: "bg-subtle text-ink-secondary hover:text-ink",
  outline: "border border-line text-ink-secondary hover:border-line-strong hover:text-ink",
  active: "bg-navy text-white",
};

const SIZES: Record<Size, string> = {
  sm: "size-9",
  md: "size-11",
  lg: "size-12",
};

interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Accessible name — required; icon-only buttons have no visible label. */
  "aria-label": string;
  variant?: Variant;
  size?: Size;
  /** Small accent dot (e.g. unread notifications). */
  dot?: boolean;
  children: React.ReactNode;
}

/** Circular icon button (reference pattern: icon rail, header cluster, actions). */
export default function IconButton({
  variant = "default",
  size = "md",
  dot = false,
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {children}
      {dot && (
        <span
          aria-hidden
          className="absolute end-2 top-2 size-2 rounded-full bg-accent ring-2 ring-card"
        />
      )}
    </button>
  );
}
