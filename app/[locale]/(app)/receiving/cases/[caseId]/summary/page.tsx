import { notFound } from "next/navigation";
import { Timer } from "lucide-react";
import ClinicalSummaryForm from "@/components/case/ClinicalSummaryForm";
import { getCase } from "@/lib/db/referrals";
import { getClinicalSummary } from "@/lib/db/clinical";

// 9D · Submit clinical summary (#48) — acceptance §14.8.
// Structured handback to the UK referrer within 5 working days (Pledge + NHS
// safeguard #3).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const summary = await getClinicalSummary(c.ref);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
          Clinical summary handback
        </h1>
      </div>

      {summary?.status !== "sent" && (
        <p className="flex items-center gap-2.5 rounded-inner bg-warning-bg px-4 py-3 text-[13px] text-warning-text">
          <Timer aria-hidden className="size-4 shrink-0" />
          Due within 5 working days of treatment completion.
        </p>
      )}

      <ClinicalSummaryForm locale={locale} caseRef={c.ref} summary={summary} />
    </div>
  );
}
