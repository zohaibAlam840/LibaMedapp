"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { saveDraftAction, type OriginationState } from "@/lib/introducerActions";
import type { OriginatedCase } from "@/lib/db/cosign";

/**
 * The introducer's case form.
 *
 * Deliberately NOT the clinician intake wizard. An introducer is not making a
 * clinical decision, so they are asked for the background a clinician needs to
 * make one — not for an NHS non-substitution declaration or a consent capture,
 * both of which are the co-signing clinician's to give and are collected from
 * them at signature.
 *
 * No patient name field, anywhere: the case is identified by an opaque
 * reference, the same rule the clinician side follows.
 */
export default function DraftForm({
  locale,
  corridors,
  hospitals,
  existing,
}: {
  locale: string;
  corridors: { id: string; label: string }[];
  hospitals: { id: string; name: string; corridorLabel: string }[];
  existing?: OriginatedCase;
}) {
  const [state, action] = useActionState<OriginationState, FormData>(saveDraftAction, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      {existing && <input type="hidden" name="ref" value={existing.ref} />}

      <Card className="flex flex-col gap-4">
        <CardTitle>The case</CardTitle>

        <Field
          label="Patient reference"
          htmlFor="patientRef"
          hint="An opaque reference you can trace back — never the patient's name."
        >
          <Input
            id="patientRef"
            name="patientRef"
            required
            maxLength={64}
            defaultValue={existing?.patientRef ?? ""}
            placeholder="P-4821"
          />
        </Field>

        <Field label="Corridor" htmlFor="corridorId">
          <Select id="corridorId" name="corridorId" required defaultValue={existing?.corridorId ?? ""}>
            <option value="" disabled>
              Choose a corridor
            </option>
            {corridors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Hospital"
          htmlFor="hospitalId"
          hint="Optional — the co-signing clinician can change this."
        >
          <Select id="hospitalId" name="hospitalId" defaultValue={existing?.hospitalId ?? ""}>
            <option value="">Leave to the clinician</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} — {h.corridorLabel}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Specialty" htmlFor="specialty">
          <Input
            id="specialty"
            name="specialty"
            maxLength={120}
            defaultValue={existing?.specialty ?? ""}
            placeholder="Orthopaedics"
          />
        </Field>

        <Field label="Urgency" htmlFor="urgency">
          <Select id="urgency" name="urgency" defaultValue={existing?.urgency ?? ""}>
            <option value="">Not stated</option>
            <option value="routine">Routine</option>
            <option value="soon">Soon</option>
            <option value="urgent">Urgent</option>
          </Select>
        </Field>
      </Card>

      <Card className="flex flex-col gap-4">
        <CardTitle>Background for the co-signing clinician</CardTitle>
        <p className="text-[13px] text-ink-secondary">
          Write what a clinician needs in order to decide. They will read this before signing,
          and may send it back to you with questions.
        </p>

        <Field label="What is being sought" htmlFor="treatmentScope">
          <Textarea
            id="treatmentScope"
            name="treatmentScope"
            rows={3}
            maxLength={2000}
            defaultValue={existing?.treatmentScope ?? ""}
            placeholder="The treatment or opinion the patient is looking for."
          />
        </Field>

        <Field label="Background" htmlFor="clinicalSummary">
          <Textarea
            id="clinicalSummary"
            name="clinicalSummary"
            rows={6}
            maxLength={5000}
            defaultValue={existing?.clinicalSummary ?? ""}
            placeholder="History, what has been tried, and anything the clinician should know."
          />
        </Field>
      </Card>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Saved as a draft.
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Saving…">
          {existing ? "Save draft" : "Create draft"}
        </SubmitButton>
      </div>
    </form>
  );
}
