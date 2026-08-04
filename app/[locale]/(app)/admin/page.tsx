import Link from "next/link";
import { ArrowRight, FolderLock, Globe2, ScrollText, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import ListRow from "@/components/ui/ListRow";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import { getCases } from "@/lib/db/referrals";

// 9E · Admin dashboard (#50) — case flow across corridors, consent + residency
// confirmation per case (C2C spec §8.3). Rich analytics deferred to V1.5.
const CORRIDORS = [
  { label: "UK → Israel", cases: 8, residency: "UK region", note: "+2 this week" },
  { label: "UK → France", cases: 5, residency: "EEA · HDS-certified", note: "stable" },
  { label: "UK → Turkey", cases: 4, residency: "UK region", note: "1 SCC task open" },
  { label: "UK → Switzerland", cases: 3, residency: "UK region", note: "+1 this week" },
];

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
        <h1 className="text-[28px] font-semibold text-ink">Governance dashboard</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Case flow, consent, and data-residency confirmation across all
          corridors.
        </p>
      </div>

      {/* Corridor stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {CORRIDORS.map((c) => (
          <StatCard
            key={c.label}
            label={c.label}
            value={c.cases}
            delta={{
              tone: c.note.startsWith("+") ? "positive" : c.note.includes("task") ? "negative" : "neutral",
              text: c.note,
            }}
            description={`Residency: ${c.residency}`}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Live case flow */}
        <Card>
          <CardTitle
            action={
              <Link
                href={`/${locale}/admin/audit`}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Audit log
              </Link>
            }
          >
            Live case flow
          </CardTitle>
          <div className="-mx-2 flex flex-col">
            {cases.map((c) => (
              <ListRow
                key={c.id}
                href={`/${locale}/admin/cases/${c.id}`}
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.corridorLabel}`}
                subtitle={`${c.specialty} · ${c.hospital} · residency: ${c.residency}`}
                meta={c.updated}
                badge={<StatusChip status={c.status} />}
              />
            ))}
          </div>
        </Card>

        {/* Compliance side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">Compliance checks</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow
                icon={ScrollText}
                label="Consent records"
                value="All active cases: consent confirmed"
              />
              <DetailPanelRow
                icon={ShieldCheck}
                label="Residency confirmation"
                value="France cases on HDS-certified EEA"
              />
              <DetailPanelRow
                icon={Globe2}
                label="Turkey SCC notification"
                value="1 task due in 3 business days"
              />
            </div>
          </Card>

          <Card className="p-2">
            {[
              { href: `/${locale}/admin/corridors`, label: "Corridor configuration" },
              { href: `/${locale}/admin/hospitals`, label: "Partner hospitals" },
              { href: `/${locale}/admin/users`, label: "Users & roles" },
              { href: `/${locale}/admin/retention`, label: "Retention & DSAR" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-inner px-3 py-3 transition-colors hover:bg-subtle"
              >
                <span className="flex-1 text-[15px] font-medium text-ink">{label}</span>
                <ArrowRight aria-hidden className="size-4 text-ink-muted rtl:-scale-x-100" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
