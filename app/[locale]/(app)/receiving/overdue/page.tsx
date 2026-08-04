import { AlertTriangle, CheckCircle2, FolderLock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { getCases } from "@/lib/db/referrals";

// Coordinator · Overdue (sidebar aggregation) — cases past their expected
// response window, for the coordinator to chase. Derived from real case state:
// anything still awaiting a response after the corridor's 3-working-day window.
const RESPONSE_WINDOW_DAYS = 3;
const HIGH_SEVERITY_DAYS = 5;

function daysSince(iso?: string): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();

  const overdue = cases
    .filter((c) => c.status === "submitted" || c.status === "under-review")
    .map((c) => ({ c, days: daysSince(c.updatedIso) }))
    .filter((o) => o.days >= RESPONSE_WINDOW_DAYS)
    .sort((a, b) => b.days - a.days);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Overdue responses</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Cases past the expected response window. Chase the specialist or flag
          for reassignment.
        </p>
      </div>

      <Card>
        <CardTitle>Needs chasing</CardTitle>
        {overdue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Nothing overdue"
            description={`Every open case is within the ${RESPONSE_WINDOW_DAYS}-working-day response window.`}
          />
        ) : (
          <div className="-mx-2 flex flex-col">
            {overdue.map(({ c, days }) => {
              const high = days >= HIGH_SEVERITY_DAYS;
              return (
                <ListRow
                  key={c.id}
                  href={`/${locale}/receiving/cases/${c.id}`}
                  leading={
                    <span
                      className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                        high ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"
                      }`}
                    >
                      <AlertTriangle aria-hidden className="size-4.5" />
                    </span>
                  }
                  title={`${c.ref} · ${c.specialty}`}
                  subtitle={c.specialist ? `Assigned to ${c.specialist}` : "Not yet assigned"}
                  badge={
                    <span className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        className={high ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"}
                      >
                        {days} days waiting
                      </Chip>
                      <Button variant="secondary" size="sm">
                        Chase
                      </Button>
                    </span>
                  }
                />
              );
            })}
          </div>
        )}
        <div className="mt-3 flex items-center gap-2 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
          <FolderLock aria-hidden className="size-4 shrink-0" />
          Reassignment needs a case manager or admin — coordinators can request
          it, and the request is logged.
        </div>
      </Card>
    </div>
  );
}
