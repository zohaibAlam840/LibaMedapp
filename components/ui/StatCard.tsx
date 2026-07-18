import { Card, SectionLabel } from "@/components/ui/Card";
import DeltaPill from "@/components/ui/DeltaPill";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  delta?: { tone: "positive" | "negative" | "neutral"; text: string };
  description?: string;
  /** 0–100 → renders the gradient progress bar. */
  progress?: number;
  className?: string;
}

/** Dashboard stat card: label, big number, delta pill, description, progress. */
export default function StatCard({
  label,
  value,
  delta,
  description,
  progress,
  className,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-2", className)}>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex items-center gap-3">
        <span className="text-[32px] font-semibold leading-none text-ink">
          {value}
        </span>
        {delta && <DeltaPill tone={delta.tone}>{delta.text}</DeltaPill>}
      </div>
      {description && <p className="text-xs text-ink-muted">{description}</p>}
      {progress !== undefined && (
        <ProgressBar value={progress} label={`${label} progress`} className="mt-1" />
      )}
    </Card>
  );
}
