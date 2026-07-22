import { CheckCircle2, Clock, TriangleAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { HANDBACK_LABELS, type Handback, type HandbackState } from "@/lib/referral";
import { cn } from "@/lib/cn";

// Continuity-of-care (handback) badge (NHS-safeguard item 3): has the discharge
// summary / treatment record come back from the overseas hospital yet?

const STYLES: Record<HandbackState, { cls: string; icon: LucideIcon }> = {
  "not-due": { cls: "bg-subtle text-ink-secondary", icon: Clock },
  awaited: { cls: "bg-[#DBEAFE] text-[#2563EB]", icon: Clock },
  received: { cls: "bg-success-bg text-success-text", icon: CheckCircle2 },
  overdue: { cls: "bg-danger-bg text-danger-text", icon: TriangleAlert },
};

export default function HandbackBadge({
  handback,
  withDate,
  className,
}: {
  handback: Handback;
  /** Append the due/received date. */
  withDate?: boolean;
  className?: string;
}) {
  const { cls, icon: Icon } = STYLES[handback.state];
  const date =
    handback.state === "received"
      ? handback.receivedAt
      : handback.state !== "not-due"
        ? `due ${handback.dueBy}`
        : undefined;

  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        cls,
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5" />
      {HANDBACK_LABELS[handback.state]}
      {withDate && date && <span className="font-normal opacity-80">· {date}</span>}
    </span>
  );
}
