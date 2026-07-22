import { UserRound } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import ConsentChecklist from "@/components/ui/ConsentChecklist";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import { getCorridor } from "@/lib/corridors";
import { getDemoHospital } from "@/lib/demo";

// 9C · Intake step 6 — SEPARATE patient consent (NHS-safeguard item 6).
// Distinct from the GP's referral action: the patient confirms they understand
// their records leave the UK, to which country, and under what safeguard.
// Structured, versioned, stored immutably — never a single checkbox (§7.3).
//
// Demo assumption: the Israel corridor (the intake default). The country and
// safeguard shown are read from the corridor config, so they stay accurate.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const corridor = getCorridor("israel");
  const hospital = getDemoHospital(corridor.hospitalId);

  return (
    <WizardShell
      locale={locale}
      step="consent"
      lede="This is the patient's own consent — captured separately from your referral. Confirm each item with them; each line is recorded with its exact wording and time."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 rounded-inner border border-accent-border bg-accent-soft/60 p-3.5 text-[13px] text-ink">
          <UserRound aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            The patient must understand that their records will leave the UK for{" "}
            <b className="font-medium">{corridor.country}</b>, and the safeguard
            that protects that transfer.
          </span>
        </div>

        <TransferBasisNotice corridor={corridor} />

        <ConsentChecklist
          items={[
            {
              title: `My records will be shared with clinicians in ${corridor.country}`,
              body: `${hospital.name} and the named specialist's direct clinical team only.`,
              version: "Consent v2026-07 · shown now",
            },
            {
              title: "I understand the legal safeguard for this transfer",
              body: corridor.safeguard,
              version: "Consent v2026-07 · shown now",
            },
            {
              title: "The categories of data being shared",
              body: "Referral letter, laboratory results, and imaging (including DICOM).",
              version: "Consent v2026-07 · shown now",
            },
            {
              title: "Purpose is limited to this referral",
              body: "Review, treatment planning, and continuity of care for this case only.",
              version: "Consent v2026-07 · shown now",
            },
            {
              title: "I can withdraw consent at any time",
              body: "Withdrawal stops further processing and is logged immutably.",
              version: "Consent v2026-07 · shown now",
            },
          ]}
        />

        <p className="text-[13px] text-ink-muted">
          By continuing you confirm the patient has given informed consent to each
          item above. The consent record is timestamped and cannot be edited after
          submission.
        </p>
      </div>
    </WizardShell>
  );
}
