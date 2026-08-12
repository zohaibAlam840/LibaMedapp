import { notFound } from "next/navigation";
import RequestInfoForm from "@/components/case/RequestInfoForm";
import { getCase } from "@/lib/db/referrals";

// 9D · Request additional information (#46) — without leaving the platform.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
          Request more information
        </h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Goes straight to the referring clinician&rsquo;s case — no email needed.
        </p>
      </div>
      <RequestInfoForm locale={locale} caseRef={c.ref} />
    </div>
  );
}
