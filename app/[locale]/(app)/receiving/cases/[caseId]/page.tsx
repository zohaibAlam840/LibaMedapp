import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Download,
  FileText,
  FileQuestion,
  Globe2,
  MessageSquareText,
  ScanLine,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import StatusChip from "@/components/ui/StatusChip";
import CaseActionBar from "@/components/case/CaseActionBar";
import InfoRequestList from "@/components/case/InfoRequestList";
import { getInfoRequests } from "@/lib/db/clinical";
import { getCase, getDocuments } from "@/lib/db/referrals";

// 9D · Receiving case detail + document access (#43) — acceptance §14.3.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const documents = await getDocuments(caseId);
  const infoRequests = await getInfoRequests(c.ref);
  const base = `/${locale}/receiving/cases/${c.id}`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">
            Case {c.ref} · patient {c.patientRef} · referred from the UK
          </p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
            {c.specialty} referral
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={c.status} />
          <Button size="sm" href={`${base}/treatment-plan`}>
            Respond with plan
          </Button>
        </div>
      </div>

      {/* Next action for the receiving team */}
      <Card>
        <CardTitle className="mb-3">Next step</CardTitle>
        <CaseActionBar locale={locale} side="receiving" caseRef={c.ref} status={c.status} />
      </Card>

      <InfoRequestList
        locale={locale}
        caseRef={c.ref}
        requests={infoRequests}
        canAnswer={false}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle>Clinical summary from referrer</CardTitle>
            {c.clinicalSummary ? (
              <>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
                  {c.clinicalSummary}
                </p>
                {c.clinicalHistory && (
                  <>
                    <p className="mt-4 text-[13px] font-medium text-ink-secondary">
                      Current treatment and relevant history
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">
                      {c.clinicalHistory}
                    </p>
                  </>
                )}
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3 text-[13px] text-ink-secondary">
                  {c.urgency && (
                    <span
                      className={
                        c.urgency === "urgent"
                          ? "rounded-full bg-danger-bg px-2.5 py-0.5 font-medium text-danger-text"
                          : c.urgency === "soon"
                            ? "rounded-full bg-warning-bg px-2.5 py-0.5 font-medium text-warning-text"
                            : "rounded-full bg-subtle px-2.5 py-0.5 font-medium"
                      }
                    >
                      {c.urgency === "urgent"
                        ? "Urgent — days matter"
                        : c.urgency === "soon"
                          ? "Soon — weeks matter"
                          : "Routine"}
                    </span>
                  )}
                  {c.patientDob && <span>DOB {c.patientDob}</span>}
                  {c.patientSex && <span>· {c.patientSex}</span>}
                  {c.referrer && <span>· Referred by {c.referrer}</span>}
                </div>
              </>
            ) : (
              <p className="rounded-inner bg-subtle px-3.5 py-3 text-[13px] text-ink-muted">
                No clinical summary was recorded on this referral.
              </p>
            )}
          </Card>

          <Card>
            <CardTitle>Documents</CardTitle>
            <ul className="flex flex-col gap-2">
              {documents.map((doc) => (
                <li
                  key={doc.name}
                  className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    {doc.type.includes("DICOM") ? (
                      <ScanLine aria-hidden className="size-4.5" />
                    ) : (
                      <FileText aria-hidden className="size-4.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {doc.name}
                    </span>
                    <span className="block text-[13px] text-ink-secondary">
                      {doc.type} · {doc.size}
                    </span>
                  </span>
                  {doc.type.includes("DICOM") ? (
                    <Button variant="secondary" size="sm" href={`${base}/dicom`}>
                      Open
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" aria-label={`Download ${doc.name}`}>
                      <Download aria-hidden className="size-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              Access is logged. Your case access expires after 90 days of
              inactivity and can be renewed on request.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">Case</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow icon={Globe2} label="Corridor" value={c.corridorLabel} />
              <DetailPanelRow icon={ShieldCheck} label="Data residency" value={c.residency} />
              <DetailPanelRow
                icon={Timer}
                label="Response due"
                value="Within 3 working days"
              />
            </div>
          </Card>

          <Card className="p-2">
            {[
              { href: `${base}/treatment-plan`, icon: FileText, label: "Submit treatment plan" },
              { href: `${base}/request-info`, icon: FileQuestion, label: "Request more information" },
              { href: `${base}/messages`, icon: MessageSquareText, label: "Message referrer" },
              { href: `${base}/summary`, icon: FileText, label: "Submit clinical summary" },
            ].map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-inner px-3 py-3 transition-colors hover:bg-subtle"
              >
                <Icon aria-hidden className="size-4.5 text-ink-secondary" />
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
