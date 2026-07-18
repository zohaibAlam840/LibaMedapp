import { cn } from "@/lib/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
  xl: "size-20 text-xl",
};

function initialsOf(name: string): string {
  return name
    .replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface AvatarProps {
  name: string;
  /** Optional image URL; falls back to initials. */
  src?: string;
  size?: Size;
  /** Online/presence dot. */
  dot?: boolean;
  className?: string;
}

/** Circular avatar with initials fallback (accent-soft fill). */
export default function Avatar({ name, src, size = "md", dot, className }: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- demo/design phase; swap for next/image with real assets
        <img
          src={src}
          alt={name}
          className={cn("rounded-full object-cover", SIZES[size])}
        />
      ) : (
        <span
          aria-hidden
          className={cn(
            "flex items-center justify-center rounded-full bg-accent-soft font-semibold text-accent",
            SIZES[size],
          )}
        >
          {initialsOf(name)}
        </span>
      )}
      {dot && (
        <span
          aria-hidden
          className="absolute bottom-0 end-0 size-2.5 rounded-full bg-success-text ring-2 ring-card"
        />
      )}
    </span>
  );
}
