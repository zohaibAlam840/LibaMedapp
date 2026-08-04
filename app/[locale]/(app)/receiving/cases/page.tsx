import { FolderLock, FolderOpen } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import StatusChip from "@/components/ui/StatusChip";
import EmptyState from "@/components/ui/EmptyState";
import { getCases } from "@/lib/db/referrals";

// Receiving · Active cases (sidebar aggregation) — cases assigned to this named
// specialist that are in progress. The queue (#42) holds new arrivals.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();
  const active = cases.filter(
    (c) => c.status !== "summary-returned" && c.status !== "consent-withdrawn",
  );

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Active cases</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Cases assigned to you and in progress — access is logged and expires
          after 90 days of inactivity.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <Card>
          <CardTitle>{active.length} in progress</CardTitle>
          {active.length === 0 ? (
            <EmptyState
              icon={FolderOpen}
              title="No active cases"
              description="Cases you accept from your queue appear here while they're in progress."
            />
          ) : (
          <>
          <SearchInput placeholder="Search by case reference" className="mb-3" />
          <div className="-mx-2 flex flex-col">
            {active.map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/receiving/cases/${c.id}`}
                chevron
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Patient ${c.patientRef} · referred from the UK`}
                meta={c.updated}
                badge={<StatusChip status={c.status} />}
              />
            ))}
          </div>
          </>
          )}
        </Card>

        <Card className="h-fit">
          <CardTitle>Filter</CardTitle>
          <SectionLabel className="mb-1">Status</SectionLabel>
          <div className="flex flex-col">
            <Checkbox label="Under review" defaultChecked />
            <Checkbox label="Plan sent" defaultChecked />
            <Checkbox label="Confirmed" defaultChecked />
            <Checkbox label="In treatment" defaultChecked />
          </div>
        </Card>
      </div>
    </div>
  );
}
