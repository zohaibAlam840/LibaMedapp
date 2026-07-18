import WizardShell from "@/components/wizard/WizardShell";
import Chip from "@/components/ui/Chip";
import { Field, Textarea } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/Card";

// 9C · Intake step 2 — clinical summary.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <WizardShell
      locale={locale}
      step="clinical"
      lede="A short summary the receiving specialist will read first. Plain language is fine."
    >
      <div className="flex flex-col gap-5">
        <Field
          label="Working diagnosis and reason for referral"
          htmlFor="c-summary"
          hint="2–6 sentences. Include what you'd tell a colleague over the phone."
        >
          <Textarea id="c-summary" rows={6} placeholder="e.g. 58-year-old with stage II NSCLC…" />
        </Field>

        <div>
          <SectionLabel className="mb-2">Urgency</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Chip name="urgency" value="routine" defaultSelected>
              Routine
            </Chip>
            <Chip name="urgency" value="soon">
              Soon — weeks matter
            </Chip>
            <Chip name="urgency" value="urgent">
              Urgent — days matter
            </Chip>
          </div>
        </div>

        <Field
          label="Current treatment and relevant history"
          htmlFor="c-history"
          hint="Optional at this step — detailed records go in Documents."
        >
          <Textarea id="c-history" rows={4} />
        </Field>
      </div>
    </WizardShell>
  );
}
