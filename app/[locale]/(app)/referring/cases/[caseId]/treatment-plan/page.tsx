import { CalendarClock, Coins, FileText } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import StatusChip from "@/components/ui/StatusChip";
import { getDemoCase } from "@/lib/demo";

// 9C · Treatment plan received view (#39) — acceptance §14.5.
// Itemised costs before treatment is a Pledge commitment (no hidden fees).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = getDemoCase(caseId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Treatment plan</h1>
        </div>
        <StatusChip status="plan-received" />
      </div>

      <Card>
        <div className="flex items-center gap-3 border-b border-line pb-4">
          <Avatar name={c.specialist} size="md" />
          <div>
            <p className="text-[15px] font-medium text-ink">{c.specialist}</p>
            <p className="text-[13px] text-ink-secondary">
              {c.hospital} · received 2 days ago
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-5">
          <div>
            <SectionLabel className="mb-1.5">Proposed treatment</SectionLabel>
            <p className="text-[15px] leading-relaxed text-ink">
              Following MDT review we recommend robotic-assisted lobectomy with
              adjuvant chemotherapy. Pre-operative assessment can be completed
              within one week of arrival; expected inpatient stay is 5–7 days
              with outpatient follow-up at two weeks.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-inner bg-subtle p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
                <Coins aria-hidden className="size-4" /> Estimated cost
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">£24,800</p>
              <p className="text-xs text-ink-muted">
                Itemised estimate attached · no platform fees added
              </p>
            </div>
            <div className="rounded-inner bg-subtle p-4">
              <p className="flex items-center gap-2 text-[13px] font-medium text-ink-secondary">
                <CalendarClock aria-hidden className="size-4" /> Earliest start
              </p>
              <p className="mt-1 text-2xl font-semibold text-ink">3 weeks</p>
              <p className="text-xs text-ink-muted">Subject to pre-op results</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FileText aria-hidden className="size-4" />
            </span>
            <span className="flex-1 text-sm font-medium text-ink">
              Itemised cost breakdown.pdf
            </span>
            <Button variant="ghost" size="sm">
              Download
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="secondary" href={`/${locale}/referring/cases/${c.id}/messages`}>
          Discuss with specialist
        </Button>
        <Button>Confirm and proceed</Button>
      </div>
    </div>
  );
}
