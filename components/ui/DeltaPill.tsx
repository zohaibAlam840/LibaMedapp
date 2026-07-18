import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "positive" | "negative" | "neutral";

const TONES: Record<Tone, string> = {
  positive: "bg-success-bg text-success-text",
  negative: "bg-danger-bg text-danger-text",
  neutral: "bg-subtle text-ink-secondary",
};

/** Small delta pill for stat cards (+green / −red / neutral). */
export default function DeltaPill({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  const Icon =
    tone === "positive" ? TrendingUp : tone === "negative" ? TrendingDown : null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className,
      )}
    >
      {Icon && <Icon aria-hidden className="size-3" />}
      {children}
    </span>
  );
}
