import { HandCoins } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * No-referrer-fee confirmation (NHS-safeguard item 4). A permanent, visible
 * statement in the GP-facing flow that no commission or benefit accrues to the
 * referring clinician. Standing UI — never dismissible.
 */
export default function NoFeeNotice({
  className,
  compact,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-inner bg-subtle p-3.5 text-ink-secondary",
        className,
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-success-bg text-success-text">
        <HandCoins aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-ink">No referrer fee</p>
        {!compact && (
          <p className="mt-0.5 text-[13px] leading-relaxed">
            No commission, payment, or benefit of any kind accrues to the referring
            clinician for this referral. LibaMed is paid by the receiving hospital,
            never by referral volume.
          </p>
        )}
      </div>
    </div>
  );
}
