"use client";

import { useActionState, useState } from "react";
import { Send, TriangleAlert } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { requestInfoAction, type ClinicalState } from "@/lib/clinicalActions";
import { cn } from "@/lib/cn";

const COMMON = [
  "Histopathology report",
  "Recent bloods",
  "Prior imaging",
  "Medication list",
  "Comorbidity history",
];

/** Ask the referring clinician for missing records, inside the platform. */
export default function RequestInfoForm({
  locale,
  caseRef,
}: {
  locale: string;
  caseRef: string;
}) {
  const [state, action, pending] = useActionState<ClinicalState, FormData>(requestInfoAction, {});
  const [picked, setPicked] = useState<string[]>([]);

  const toggle = (t: string) =>
    setPicked((p) => (p.includes(t) ? p.filter((x) => x !== t) : [...p, t]));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="ref" value={caseRef} />
      <input type="hidden" name="locale" value={locale} />
      {picked.map((t) => (
        <input key={t} type="hidden" name="items" value={t} />
      ))}

      <Card>
        <CardTitle>What do you need?</CardTitle>
        <SectionLabel className="mb-2">Commonly requested</SectionLabel>
        <div className="mb-5 flex flex-wrap gap-2">
          {COMMON.map((t) => {
            const on = picked.includes(t);
            return (
              <button
                key={t}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(t)}
                className={cn(
                  "inline-flex h-[34px] items-center rounded-full border px-4 text-sm transition-colors",
                  on
                    ? "border-accent-border bg-accent-soft font-medium text-accent"
                    : "border-transparent bg-subtle text-ink hover:border-line-strong",
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
        <Field
          label="Details"
          htmlFor="details"
          hint="Be specific — the referrer sees this exactly as written."
        >
          <Textarea id="details" name="note" rows={5} />
        </Field>
      </Card>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="secondary" href={`/${locale}/receiving/cases/${caseRef}`}>
          Cancel
        </Button>
        <Button type="submit" loading={pending} disabled={pending}>
          <Send aria-hidden className="size-4" />
          Send request
        </Button>
      </div>
    </form>
  );
}
