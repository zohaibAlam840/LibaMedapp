import { ScrollText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { CorridorBadge } from "@/components/ui/Badges";
import { getSessionUser } from "@/lib/auth";
import { getConsentRecords } from "@/lib/db/governance";

// 9E · Consent records viewer (#58) — acceptance §14.7. Each record shows the
// exact wording shown at the time, per-item grants, and the withdrawal history.
//
// Version, item counts and capture dates are read from the stored record. A
// consent record is legal evidence: showing a placeholder version or a stand-in
// date next to a real case reference would misrepresent what a patient agreed
// to, so anything absent renders as "—".
const CODE: Record<string, string> = { israel: "IL", france: "FR", turkey: "TR", switzerland: "CH" };

export default async function Page() {
  const user = await getSessionUser();
  const records = await getConsentRecords(user);

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
        <CardTitle>All records{records.length > 0 && ` · ${records.length}`}</CardTitle>
        {records.length === 0 ? (
          <EmptyState
            icon={ScrollText}
            title="No consent records yet"
            description="A record is written the moment a referring clinician captures consent during intake, and cannot be edited afterwards."
          />
        ) : (
          <>
            <ResponsiveTable
              columns={[
                { key: "ref", label: "Case" },
                { key: "corridor", label: "Corridor" },
                { key: "version", label: "Version" },
                { key: "items", label: "Items", align: "end" },
                { key: "captured", label: "Captured" },
                { key: "status", label: "Status" },
              ]}
              rows={records.map((r) => ({
                id: r.id,
                cells: {
                  ref: (
                    <span className="font-medium">
                      {r.caseRef}
                      <span className="block text-xs font-normal text-ink-muted">
                        Patient {r.patientRef}
                      </span>
                    </span>
                  ),
                  corridor: (
                    <CorridorBadge code={CODE[r.corridorId] ?? "—"} label={r.corridorLabel} />
                  ),
                  version: r.version || "—",
                  items: r.items > 0 ? `${r.agreed} / ${r.items}` : "—",
                  captured: r.capturedAt || "—",
                  status:
                    r.status === "withdrawn" ? (
                      <Chip size="sm" className="bg-danger-bg text-danger-text">
                        Withdrawn{r.withdrawnAt && ` · ${r.withdrawnAt}`}
                      </Chip>
                    ) : (
                      <Chip size="sm" selected>
                        Active
                      </Chip>
                    ),
                },
              }))}
            />
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
              <ScrollText aria-hidden className="size-3.5" />
              Opening a record shows the versioned wording, per-item grants, and the
              full event history including any withdrawal.
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
