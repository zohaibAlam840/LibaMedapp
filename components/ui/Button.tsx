import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-hover",
  accent: "bg-accent text-white hover:bg-accent-hover",
  secondary:
    "bg-card text-ink border border-line hover:border-line-strong hover:bg-subtle",
  ghost: "text-ink-secondary hover:bg-subtle hover:text-ink",
  danger: "bg-danger-bg text-danger-text hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-6 text-[15px] gap-2",
  lg: "h-12 px-7 text-[15px] gap-2",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  (
    | ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)
    | ({ href?: undefined } & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children">)
  );

/** Pill button. `primary` = dark navy (main CTA). Renders a Link when `href` is set. */
export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-full font-medium transition-colors select-none",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    loading && "pointer-events-none opacity-70",
    className,
  );

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...linkRest } = rest as { href: string } & Record<string, unknown>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-busy={loading || undefined}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
