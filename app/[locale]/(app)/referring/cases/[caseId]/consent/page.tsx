import { notFound } from "next/navigation";
import { CheckCircle2, ScrollText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import WithdrawConsentCard from "@/components/case/WithdrawConsentCard";
import { getCase, getReferralCompliance } from "@/lib/db/referrals";

// 9C · Consent view + withdrawal flow (#40) — acceptance §14.7.
// Withdrawal triggers the stop-processing workflow and is logged immutably.
const FALLBACK_ITEMS = [
  "Sharing records with the named receiving specialist",
  "Transfer of records to the destination country",
  "Data categories: referral letter, labs, imaging incl. DICOM",
  "Purpose limited to this referral",
  "Right to withdraw at any time",
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const record = await getReferralCompliance(caseId);
  const consent = record?.patientConsent;
  const items = consent?.items?.length
    ? consent.items.map((i) => i.label)
    : FALLBACK_ITEMS;
  const withdrawn = c.status === "consent-withdrawn" || Boolean(consent?.withdrawnAt);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Consent record</h1>
      </div>

      <Card>
        <CardTitle className="mb-2">
          {withdrawn ? "Consent · withdrawn" : "Active consent"}
          {consent?.version ? ` · ${consent.version}` : ""}
        </CardTitle>
        <p className="mb-4 flex items-center gap-2 text-[13px] text-ink-secondary">
          <ScrollText aria-hidden className="size-4" />
          {consent?.capturedAt ? `Captured ${consent.capturedAt}` : "Captured on submit"} · immutable
        </p>
        <ul className="divide-y divide-line rounded-card border border-line px-4">
          {items.map((item) => (
            <li key={item} className="flex items-center gap-3 py-3">
              <CheckCircle2 aria-hidden className="size-5 shrink-0 text-success-text" />
              <span className="text-[15px] text-ink">{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          The exact wording shown to the patient is stored with this record and
          can be exported for audit.
        </p>
      </Card>

      <WithdrawConsentCard
        locale={locale}
        caseRef={c.ref}
        withdrawn={withdrawn}
        withdrawnAt={consent?.withdrawnAt}
      />
    </div>
  );
}
