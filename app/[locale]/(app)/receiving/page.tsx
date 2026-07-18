import { FolderLock } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import { DEMO_CASES, DEMO_SPECIALIST } from "@/lib/demo";

// 9D · Incoming case queue (#42) — acceptance §14.4.
// Addressed to the NAMED specialist — never a shared inbox (C2C spec §8.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const queue = DEMO_CASES.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={DEMO_SPECIALIST.name} size="lg" dot />
          <div>
            <h1 className="text-[28px] font-semibold text-ink">Incoming cases</h1>
            <p className="text-[15px] text-ink-secondary">
              Addressed to {DEMO_SPECIALIST.name} — your personal queue, not a
              shared inbox.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting your review" value={2} description="New referrals to triage" />
        <StatCard
          label="Response due"
          value={1}
          delta={{ tone: "negative", text: "due tomorrow" }}
          description="Within the corridor's expected window"
        />
        <StatCard label="In treatment" value={1} description="Confirmed and scheduled" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardTitle>Queue</CardTitle>
          <SearchInput placeholder="Search by case reference" className="mb-3" />
          <div className="-mx-2 flex flex-col">
            {queue.map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/receiving/cases/${c.id}`}
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
        </Card>

        <Card className="h-fit">
          <CardTitle>Filter</CardTitle>
          <SectionLabel className="mb-1">Status</SectionLabel>
          <div className="mb-4 flex flex-col">
            <Checkbox label="New / under review" defaultChecked />
            <Checkbox label="Plan sent" defaultChecked />
            <Checkbox label="Confirmed" defaultChecked />
            <Checkbox label="Complete" />
          </div>
          <SectionLabel className="mb-1">Specialty</SectionLabel>
          <div className="flex flex-col">
            <Checkbox label="Oncology" defaultChecked />
            <Checkbox label="Orthopedics" defaultChecked />
            <Checkbox label="Fertility" />
          </div>
        </Card>
      </div>
    </div>
  );
}
