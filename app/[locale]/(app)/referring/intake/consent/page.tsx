import { ScrollText } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Checkbox from "@/components/ui/Checkbox";

// 9C · Intake step 5 — itemised consent (acceptance §14.2/§14.7).
// Consent is structured, versioned, and stored immutably — NOT a checkbox flag
// (C2C spec §7.3). Wording below is placeholder; real per-corridor wording is
// legally supplied. The capture mechanism stores the exact wording shown.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <WizardShell
      locale={locale}
      step="consent"
      lede="Confirm each item with your patient. Each line is recorded separately, with the exact wording and time."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2.5 rounded-inner bg-subtle p-3.5 text-[13px] text-ink-secondary">
          <ScrollText aria-hidden className="size-4 shrink-0" />
          Consent wording v2 · UK → Israel corridor · placeholder text pending
          legal review
        </div>

        <div className="divide-y divide-line rounded-card border border-line px-4">
          <Checkbox
            label="Sharing the patient's records with the named receiving specialist"
            description="Dr. Noa Peretz, Sheba Medical Center — and their direct clinical team only"
          />
          <Checkbox
            label="Transfer of records to Israel"
            description="An EU-adequate destination; UK GDPR safeguards documented for this corridor"
          />
          <Checkbox
            label="The categories of data being shared"
            description="Referral letter, laboratory results, imaging (including DICOM)"
          />
          <Checkbox
            label="Purpose limited to this referral"
            description="Review, treatment planning, and continuity of care for this case only"
          />
          <Checkbox
            label="The patient's right to withdraw at any time"
            description="Withdrawal stops further processing and is logged immutably"
          />
        </div>

        <p className="text-[13px] text-ink-muted">
          By continuing you confirm the patient has given informed consent to
          each item above. The consent record is timestamped and cannot be
          edited after submission.
        </p>
      </div>
    </WizardShell>
  );
}
