import Link from "next/link";
import {
  ArrowRight,
  Download,
  FileText,
  Globe2,
  MessageSquareText,
  ScrollText,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import StatusChip from "@/components/ui/StatusChip";
import StatusTracker from "@/components/case/StatusTracker";
import { DEMO_DOCUMENTS, getDemoCase } from "@/lib/demo";

// 9C · Case detail (#37): header + status tracker + documents + meta.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = getDemoCase(caseId);
  const base = `/${locale}/referring/cases/${c.id}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">
            Case {c.ref} · patient {c.patientRef}
          </p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
            {c.specialty} referral · {c.hospital}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={c.status} />
          <Button size="sm" href={`${base}/messages`}>
            <MessageSquareText aria-hidden className="size-4" />
            Message specialist
          </Button>
        </div>
      </div>

      {/* Status tracker */}
      <Card>
        <StatusTracker status={c.status} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Documents */}
        <Card>
          <CardTitle
            action={
              <Button variant="secondary" size="sm">
                Upload more
              </Button>
            }
          >
            Documents
          </CardTitle>
          <ul className="flex flex-col gap-2">
            {DEMO_DOCUMENTS.map((doc) => (
              <li
                key={doc.name}
                className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FileText aria-hidden className="size-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-ink">
                    {doc.name}
                  </span>
                  <span className="block text-[13px] text-ink-secondary">
                    {doc.type} · {doc.size} · uploaded {doc.uploaded}
                  </span>
                </span>
                <Button variant="ghost" size="sm" aria-label={`Download ${doc.name}`}>
                  <Download aria-hidden className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-muted">
            Every view and download is written to the case audit trail.
          </p>
        </Card>

        {/* Meta panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">Receiving specialist</CardTitle>
            <div className="flex items-center gap-3">
              <Avatar name={c.specialist} size="md" />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-medium text-ink">{c.specialist}</p>
                <p className="truncate text-[13px] text-ink-secondary">{c.hospital}</p>
              </div>
            </div>
            <div className="mt-3 divide-y divide-line border-t border-line">
              <DetailPanelRow icon={Stethoscope} label="Specialty" value={c.specialty} />
              <DetailPanelRow icon={Globe2} label="Corridor" value={c.corridorLabel} />
              <DetailPanelRow icon={ShieldCheck} label="Data residency" value={c.residency} />
            </div>
          </Card>

          <Card className="p-2">
            {[
              { href: `${base}/treatment-plan`, icon: FileText, label: "Treatment plan" },
              { href: `${base}/consent`, icon: ScrollText, label: "Consent record" },
              { href: `${base}/summary`, icon: FileText, label: "Clinical summary" },
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
