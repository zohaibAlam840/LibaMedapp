import { FolderLock, Globe2, ScrollText, ShieldCheck } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import StatusChip from "@/components/ui/StatusChip";
import StatusTracker from "@/components/case/StatusTracker";
import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getCase, getDocuments, getMessages } from "@/lib/db/referrals";
import { getCaseAuditTrail } from "@/lib/db/audit";
import { getConsentRecords } from "@/lib/db/governance";

// 9E · Case oversight detail (#51): governance view — timeline, clinicians,
// residency + consent confirmation, the case's own audit trail, admin actions.
// Message CONTENT is not shown by default (least privilege) — metadata only.
//
// The trail, the message counts and the consent line are all read from this
// case's rows. On a governance screen an illustrative access record is
// indistinguishable from a real one, and acting on the difference is the whole
// job, so nothing here is stood in for.

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const user = await getSessionUser();
  const c = await getCase(caseId, user);
  if (!c) notFound();

  const [trail, messages, documents, consentRecords] = await Promise.all([
    getCaseAuditTrail(c.ref),
    getMessages(c.ref, user),
    getDocuments(c.ref, user),
    getConsentRecords(user),
  ]);
  const consent = consentRecords.find((r) => r.caseRef === c.ref);
  const lastMessage = messages.at(-1);
  const attachments = messages.filter((m) => m.attachment).length;

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
        {/* Reassign / extend access / flag were buttons here with no action
            behind them. On a governance screen a control that silently does
            nothing is a liability: an admin believes a case was flagged when
            nothing was recorded. They return with the server actions. */}
        <div className="flex items-center gap-2">
          <StatusChip status={c.status} />
        </div>
      </div>

      <Card>
        <StatusTracker status={c.status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Audit trail</CardTitle>
            {trail.length === 0 ? (
              <EmptyState
                icon={ScrollText}
                title="No entries yet"
                description="Every action on this case — consent capture, document access, status change — is written here as it happens."
              />
            ) : (
              <ResponsiveTable
                columns={[
                  { key: "when", label: "Timestamp" },
                  { key: "actor", label: "Actor" },
                  { key: "action", label: "Event" },
                  { key: "object", label: "Detail" },
                ]}
                rows={trail.map((e) => ({
                  id: e.id,
                  cells: {
                    when: <span className="font-mono text-xs">{e.at}</span>,
                    actor: e.actor,
                    action: e.event,
                    object: <span className="text-ink-secondary">{e.detail || "—"}</span>,
                  },
                }))}
              />
            )}
            <p className="mt-3 text-xs text-ink-muted">
              Append-only extract for this case. Full trail in the audit log
              viewer.
            </p>
          </Card>

          <Card>
            <CardTitle>Messaging metadata</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow
                icon={FolderLock}
                label="Messages exchanged"
                value={
                  messages.length === 0
                    ? "None"
                    : `${messages.length}${lastMessage ? ` (last: ${lastMessage.time})` : ""}`
                }
              />
              <DetailPanelRow
                icon={FolderLock}
                label="Documents on this case"
                value={
                  documents.length === 0
                    ? "None"
                    : `${documents.length} ${documents.length === 1 ? "document" : "documents"}` +
                      (attachments > 0 ? ` · ${attachments} sent in the thread` : "")
                }
              />
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
              {/* Access expiry had a row here quoting a countdown. Nothing
                  records when receiving access lapses, so the row is gone
                  rather than filled — a governance panel that states an
                  invented deadline is worse than one that omits it. */}
              <DetailPanelRow
                icon={ScrollText}
                label="Consent"
                value={
                  consent
                    ? `${consent.status === "withdrawn" ? `Withdrawn${consent.withdrawnAt ? ` · ${consent.withdrawnAt}` : ""}` : "Active"}` +
                      (consent.version ? ` · ${consent.version}` : "") +
                      (consent.items > 0 ? ` · ${consent.agreed}/${consent.items} items` : "")
                    : "Not captured"
                }
              />
            </div>
          </Card>

          <Card>
            <SectionLabel className="mb-3">Clinicians on this case</SectionLabel>
            <div className="flex flex-col gap-3">
              {[
                { name: c.referrer || "Not recorded", role: "Referring clinician", side: "Referring" },
                { name: c.specialist || "Not yet assigned", role: c.hospital, side: "Receiving" },
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
