import { FolderLock, Inbox } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import EmptyState from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { getCases } from "@/lib/db/referrals";

// 9D · Incoming case queue (#42) — acceptance §14.4.
// Addressed to the NAMED specialist — never a shared inbox (C2C spec §8.2).
// Scoped: a clinician only sees cases at their hospital addressed to them or
// not yet assigned.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  const cases = await getCases(user);

  const queue = cases.filter((c) => c.status === "submitted" || c.status === "under-review");
  const awaiting = cases.filter((c) => c.status === "submitted").length;
  const planned = cases.filter((c) => c.status === "plan-received").length;
  const inTreatment = cases.filter((c) => c.status === "confirmed").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name ?? "Specialist"} size="lg" dot />
          <div>
            <h1 className="text-[28px] font-semibold text-ink">Incoming cases</h1>
            <p className="text-[15px] text-ink-secondary">
              Addressed to {user?.name ?? "you"} — your personal queue, not a
              shared inbox.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting your review" value={awaiting} description="New referrals to triage" />
        <StatCard label="Plan sent" value={planned} description="Awaiting the referrer's confirmation" />
        <StatCard label="In treatment" value={inTreatment} description="Confirmed and scheduled" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardTitle>Queue</CardTitle>
          {queue.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="Nothing waiting on you"
              description={
                user?.hospitalId
                  ? "New referrals addressed to you will appear here."
                  : "Your account isn't linked to a hospital yet — ask an administrator to assign you."
              }
            />
          ) : (
            <>
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
            </>
          )}
        </Card>

        <Card className="h-fit">
          <CardTitle>Filter</CardTitle>
          <SectionLabel className="mb-1">Status</SectionLabel>
          <div className="mb-4 flex flex-col">
            <Checkbox label="New / under review" defaultChecked />
            <Checkbox label="Plan sent" defaultChecked />
            <Checkbox label="Confirmed" defaultChecked />
            <Checkbox label="Completed" />
          </div>
        </Card>
      </div>
    </div>
  );
}
