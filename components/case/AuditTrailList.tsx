import { Lock } from "lucide-react";
import { AUDIT_EVENT_LABELS, type AuditEntry } from "@/lib/referral";

/**
 * Immutable referral audit trail (NHS-safeguard item 2). Renders the append-only
 * event chain per referral. The `hash` shown is a chain reference — true
 * immutability is enforced by the backend store, not the frontend; this only
 * presents it.
 */
export default function AuditTrailList({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="relative flex flex-col">
      {entries.map((e, i) => (
        <li key={e.seq} className="relative flex gap-3.5 pb-5 last:pb-0">
          {/* connector */}
          {i < entries.length - 1 && (
            <span aria-hidden className="absolute start-[11px] top-6 h-full w-px bg-line" />
          )}
          <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
            {e.seq}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="text-[15px] font-medium text-ink">
                {AUDIT_EVENT_LABELS[e.event]}
              </p>
              <p className="text-xs text-ink-muted">{e.at}</p>
            </div>
            <p className="mt-0.5 text-[13px] text-ink-secondary">{e.detail}</p>
            <p className="mt-1 flex items-center gap-2 text-[11px] text-ink-muted">
              <span>{e.actor}</span>
              {e.hash && (
                <span className="inline-flex items-center gap-1 font-mono">
                  <Lock aria-hidden className="size-3" />
                  {e.hash}
                </span>
              )}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
