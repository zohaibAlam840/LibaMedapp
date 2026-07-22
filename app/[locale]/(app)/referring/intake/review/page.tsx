import Link from "next/link";
import { FileText, Globe2, ScrollText, ShieldAlert, Stethoscope, UserRound } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import { DEMO_DOCUMENTS } from "@/lib/demo";
import { getCorridor } from "@/lib/corridors";

// 9C · Intake step 7 — review & submit (acceptance §14.2). Now surfaces the
// NHS non-substitution declaration (item 1) and data-transfer basis (item 5)
// before the GP commits.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const corridor = getCorridor("israel");
  const edit = (step: string) => (
    <Link
      href={`/${locale}/referring/intake/${step}`}
      className="text-[13px] font-medium text-accent hover:underline"
    >
      Edit
    </Link>
  );

  return (
    <WizardShell
      locale={locale}
      step="review"
      lede="Check everything once. After you submit, the case gets a unique reference and consent is locked."
    >
      <div className="divide-y divide-line rounded-card border border-line px-4">
        <DetailPanelRow
          icon={UserRound}
          label="Patient"
          value="Patient reference issued on submit · DOB 14 Mar 1968"
          trailing={edit("patient")}
        />
        <DetailPanelRow
          icon={Stethoscope}
          label="Referral"
          value="Oncology · routine · working diagnosis recorded"
          trailing={edit("clinical")}
        />
        <DetailPanelRow
          icon={Globe2}
          label="Destination"
          value="Sheba Medical Center · UK → Israel corridor"
          trailing={edit("corridor")}
        />
        <DetailPanelRow
          icon={ShieldAlert}
          label="NHS non-substitution"
          value="NHS wait exceeds clinical threshold · justification recorded"
          trailing={edit("declaration")}
        />
        <DetailPanelRow
          icon={FileText}
          label="Documents"
          value={`${DEMO_DOCUMENTS.length} attached, incl. 1 DICOM series`}
          trailing={edit("documents")}
        />
        <DetailPanelRow
          icon={ScrollText}
          label="Patient consent"
          value="5 of 5 items confirmed · v2026-07"
          trailing={edit("consent")}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <TransferBasisNotice corridor={corridor} />
        <NoFeeNotice compact />
      </div>

      <p className="mt-4 text-[13px] text-ink-muted">
        On submit: records are stored in the corridor&rsquo;s region, the named
        specialist is notified, and every step — including this declaration and
        consent — is written to the immutable audit trail.
      </p>
    </WizardShell>
  );
}
