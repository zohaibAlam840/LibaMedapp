import { FolderLock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import ListRow from "@/components/ui/ListRow";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import { getCases } from "@/lib/db/referrals";

// 9D · Hospital coordinator dashboard (#49) — hospital-side operations view.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">
          Coordinator dashboard
        </h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Sheba Medical Center · incoming LibaMed referrals across your
          specialists.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active cases" value={6} description="Across 4 specialists" />
        <StatCard
          label="Responses due this week"
          value={2}
          delta={{ tone: "negative", text: "1 due tomorrow" }}
        />
        <StatCard label="Arrivals this month" value={3} description="Patients scheduled to arrive" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Recent cases</CardTitle>
          <div className="-mx-2 flex flex-col">
            {cases.slice(0, 4).map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/receiving/cases/${c.id}`}
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Assigned to ${c.specialist}`}
                meta={c.updated}
                badge={<StatusChip status={c.status} />}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle>Your specialists</CardTitle>
          <div className="-mx-2 flex flex-col">
            {[
              { name: "Dr. Noa Peretz", role: "Oncology · 3 active cases" },
              { name: "Dr. Avi Shalev", role: "Orthopedics — spine · 2 active cases" },
              { name: "Dr. Tamar Ben-David", role: "Fertility · 1 active case" },
            ].map((p) => (
              <ListRow
                key={p.name}
                leading={<Avatar name={p.name} size="md" />}
                title={p.name}
                subtitle={p.role}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
