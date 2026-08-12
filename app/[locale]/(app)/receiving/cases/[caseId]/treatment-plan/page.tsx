import { notFound } from "next/navigation";
import TreatmentPlanForm from "@/components/case/TreatmentPlanForm";
import { getCase } from "@/lib/db/referrals";
import { getTreatmentPlan } from "@/lib/db/clinical";

// 9D · Treatment plan response (#45) — acceptance §14.5.
// Structured response: plan + itemised cost estimate + timeline (C2C §8.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const plan = await getTreatmentPlan(c.ref);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Treatment plan response</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Sent to the referring clinician as a structured plan. Costs must be
          itemised — no hidden fees is a Pledge commitment.
        </p>
      </div>
      <TreatmentPlanForm locale={locale} caseRef={c.ref} plan={plan} />
    </div>
  );
}
