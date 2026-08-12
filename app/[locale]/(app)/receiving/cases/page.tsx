import CaseFilters from "@/components/case/CaseFilters";
import { getCases } from "@/lib/db/referrals";

// Receiving · Active cases — scoped to this specialist's hospital queue.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Active cases</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Referrals addressed to you at your hospital.
        </p>
      </div>
      <CaseFilters
        cases={cases}
        basePath={`/${locale}/receiving/cases`}
        emptyTitle="No cases in your queue"
        emptyDescription="Referrals sent to your hospital will appear here."
      />
    </div>
  );
}
