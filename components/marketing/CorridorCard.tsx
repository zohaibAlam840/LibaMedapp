import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Stethoscope, TriangleAlert } from "lucide-react";
import { isReferable } from "@/lib/corridors";
import { corridorCode, type CorridorRecord } from "@/lib/db/corridors";
import { cn } from "@/lib/cn";

/**
 * Public corridor card — the marketing counterpart to CorridorBadge. A corridor
 * is a legal route, not a destination ad, so the card leads with the two things
 * a clinician actually needs: where records are held and under what basis.
 * Links through to the corridor's own page.
 */
export default function CorridorCard({
  corridor,
  hospitalName,
  locale,
  className,
}: {
  corridor: CorridorRecord;
  hospitalName?: string;
  locale: string;
  className?: string;
}) {
  const scc = corridor.transferBasis === "scc";
  const referable = corridor.specialties.filter(isReferable);

  return (
    <Link
      href={`/${locale}/corridors/${corridor.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-card border border-line bg-card p-5 transition-colors hover:border-line-strong",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[13px] font-semibold text-accent">
          {corridorCode(corridor)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-semibold text-ink">{corridor.label}</p>
          {hospitalName && (
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-[13px] text-ink-secondary">
              <Building2 aria-hidden className="size-3.5 shrink-0" />
              {hospitalName}
            </p>
          )}
        </div>
        <ArrowRight
          aria-hidden
          className="mt-1 size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100"
        />
      </div>

      {/* Transfer basis — the thing that differs most between corridors */}
      <span
        className={cn(
          "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold",
          scc ? "bg-warning-bg text-warning-text" : "bg-success-bg text-success-text",
        )}
      >
        {scc ? (
          <TriangleAlert aria-hidden className="size-3" />
        ) : (
          <ShieldCheck aria-hidden className="size-3" />
        )}
        {scc ? "Standard Contractual Clauses" : "UK adequacy"}
      </span>

      <dl className="flex flex-col gap-1 text-[13px]">
        <div className="flex gap-2">
          <dt className="shrink-0 text-ink-muted">Records held in</dt>
          <dd className="min-w-0 flex-1 truncate font-medium text-ink">{corridor.residency}</dd>
        </div>
        {referable.length > 0 && (
          <div className="flex gap-2">
            <dt className="shrink-0 text-ink-muted">Specialties</dt>
            <dd className="min-w-0 flex-1 truncate font-medium text-ink">{referable.length}</dd>
          </div>
        )}
      </dl>

      {referable.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-3">
          {referable.slice(0, 3).map((s) => (
            <span
              key={s.name}
              className="inline-flex items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-[11px] text-ink-secondary"
            >
              <Stethoscope aria-hidden className="size-3" />
              {s.name}
            </span>
          ))}
          {referable.length > 3 && (
            <span className="inline-flex items-center rounded-full px-1 py-0.5 text-[11px] text-ink-muted">
              +{referable.length - 3} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
