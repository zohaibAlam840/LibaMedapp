import { ScrollText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import SearchInput from "@/components/ui/SearchInput";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { CorridorBadge } from "@/components/ui/Badges";
import { DEMO_CASES } from "@/lib/demo";

// 9E · Consent records viewer (#58) — acceptance §14.7. Each record shows the
// exact wording shown at the time, per-item grants, and the withdrawal history.
const CODE: Record<string, string> = { israel: "IL", france: "FR", turkey: "TR", switzerland: "CH" };

export default async function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Consent records</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Immutable and versioned. The exact wording shown to each patient is
          stored with the record.
        </p>
      </div>

      <Card>
        <CardTitle>All records</CardTitle>
        <SearchInput placeholder="Search by case reference" className="mb-3" />
        <ResponsiveTable
          columns={[
            { key: "ref", label: "Case" },
            { key: "corridor", label: "Corridor" },
            { key: "version", label: "Version" },
            { key: "items", label: "Items", align: "end" },
            { key: "captured", label: "Captured" },
            { key: "status", label: "Status" },
          ]}
          rows={DEMO_CASES.map((c, i) => ({
            id: c.id,
            cells: {
              ref: (
                <span className="font-medium">
                  {c.ref}
                  <span className="block text-xs font-normal text-ink-muted">Patient {c.patientRef}</span>
                </span>
              ),
              corridor: <CorridorBadge code={CODE[c.corridor]} label={c.corridorLabel} />,
              version: "v2",
              items: "5 / 5",
              captured: "12 Jul 2026",
              status:
                c.status === "consent-withdrawn" ? (
                  <Chip size="sm" className="bg-danger-bg text-danger-text">Withdrawn</Chip>
                ) : i === 4 ? (
                  <Chip size="sm" className="bg-subtle text-ink-secondary">Expired</Chip>
                ) : (
                  <Chip size="sm" selected>Active</Chip>
                ),
            },
          }))}
        />
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <ScrollText aria-hidden className="size-3.5" />
          Opening a record shows the versioned wording, per-item grants, and the
          full event history including any withdrawal.
        </p>
      </Card>
    </div>
  );
}
