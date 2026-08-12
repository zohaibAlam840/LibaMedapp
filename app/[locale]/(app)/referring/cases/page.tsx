import CaseFilters from "@/components/case/CaseFilters";
import { getCases } from "@/lib/db/referrals";

// Referring · All cases — scoped to the signed-in clinician's own referrals,
// with working search and filters.
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
        <h1 className="text-[28px] font-semibold text-ink">Your cases</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Every referral you have created, newest first.
        </p>
      </div>
      <CaseFilters
        cases={cases}
        basePath={`/${locale}/referring/cases`}
        emptyTitle="No referrals yet"
        emptyDescription="Start a new referral and it will appear here."
      />
    </div>
  );
}
