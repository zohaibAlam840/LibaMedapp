import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

interface ListRowProps {
  /** Leading element (Avatar, icon circle…), 40px. */
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small trailing meta (timestamp, count…). */
  meta?: React.ReactNode;
  /** Trailing badge (StatusChip, unread count…). */
  badge?: React.ReactNode;
  /** Trailing chevron affordance. */
  chevron?: boolean;
  href?: string;
  selected?: boolean;
  /** Unread emphasis (bolder title). */
  unread?: boolean;
  className?: string;
}

/**
 * List row (design spec V2 §2.9): [leading 40] [content] [meta]. Hover =
 * subtle fill; selected = accent-soft fill + 3px accent start-indicator.
 * No borders between rows — spacing and fill only.
 */
export default function ListRow({
  leading,
  title,
  subtitle,
  meta,
  badge,
  chevron = false,
  href,
  selected = false,
  unread = false,
  className,
}: ListRowProps) {
  const content = (
    <>
      {selected && (
        <span
          aria-hidden
          className="absolute inset-y-2.5 start-0 w-[3px] rounded-full bg-accent"
        />
      )}
      {leading}
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[15px] text-ink",
            unread ? "font-semibold" : "font-medium",
          )}
        >
          {title}
        </span>
        {subtitle && (
          <span className="mt-0.5 block truncate text-[13px] text-ink-secondary">
            {subtitle}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="flex flex-col items-end gap-1">
          {meta && <span className="text-xs text-ink-muted">{meta}</span>}
          {badge}
        </span>
        {chevron && (
          <ChevronRight
            aria-hidden
            className="size-4 text-ink-muted rtl:-scale-x-100"
          />
        )}
      </span>
    </>
  );

  const classes = cn(
    "relative flex w-full items-center gap-3 rounded-inner px-3 py-3 text-start transition-colors",
    selected ? "bg-accent-soft" : "hover:bg-subtle",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }
  return <div className={classes}>{content}</div>;
}
