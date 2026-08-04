import { ShieldCheck, TriangleAlert } from "lucide-react";
import type { CorridorTransferInfo } from "@/lib/corridors";
import { cn } from "@/lib/cn";

/**
 * Data-transfer basis callout (NHS-safeguard item 5). Shows, before a GP
 * submits into a corridor, the legal basis for moving the patient's records
 * out of the UK — adequacy (calm) vs. Standard Contractual Clauses (warning),
 * plus any local notification duty (Turkey/KVKK).
 */
export default function TransferBasisNotice({
  corridor,
  className,
}: {
  corridor: CorridorTransferInfo;
  className?: string;
}) {
  const scc = corridor.transferBasis === "scc";
  const Icon = scc ? TriangleAlert : ShieldCheck;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-inner border p-3.5 text-[13px]",
        scc
          ? "border-warning-text/25 bg-warning-bg text-warning-text"
          : "border-accent-border bg-accent-soft text-ink",
        className,
      )}
    >
      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", scc ? "" : "text-accent")} />
      <div className="min-w-0">
        <p className="font-semibold">
          {scc
            ? `Standard Contractual Clauses required — ${corridor.country}`
            : `UK adequacy covers ${corridor.country}`}
        </p>
        <p className={cn("mt-0.5 leading-relaxed", scc ? "text-warning-text/90" : "text-ink-secondary")}>
          {corridor.safeguard}
        </p>
        {corridor.notification && (
          <p className="mt-1.5 font-medium">
            ⏱ {corridor.notification.authority} notification due within{" "}
            {corridor.notification.withinBusinessDays} business days of first transfer.
          </p>
        )}
      </div>
    </div>
  );
}
