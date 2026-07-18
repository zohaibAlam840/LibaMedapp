import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface DetailPanelRowProps {
  icon?: LucideIcon;
  label: string;
  value: React.ReactNode;
  /** Trailing slot (link, chip, toggle…). */
  trailing?: React.ReactNode;
  className?: string;
}

/** Meta-panel row: soft icon circle + label/value (+ trailing). */
export default function DetailPanelRow({
  icon: Icon,
  label,
  value,
  trailing,
  className,
}: DetailPanelRowProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2.5", className)}>
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
          <Icon aria-hidden className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-ink-muted">{label}</span>
        <span className="block truncate text-sm font-medium text-ink">{value}</span>
      </span>
      {trailing}
    </div>
  );
}
