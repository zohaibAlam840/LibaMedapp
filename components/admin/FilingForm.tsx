"use client";

import { useActionState } from "react";
import { TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { recordFilingAction, type GovernanceState } from "@/lib/governanceActions";

/**
 * Record a regulator notification.
 *
 * The authority is pre-filled from the corridor's own configuration rather than
 * typed, so a filing can't be recorded against a body that corridor doesn't
 * answer to. The reference is free text — every regulator formats theirs
 * differently and a wrong mask would block a valid entry.
 */
export default function FilingForm({
  locale,
  corridors,
}: {
  locale: string;
  corridors: { id: string; label: string; authority: string }[];
}) {
  const [state, action] = useActionState<GovernanceState, FormData>(recordFilingAction, {});
  const today = new Date().toISOString().slice(0, 10);

  if (corridors.length === 0) return null;

  return (
    <form action={action}>
      <input type="hidden" name="locale" value={locale} />
      <Card className="flex flex-col gap-4">
        <CardTitle>Record a filing</CardTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Corridor" htmlFor="corridorId">
            <Select id="corridorId" name="corridorId" required defaultValue={corridors[0].id}>
              {corridors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label} — {c.authority}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Authority"
            htmlFor="authority"
            hint="As configured on the corridor."
          >
            <Select id="authority" name="authority" required defaultValue={corridors[0].authority}>
              {[...new Set(corridors.map((c) => c.authority))].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Filed on" htmlFor="filedAt">
            <Input id="filedAt" name="filedAt" type="date" required max={today} defaultValue={today} />
          </Field>

          <Field
            label="Review by"
            htmlFor="reviewBy"
            hint="Optional — leave empty if the notification doesn't need renewing."
          >
            <Input id="reviewBy" name="reviewBy" type="date" />
          </Field>
        </div>

        <Field label="Regulator's reference" htmlFor="reference">
          <Input id="reference" name="reference" maxLength={200} placeholder="As issued by the authority" />
        </Field>

        <Field label="Note" htmlFor="note">
          <Textarea id="note" name="note" rows={3} maxLength={2000} placeholder="What was filed, and by whom." />
        </Field>

        {state.error && (
          <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
            {state.ok}
          </p>
        )}

        <div className="flex justify-end">
          <SubmitButton size="sm" pendingLabel="Recording…">
            Record filing
          </SubmitButton>
        </div>
      </Card>
    </form>
  );
}
