"use client";

import { useActionState } from "react";
import { Send, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { saveClinicalSummaryAction, type ClinicalState } from "@/lib/clinicalActions";
import type { ClinicalSummary } from "@/lib/db/clinical";

/**
 * Clinical summary handback (NHS safeguard #3) — the structured document that
 * returns the patient to UK care. Returning it moves the case to
 * "summary returned", which is what closes the continuity-of-care loop.
 */
export default function ClinicalSummaryForm({
  locale,
  caseRef,
  summary,
}: {
  locale: string;
  caseRef: string;
  summary: ClinicalSummary | null;
}) {
  const [state, action, pending] = useActionState<ClinicalState, FormData>(
    saveClinicalSummaryAction,
    {},
  );

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="ref" value={caseRef} />
      <input type="hidden" name="locale" value={locale} />

      {summary?.status === "sent" && (
        <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Returned to the referring clinician
          {summary.submittedAt ? ` on ${summary.submittedAt}` : ""}. Editing and
          returning again replaces it.
        </p>
      )}

      <Card>
        <CardTitle>Summary for the UK referrer</CardTitle>
        <div className="flex flex-col gap-4">
          <Field
            label="Treatment performed"
            htmlFor="s-treatment"
            hint="What was done, and the outcome."
          >
            <Textarea
              id="s-treatment"
              name="treatmentPerformed"
              rows={5}
              defaultValue={summary?.treatmentPerformed ?? ""}
            />
          </Field>
          <Field
            label="Follow-up required"
            htmlFor="s-followup"
            hint="What UK care needs to do, and when."
          >
            <Textarea id="s-followup" name="followUp" rows={3} defaultValue={summary?.followUp ?? ""} />
          </Field>
          <Field label="Medication changes" htmlFor="s-meds">
            <Textarea
              id="s-meds"
              name="medicationChanges"
              rows={3}
              defaultValue={summary?.medicationChanges ?? ""}
            />
          </Field>
          <Field label="Fitness / restrictions" htmlFor="s-fitness">
            <Input
              id="s-fitness"
              name="restrictions"
              placeholder="e.g. no flying for 4 weeks"
              defaultValue={summary?.restrictions ?? ""}
            />
          </Field>
        </div>
      </Card>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Draft saved.
        </p>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          name="intent"
          value="draft"
          variant="secondary"
          loading={pending}
          disabled={pending}
        >
          Save draft
        </Button>
        <Button type="submit" name="intent" value="send" loading={pending} disabled={pending}>
          <Send aria-hidden className="size-4" />
          Return to referrer
        </Button>
      </div>
    </form>
  );
}
