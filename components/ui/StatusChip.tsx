import { cn } from "@/lib/cn";
import { CASE_STATUS_LABELS, type CaseStatus } from "@/lib/caseStatus";

/**
 * Case-status pill — exact palette from design spec V2 §2.8.
 * h 26, px 10, 12px/600, 6px leading dot + label. Never colour alone.
 */
const STYLES: Record<CaseStatus, string> = {
  submitted: "bg-[#F1F5F9] text-[#64748B]",
  "under-review": "bg-[#FEF3C7] text-[#B45309]",
  "plan-received": "bg-[#DBEAFE] text-[#2563EB]",
  confirmed: "bg-[#E0E7FF] text-[#4F46E5]",
  complete: "bg-[#DCFCE7] text-[#15803D]",
  "summary-returned": "bg-[#CCFBF1] text-[#0F766E]",
  "consent-withdrawn": "bg-[#FEE2E2] text-[#B91C1C]",
  "access-expired": "bg-[#F3F4F6] text-[#6B7280]",
};

export default function StatusChip({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-xs font-semibold",
        STYLES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {CASE_STATUS_LABELS[status]}
    </span>
  );
}
