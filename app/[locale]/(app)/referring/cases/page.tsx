import { FolderLock } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import StatusChip from "@/components/ui/StatusChip";
import { CorridorBadge } from "@/components/ui/Badges";
import { DEMO_CASES } from "@/lib/demo";

// Referring · My cases (sidebar aggregation) — full filterable list of the
// clinician's own cases. Beyond the 67 V1 pages; a navigation landing page.
const CODE: Record<string, string> = { israel: "IL", france: "FR", turkey: "TR", switzerland: "CH" };

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">My cases</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Every referral you own, filterable by corridor and status.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardTitle
            action={
              <SegmentedControl
                name="cases-filter"
                defaultValue="all"
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            }
          >
            {DEMO_CASES.length} cases
          </CardTitle>
          <SearchInput placeholder="Search by case or patient reference" className="mb-3" />
          <div className="-mx-2 flex flex-col">
            {DEMO_CASES.map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/referring/cases/${c.id}`}
                chevron
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Patient ${c.patientRef} · ${c.hospital}`}
                meta={c.updated}
                badge={
                  <span className="flex items-center gap-2">
                    <CorridorBadge code={CODE[c.corridor]} label={c.corridorLabel} className="hidden xl:inline-flex" />
                    <StatusChip status={c.status} />
                  </span>
                }
              />
            ))}
          </div>
        </Card>

        <Card className="h-fit">
          <CardTitle>Filter</CardTitle>
          <SectionLabel className="mb-1">Corridor</SectionLabel>
          <div className="mb-4 flex flex-col">
            <Checkbox label="Israel" defaultChecked />
            <Checkbox label="France" defaultChecked />
            <Checkbox label="Turkey" defaultChecked />
            <Checkbox label="Switzerland" defaultChecked />
          </div>
          <SectionLabel className="mb-1">Status</SectionLabel>
          <div className="flex flex-col">
            <Checkbox label="Under review" defaultChecked />
            <Checkbox label="Plan received" defaultChecked />
            <Checkbox label="Confirmed" defaultChecked />
            <Checkbox label="Complete" />
            <Checkbox label="Summary returned" />
          </div>
        </Card>
      </div>
    </div>
  );
}
