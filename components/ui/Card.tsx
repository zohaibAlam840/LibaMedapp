import { cn } from "@/lib/cn";

/** White rounded card floating on the page surface (soft shadow, no border). */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-card bg-card p-5 shadow-card", className)}>
      {children}
    </div>
  );
}

/** 18px semibold panel/card title. */
export function CardTitle({
  className,
  children,
  action,
}: {
  className?: string;
  children: React.ReactNode;
  /** Optional trailing action (link, segmented control…). */
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h2 className="text-lg font-semibold text-ink">{children}</h2>
      {action}
    </div>
  );
}

/** 13px secondary section label. */
export function SectionLabel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <p className={cn("text-[13px] font-medium text-ink-secondary", className)}>
      {children}
    </p>
  );
}
