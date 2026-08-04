"use client";

import WizardShell from "@/components/wizard/WizardShell";
import { Field, Textarea } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/Card";
import { useIntake } from "@/lib/intakeStore";
import { cn } from "@/lib/cn";

const URGENCY: { value: "routine" | "soon" | "urgent"; label: string }[] = [
  { value: "routine", label: "Routine" },
  { value: "soon", label: "Soon — weeks matter" },
  { value: "urgent", label: "Urgent — days matter" },
];

// Intake step 2 — clinical summary, bound to the draft store.
export default function ClinicalStep({ locale }: { locale: string }) {
  const { data, set } = useIntake();

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
          <Textarea
            id="c-summary"
            rows={6}
            placeholder="e.g. 58-year-old with stage II NSCLC…"
            value={data.summary}
            onChange={(e) => set({ summary: e.target.value })}
          />
        </Field>

        <div>
          <SectionLabel className="mb-2">Urgency</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {URGENCY.map((u) => {
              const active = data.urgency === u.value;
              return (
                <button
                  key={u.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ urgency: u.value })}
                  className={cn(
                    "inline-flex h-[34px] items-center rounded-full border px-4 text-sm transition-colors",
                    active
                      ? "border-accent-border bg-accent-soft font-medium text-accent"
                      : "border-transparent bg-subtle text-ink hover:border-line-strong",
                  )}
                >
                  {u.label}
                </button>
              );
            })}
          </div>
        </div>

        <Field
          label="Current treatment and relevant history"
          htmlFor="c-history"
          hint="Optional at this step — detailed records go in Documents."
        >
          <Textarea
            id="c-history"
            rows={4}
            value={data.history}
            onChange={(e) => set({ history: e.target.value })}
          />
        </Field>
      </div>
    </WizardShell>
  );
}
