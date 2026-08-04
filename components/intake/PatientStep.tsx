"use client";

import WizardShell from "@/components/wizard/WizardShell";
import { Field, Input, Select } from "@/components/ui/Field";
import { useIntake } from "@/lib/intakeStore";

// Intake step 1 — patient details (acceptance §14.2), bound to the draft store.
export default function PatientStep({ locale }: { locale: string }) {
  const { data, set } = useIntake();

  return (
    <WizardShell
      locale={locale}
      step="patient"
      lede="Only the minimum needed to open the case. You'll attach records later."
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Patient first name" htmlFor="p-first">
            <Input
              id="p-first"
              autoComplete="off"
              value={data.firstName}
              onChange={(e) => set({ firstName: e.target.value })}
            />
          </Field>
          <Field label="Patient last name" htmlFor="p-last">
            <Input
              id="p-last"
              autoComplete="off"
              value={data.lastName}
              onChange={(e) => set({ lastName: e.target.value })}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Date of birth" htmlFor="p-dob">
            <Input
              id="p-dob"
              type="date"
              value={data.dob}
              onChange={(e) => set({ dob: e.target.value })}
            />
          </Field>
          <Field label="NHS number" htmlFor="p-nhs" hint="Optional — 10 digits.">
            <Input
              id="p-nhs"
              inputMode="numeric"
              placeholder="000 000 0000"
              value={data.nhs}
              onChange={(e) => set({ nhs: e.target.value })}
            />
          </Field>
        </div>
        <Field
          label="Patient contact email"
          htmlFor="p-email"
          hint="Used only for consent confirmation — the patient never gets platform access."
        >
          <Input
            id="p-email"
            type="email"
            autoComplete="off"
            value={data.email}
            onChange={(e) => set({ email: e.target.value })}
          />
        </Field>
        <Field label="Sex recorded at birth" htmlFor="p-sex">
          <Select
            id="p-sex"
            value={data.sex}
            onChange={(e) => set({ sex: e.target.value })}
          >
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
