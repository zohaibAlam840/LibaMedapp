import Link from "next/link";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import SearchInput from "@/components/ui/SearchInput";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import StatusChip from "@/components/ui/StatusChip";
import { CorridorBadge } from "@/components/ui/Badges";
import { DEMO_CASES } from "@/lib/demo";

// Admin/manager · All cases (sidebar aggregation) — case flow across every
// corridor. Governance sees status/routing/residency; message content is not
// shown here (least privilege — Vol III §3.3).
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
        <h1 className="text-[28px] font-semibold text-ink">All cases</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Every case across all corridors. Opening one is logged, exactly like
          any other access.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <Card>
          <CardTitle>{DEMO_CASES.length} cases</CardTitle>
          <SearchInput placeholder="Search by case reference" className="mb-3" />
          <ResponsiveTable
            columns={[
              { key: "ref", label: "Case" },
              { key: "corridor", label: "Corridor" },
              { key: "specialty", label: "Specialty" },
              { key: "residency", label: "Residency" },
              { key: "status", label: "Status" },
            ]}
            rows={DEMO_CASES.map((c) => ({
              id: c.id,
              cells: {
                ref: (
                  <Link
                    href={`/${locale}/admin/cases/${c.id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    {c.ref}
                    <span className="block text-xs font-normal text-ink-muted">
                      Patient {c.patientRef}
                    </span>
                  </Link>
                ),
                corridor: <CorridorBadge code={CODE[c.corridor]} label={c.corridorLabel} />,
                specialty: c.specialty,
                residency: c.residency,
                status: <StatusChip status={c.status} />,
              },
            }))}
          />
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
          <SectionLabel className="mb-1">Flags</SectionLabel>
          <div className="flex flex-col">
            <Checkbox label="Consent issue" />
            <Checkbox label="Overdue vs SLA" />
            <Checkbox label="Access expiring" />
          </div>
        </Card>
      </div>
    </div>
  );
}
