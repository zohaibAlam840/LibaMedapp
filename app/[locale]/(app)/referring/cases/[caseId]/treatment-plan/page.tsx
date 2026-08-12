import { notFound } from "next/navigation";
import { CalendarClock, FileText, Hourglass, Stethoscope } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import EmptyState from "@/components/ui/EmptyState";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import CaseActionBar from "@/components/case/CaseActionBar";
import { getCase } from "@/lib/db/referrals";
import { getTreatmentPlan } from "@/lib/db/clinical";

// The plan as the referring clinician receives it: proposed care, an itemised
// cost breakdown (never a single opaque figure), and the earliest start date.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const plan = await getTreatmentPlan(c.ref);
  const money = (n: number) =>
    `${plan?.currency ?? "GBP"} ${n.toFixed(2)}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Treatment plan</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          From {c.specialist || "the receiving specialist"} at {c.hospital}.
        </p>
      </div>

      {!plan || plan.status !== "sent" ? (
        <Card>
          <EmptyState
            icon={Hourglass}
            title="No plan yet"
            description="The receiving specialist has not sent a treatment plan for this case. You will see it here as soon as they do."
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardTitle className="mb-2">Proposed treatment</CardTitle>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">
              {plan.proposedCare}
            </p>
            <div className="mt-4 divide-y divide-line border-t border-line">
              {plan.inpatientStay && (
                <DetailPanelRow icon={Stethoscope} label="Expected inpatient stay" value={plan.inpatientStay} />
              )}
              {plan.earliestStart && (
                <DetailPanelRow icon={CalendarClock} label="Earliest start" value={plan.earliestStart} />
              )}
              {plan.submittedAt && (
                <DetailPanelRow icon={FileText} label="Received" value={plan.submittedAt} />
              )}
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-2">Cost estimate</CardTitle>
            {plan.costItems.length === 0 ? (
              <p className="text-[13px] text-ink-muted">No itemised breakdown was provided.</p>
            ) : (
              <ul className="divide-y divide-line rounded-inner border border-line px-4">
                {plan.costItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-2.5 text-[15px]">
                    <span className="min-w-0 text-ink">{item.label}</span>
                    <span className="shrink-0 font-medium text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {money(item.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {plan.costTotal !== null && (
              <p className="mt-3 flex items-center justify-between border-t border-line pt-3 text-[15px]">
                <span className="font-medium text-ink">Total estimate</span>
                <span className="font-semibold text-ink" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(plan.costTotal)}
                </span>
              </p>
            )}
            {plan.notes && (
              <p className="mt-3 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
                {plan.notes}
              </p>
            )}
            <NoFeeNotice compact className="mt-4" />
          </Card>

          <Card>
            <CardTitle className="mb-3">Next step</CardTitle>
            <CaseActionBar locale={locale} side="referring" caseRef={c.ref} status={c.status} />
          </Card>
        </>
      )}
    </div>
  );
}
