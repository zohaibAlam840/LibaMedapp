"use client";

import { useActionState, useState } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import { Field, Input, Select } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import Chip from "@/components/ui/Chip";
import { updateInterestAction, type InterestState } from "@/lib/patientInterestActions";
import { INTEREST_STATUSES, STATUS_LABEL, optionLabel } from "@/lib/patientInterest";
import type { Interest } from "@/lib/db/patientInterest";
import { cn } from "@/lib/cn";

const STATUS_STYLE: Record<string, string> = {
  new: "bg-accent-soft text-accent",
  qualified: "bg-success-bg text-success-text",
  contacted: "bg-warning-bg text-warning-text",
  "not-suitable": "bg-subtle text-ink-secondary",
};

/**
 * One enquiry, collapsed to a summary until opened.
 *
 * The free-text description is behind the disclosure rather than in the list:
 * it is health information a member of the public typed about themselves, and
 * it should not be readable over a shoulder from across a room while someone
 * scrolls a list of leads.
 */
export default function InterestRow({ locale, interest }: { locale: string; interest: Interest }) {
  const [state, action] = useActionState<InterestState, FormData>(updateInterestAction, {});
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-inner border border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-start transition-colors hover:bg-subtle"
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-ink">
            {interest.name}
            {interest.postcode ? ` · ${interest.postcode}` : ""}
          </span>
          <span className="block truncate text-[13px] text-ink-secondary">
            {[
              interest.specialtyArea,
              interest.destinationPreference && optionLabel("destinationPreference", interest.destinationPreference),
              interest.timeframe,
              interest.campaignId && `via ${interest.campaignId}`,
            ]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </span>
        <Chip size="sm" className={STATUS_STYLE[interest.status]}>
          {STATUS_LABEL[interest.status]}
        </Chip>
        <span className="hidden text-[13px] text-ink-muted sm:inline">{interest.receivedAt}</span>
        <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-ink-secondary transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-line px-3.5 py-3">
          <dl className="grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
            <Row label="Email" value={interest.email} />
            <Row label="Phone" value={interest.phone || ""} />
            <Row label="Age range" value={interest.ageRange || ""} />
            <Row label="Funding" value={interest.fundingType ? optionLabel("fundingType", interest.fundingType) : ""} />
            <Row label="Budget" value={interest.budgetBand || ""} />
            <Row label="Timeframe" value={interest.timeframe || ""} />
            <Row label="Campaign" value={interest.campaignId || ""} />
            <Row label="Source" value={interest.leadSource || ""} />
          </dl>

          {interest.description && (
            <div className="mt-3 rounded-inner bg-subtle px-3 py-2.5">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                What they&rsquo;re looking for
              </p>
              <p className="whitespace-pre-line text-[13px] text-ink">{interest.description}</p>
            </div>
          )}

          {!interest.consentToContact && (
            <p className="mt-3 flex items-start gap-2 rounded-inner bg-danger-bg px-3 py-2 text-[13px] text-danger-text">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              This person did not agree to be contacted. Do not call or email them.
            </p>
          )}

          <form action={action} className="mt-3 flex flex-wrap items-end gap-3 border-t border-line pt-3">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="id" value={interest.id} />
            <Field label="Status" htmlFor={`s-${interest.id}`} className="w-40">
              <Select id={`s-${interest.id}`} name="status" defaultValue={interest.status}>
                {INTEREST_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Note" htmlFor={`n-${interest.id}`} className="min-w-[200px] flex-1">
              <Input id={`n-${interest.id}`} name="note" defaultValue={interest.note} maxLength={2000} />
            </Field>
            <SubmitButton size="sm" variant="secondary" pendingLabel="Saving…">
              Save
            </SubmitButton>
          </form>

          {state.error && <p className="mt-2 text-[13px] text-danger-text">{state.error}</p>}
          {state.ok && <p className="mt-2 text-[13px] text-success-text">{state.ok}</p>}
          {interest.handledBy && (
            <p className="mt-2 text-[11px] text-ink-muted">Last handled by {interest.handledBy}.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-secondary">{label}</dt>
      <dd className="text-ink">{value || <span className="text-ink-muted">Not given</span>}</dd>
    </div>
  );
}
