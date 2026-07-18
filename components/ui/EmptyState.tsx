import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  /** Action slot (usually a <Button>). */
  children?: React.ReactNode;
  className?: string;
}

/** Centered empty/system state: soft icon circle, title, description, action. */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon aria-hidden className="size-6" />
        </span>
      )}
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description && (
        <p className="max-w-sm text-sm text-ink-secondary">{description}</p>
      )}
      {children && <div className="mt-2 flex gap-3">{children}</div>}
    </div>
  );
}
