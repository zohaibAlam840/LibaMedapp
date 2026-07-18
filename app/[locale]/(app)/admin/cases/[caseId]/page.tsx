import { Flag, FolderLock, Globe2, ScrollText, ShieldCheck, Timer, UserRoundCog } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import StatusChip from "@/components/ui/StatusChip";
import StatusTracker from "@/components/case/StatusTracker";
import { DEMO_SPECIALIST, DEMO_USER, getDemoCase } from "@/lib/demo";

// 9E · Case oversight detail (#51): governance view — timeline, clinicians,
// residency + consent confirmation, document-access log, admin actions.
// Message CONTENT is not shown by default (least privilege) — metadata only.
const ACCESS_LOG = [
  { id: "1", when: "16 Jul 2026 14:22:31", actor: "Dr. Noa Peretz (receiving)", action: "Downloaded", object: "MRI thorax (DICOM)", from: "Ramat Gan, IL" },
  { id: "2", when: "16 Jul 2026 09:05:12", actor: "Dr. Noa Peretz (receiving)", action: "Viewed", object: "Blood panel — June.pdf", from: "Ramat Gan, IL" },
  { id: "3", when: "13 Jul 2026 16:40:02", actor: "Dr. Amara Chen (referring)", action: "Uploaded", object: "MRI thorax (DICOM)", from: "London, UK" },
  { id: "4", when: "12 Jul 2026 09:41:44", actor: "Dr. Amara Chen (referring)", action: "Captured consent", object: "Consent v2 · 5 items", from: "London, UK" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const c = getDemoCase(caseId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">
            Governance oversight · case {c.ref}
          </p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
            {c.specialty} · {c.corridorLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={c.status} />
          <Button variant="secondary" size="sm">
            <UserRoundCog aria-hidden className="size-4" /> Reassign
          </Button>
          <Button variant="secondary" size="sm">
            <Timer aria-hidden className="size-4" /> Extend access
          </Button>
          <Button variant="danger" size="sm">
            <Flag aria-hidden className="size-4" /> Flag
          </Button>
        </div>
      </div>

      <Card>
        <StatusTracker status={c.status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Document access log</CardTitle>
            <ResponsiveTable
              columns={[
                { key: "when", label: "Timestamp" },
                { key: "actor", label: "Actor" },
                { key: "action", label: "Action" },
                { key: "object", label: "Object" },
                { key: "from", label: "From" },
              ]}
              rows={ACCESS_LOG.map((r) => ({ id: r.id, cells: r }))}
            />
            <p className="mt-3 text-xs text-ink-muted">
              Append-only extract. Full trail in the audit log viewer.
            </p>
          </Card>

          <Card>
            <CardTitle>Messaging metadata</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow icon={FolderLock} label="Messages exchanged" value="9 (last: Tue 08:30)" />
              <DetailPanelRow icon={FolderLock} label="Attachments in thread" value="1 document" />
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Message content is not shown to governance by default —
              least-privilege access. Content review requires a logged
              justification.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">Compliance</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow icon={Globe2} label="Corridor" value={c.corridorLabel} />
              <DetailPanelRow icon={ShieldCheck} label="Residency confirmed" value={c.residency} />
              <DetailPanelRow icon={ScrollText} label="Consent" value="Active · v2 · 5/5 items" />
              <DetailPanelRow icon={Timer} label="Receiving access expires" value="74 days (renewable)" />
            </div>
          </Card>

          <Card>
            <SectionLabel className="mb-3">Clinicians on this case</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { ...DEMO_USER, side: "Referring" },
                { ...DEMO_SPECIALIST, side: "Receiving" },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <Avatar name={p.name} size="md" />
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-medium text-ink">{p.name}</p>
                    <p className="truncate text-[13px] text-ink-secondary">
                      {p.side} · {p.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
