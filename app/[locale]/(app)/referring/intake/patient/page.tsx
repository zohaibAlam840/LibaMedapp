import WizardShell from "@/components/wizard/WizardShell";
import { Field, Input, Select } from "@/components/ui/Field";

// 9C · Intake step 1 — patient details (acceptance §14.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <WizardShell
      locale={locale}
      step="patient"
      lede="Only the minimum needed to open the case. You'll attach records later."
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient first name" htmlFor="p-first">
            <Input id="p-first" autoComplete="off" />
          </Field>
          <Field label="Patient last name" htmlFor="p-last">
            <Input id="p-last" autoComplete="off" />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="p-dob">
            <Input id="p-dob" type="date" />
          </Field>
          <Field label="NHS number" htmlFor="p-nhs" hint="Optional — 10 digits.">
            <Input id="p-nhs" inputMode="numeric" placeholder="000 000 0000" />
          </Field>
        </div>
        <Field
          label="Patient contact email"
          htmlFor="p-email"
          hint="Used only for consent confirmation — the patient never gets platform access."
        >
          <Input id="p-email" type="email" autoComplete="off" />
        </Field>
        <Field label="Sex recorded at birth" htmlFor="p-sex">
          <Select id="p-sex" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            <option>Female</option>
            <option>Male</option>
            <option>Prefer not to say</option>
          </Select>
        </Field>
      </div>
    </WizardShell>
  );
}
