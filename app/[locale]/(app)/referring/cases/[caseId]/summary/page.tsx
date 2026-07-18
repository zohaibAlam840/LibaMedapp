import { CalendarCheck2, Download, FileText, Pill, Stethoscope } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import StatusChip from "@/components/ui/StatusChip";
import { getDemoCase } from "@/lib/demo";

// 9C · Clinical summary handback view (#41) — acceptance §14.8.
// Structured summary returned within 5 working days (Pledge commitment).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const c = getDemoCase(caseId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Clinical summary</h1>
        </div>
        <StatusChip status="summary-returned" />
      </div>

      <Card>
        <CardTitle className="mb-2">Continuity of care handback</CardTitle>
        <p className="mb-4 text-[13px] text-ink-secondary">
          Returned by {c.specialist}, {c.hospital} · 2 working days after
          treatment completion
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <SectionLabel className="mb-1.5">Treatment performed</SectionLabel>
            <p className="text-[15px] leading-relaxed text-ink">
              Robotic-assisted right upper lobectomy performed without
              complication. Final histology confirmed clear margins; two of
              twelve sampled nodes positive, consistent with pre-operative
              staging.
            </p>
          </div>

          <div className="divide-y divide-line rounded-card border border-line px-4">
            <DetailPanelRow icon={Stethoscope} label="Follow-up required" value="Oncology review in 2 weeks; CT at 3 months" />
            <DetailPanelRow icon={Pill} label="Medication changes" value="Adjuvant regimen commenced — full schedule attached" />
            <DetailPanelRow icon={CalendarCheck2} label="Fitness" value="No flying for 4 weeks; wound check at GP in 10 days" />
          </div>

          <div className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FileText aria-hidden className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-ink">
              Structured discharge summary.pdf
            </span>
            <Button variant="ghost" size="sm">
              <Download aria-hidden className="size-4" />
              Download
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
