import { Download, Lock, Search } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Field";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

// 9E · Audit log viewer (#57) — acceptance §14.9. Append-only, tamper-evident.
// Export gated on `canExportAudit` (Vol III §0.4). Admin views are themselves
// audited.
const EVENTS = [
  { t: "18 Jul 2026 11:04:22", actor: "Dr. Noa Peretz", role: "receiving", action: "Downloaded", object: "MRI thorax (DICOM) · LM-2026-0142", ip: "Ramat Gan, IL", result: "OK" },
  { t: "18 Jul 2026 10:58:07", actor: "Dr. Noa Peretz", role: "receiving", action: "Viewed", object: "Case LM-2026-0142", ip: "Ramat Gan, IL", result: "OK" },
  { t: "18 Jul 2026 09:12:40", actor: "Sam Okafor", role: "admin", action: "Exported", object: "Consent records (France)", ip: "Cardiff, UK", result: "OK" },
  { t: "18 Jul 2026 08:30:15", actor: "Dr. Amara Chen", role: "referring", action: "Sent message", object: "Case LM-2026-0142", ip: "London, UK", result: "OK" },
  { t: "17 Jul 2026 16:22:03", actor: "Unknown", role: "—", action: "Access denied (403)", object: "Case LM-2026-0139", ip: "Unknown", result: "DENIED" },
  { t: "17 Jul 2026 14:19:55", actor: "Dr. Amara Chen", role: "referring", action: "Captured consent", object: "Consent v2 · LM-2026-0142", ip: "London, UK", result: "OK" },
];

export default async function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Audit log</h1>
          <p className="mt-1 flex items-center gap-1.5 text-[15px] text-ink-secondary">
            <Lock aria-hidden className="size-4" />
            Append-only and tamper-evident — every case is reconstructable from
            this alone.
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Download aria-hidden className="size-4" /> Export (CSV / JSON)
        </Button>
      </div>

      <Card>
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchInput placeholder="Search actor, object, case ref" className="max-w-xs flex-1" />
          <Select defaultValue="" className="h-11 w-auto min-w-36">
            <option value="">All actions</option>
            <option>View</option>
            <option>Download</option>
            <option>Export</option>
            <option>Consent</option>
            <option>Access denied</option>
          </Select>
          <Select defaultValue="" className="h-11 w-auto min-w-36">
            <option value="">All corridors</option>
            <option>Israel</option>
            <option>France</option>
            <option>Turkey</option>
            <option>Switzerland</option>
          </Select>
          <Button variant="secondary" size="sm">
            <Search aria-hidden className="size-4" /> Last 7 days
          </Button>
        </div>

        <ResponsiveTable
          columns={[
            { key: "t", label: "Timestamp" },
            { key: "actor", label: "Actor" },
            { key: "action", label: "Action" },
            { key: "object", label: "Object" },
            { key: "ip", label: "From" },
            { key: "result", label: "Result" },
          ]}
          rows={EVENTS.map((e, i) => ({
            id: `${e.t}-${i}`,
            cells: {
              t: <span className="font-mono text-xs">{e.t}</span>,
              actor: (
                <span>
                  {e.actor}
                  <span className="block text-xs text-ink-muted">{e.role}</span>
                </span>
              ),
              action: e.action,
              object: <span className="text-ink-secondary">{e.object}</span>,
              ip: e.ip,
              result:
                e.result === "DENIED" ? (
                  <Chip size="sm" className="bg-danger-bg text-danger-text">Denied</Chip>
                ) : (
                  <Chip size="sm" className="bg-success-bg text-success-text">OK</Chip>
                ),
            },
          }))}
        />

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            Showing 6 of 12,480 events · hash-chain verified ✓
          </p>
          <Button variant="secondary" size="sm">
            Load more
          </Button>
        </div>
      </Card>
    </div>
  );
}
