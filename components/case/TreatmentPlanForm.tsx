"use client";

import { useActionState, useState } from "react";
import { Plus, Send, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { saveTreatmentPlanAction, type ClinicalState } from "@/lib/clinicalActions";
import type { CostItem, TreatmentPlan } from "@/lib/db/clinical";

const STAYS = ["Day case", "1–3 days", "4–7 days", "Over a week"];
const CURRENCIES = ["GBP", "EUR", "USD", "ILS", "TRY", "CHF"];

/**
 * Treatment plan response. Costs are itemised rather than a single figure —
 * "transparent about cost, always" is a public Pledge commitment, so the form
 * makes the breakdown the natural thing to fill in.
 *
 * Draft saves quietly; Send moves the case to "plan received" and notifies the
 * referring clinician.
 */
export default function TreatmentPlanForm({
  locale,
  caseRef,
  plan,
}: {
  locale: string;
  caseRef: string;
  plan: TreatmentPlan | null;
}) {
  const [state, action, pending] = useActionState<ClinicalState, FormData>(
    saveTreatmentPlanAction,
    {},
  );
  const [items, setItems] = useState<CostItem[]>(
    plan?.costItems?.length ? plan.costItems : [{ label: "", amount: 0 }],
  );
  const [currency, setCurrency] = useState(plan?.currency ?? "GBP");

  const subtotal = items.reduce((s, i) => s + (Number.isFinite(i.amount) ? i.amount : 0), 0);
  const update = (i: number, patch: Partial<CostItem>) =>
    setItems((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="ref" value={caseRef} />
      <input type="hidden" name="locale" value={locale} />

      {plan?.status === "sent" && (
        <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
          Sent to the referring clinician{plan.submittedAt ? ` on ${plan.submittedAt}` : ""}.
          Editing and sending again replaces it.
        </p>
      )}

      <Card>
        <CardTitle>Plan</CardTitle>
        <div className="flex flex-col gap-4">
          <Field
            label="Proposed treatment"
            htmlFor="plan"
            hint="What you would tell the referring clinician directly."
          >
            <Textarea id="plan" name="proposedCare" rows={6} defaultValue={plan?.proposedCare ?? ""} />
          </Field>
          <Field label="Expected inpatient stay" htmlFor="stay">
            <Select id="stay" name="inpatientStay" defaultValue={plan?.inpatientStay ?? ""}>
              <option value="">Select…</option>
              {STAYS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle>Costs &amp; timeline</CardTitle>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency" htmlFor="currency">
            <Select
              id="currency"
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Earliest start" htmlFor="start">
            <Input id="start" name="earliestStart" type="date" defaultValue={plan?.earliestStartRaw ?? ""} />
          </Field>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <SectionLabel>Itemised estimate</SectionLabel>
          <p className="text-[13px] text-ink-muted">
            Break the cost down. The referring clinician and the patient both see
            these lines.
          </p>

          {items.map((item, i) => (
            <div key={i} className="grid gap-2 sm:grid-cols-[1fr_170px_auto]">
              <Input
                name="costLabel"
                value={item.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="e.g. Surgery and theatre"
                aria-label={`Cost item ${i + 1} description`}
              />
              <Input
                name="costAmount"
                inputMode="decimal"
                value={item.amount || ""}
                onChange={(e) => update(i, { amount: Number(e.target.value.replace(/[^0-9.]/g, "")) })}
                placeholder="0.00"
                aria-label={`Cost item ${i + 1} amount`}
              />
              <button
                type="button"
                onClick={() => setItems((r) => r.filter((_, j) => j !== i))}
                aria-label={`Remove cost item ${i + 1}`}
                className="flex size-11 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-danger-bg hover:text-danger-text"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setItems((r) => [...r, { label: "", amount: 0 }])}
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
          >
            <Plus aria-hidden className="size-4" />
            Add line
          </button>
        </div>

        <div className="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div className="max-w-[220px] flex-1">
            <Field label="Total estimate" htmlFor="total" hint="Leave blank to use the sum of the lines.">
              <Input
                id="total"
                name="costTotal"
                inputMode="decimal"
                defaultValue={plan?.costTotal ?? ""}
                placeholder={subtotal ? String(subtotal) : "0.00"}
              />
            </Field>
          </div>
          <p className="pb-2.5 text-[13px] text-ink-secondary" style={{ fontVariantNumeric: "tabular-nums" }}>
            Lines total: <b className="text-ink">{currency} {subtotal.toFixed(2)}</b>
          </p>
        </div>

        <Field label="Notes" htmlFor="notes" hint="Anything the estimate does not cover." className="mt-4">
          <Textarea id="notes" name="notes" rows={3} defaultValue={plan?.notes ?? ""} />
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
          Send to referrer
        </Button>
      </div>
    </form>
  );
}
