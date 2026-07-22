import Link from "next/link";
import { ArrowRight, FolderLock, Plus, TriangleAlert } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import SegmentedControl from "@/components/ui/SegmentedControl";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import { DEMO_CASES, DEMO_USER } from "@/lib/demo";
import { getReferralCompliance, isHandbackOverdue } from "@/lib/referral";

// 9C · Referring dashboard (#29) — greeting + modest stat cards + filterable
// case list (design spec §3.4/§6). ≤3 clicks from login to a new referral:
// this button is one of them.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const actionNeeded = DEMO_CASES.filter(
    (c) => c.status === "plan-received" || (c.unread ?? 0) > 0,
  );

  // Continuity-of-care: cases whose care summary hasn't come back in time (item 3).
  const overdueHandbacks = DEMO_CASES.filter((c) => {
    const r = getReferralCompliance(c.id);
    return r && isHandbackOverdue(r.handback);
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Greeting + primary CTA */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">
            Welcome back, {DEMO_USER.name.replace("Dr. ", "Dr ")}
          </h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {actionNeeded.length} of your cases need attention today.
          </p>
        </div>
        <Button href={`/${locale}/referring/intake/patient`}>
          <Plus aria-hidden className="size-4" />
          New referral
        </Button>
      </div>

      {/* Continuity-of-care alert (item 3): overdue care handbacks */}
      {overdueHandbacks.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-danger-text/20 bg-danger-bg/60 p-4">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger-text">
            <TriangleAlert aria-hidden className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold text-ink">
              {overdueHandbacks.length} case{overdueHandbacks.length > 1 ? "s" : ""} overdue for a care summary
            </p>
            <p className="text-[13px] text-ink-secondary">
              The overseas hospital hasn&rsquo;t returned the discharge summary within the agreed window.
            </p>
          </div>
          <Link
            href={`/${locale}/referring/cases/${overdueHandbacks[0].id}`}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
          >
            Review
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Link>
        </div>
      )}

      {/* Stat cards — modest in V1 (analytics are V1.5) */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open cases"
          value={4}
          delta={{ tone: "positive", text: "+1 this week" }}
          description="Across 4 corridors"
        />
        <StatCard
          label="Awaiting response"
          value={1}
          delta={{ tone: "neutral", text: "on track" }}
          description="Within the expected response window"
        />
        <StatCard
          label="Action needed"
          value={actionNeeded.length}
          delta={{ tone: "negative", text: "2 unread" }}
          description="Plans to review or messages to answer"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Case list */}
        <Card>
          <CardTitle
            action={
              <SegmentedControl
                name="case-filter"
                defaultValue="all"
                options={[
                  { value: "all", label: "All" },
                  { value: "active", label: "Active" },
                  { value: "closed", label: "Closed" },
                ]}
              />
            }
          >
            My cases
          </CardTitle>
          <SearchInput placeholder="Search by case or patient reference" className="mb-3" />
          <div className="-mx-2 flex flex-col">
            {DEMO_CASES.map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/referring/cases/${c.id}`}
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Patient ${c.patientRef} · ${c.hospital}`}
                meta={c.updated}
                badge={<StatusChip status={c.status} />}
              />
            ))}
          </div>
        </Card>

        {/* Filter panel (design spec §3.2) */}
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
            <Checkbox label="Submitted" defaultChecked />
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
