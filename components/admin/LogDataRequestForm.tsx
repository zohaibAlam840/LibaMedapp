"use client";

import { useActionState, useState } from "react";
import { Plus, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { logDataRequestAction, type DsarState } from "@/lib/dsarActions";
import { REQUEST_KIND_LABELS, type RequestKind } from "@/lib/dsarTypes";

/**
 * Log a request the moment it arrives — by letter, email or phone. Logging is
 * what starts the one-month statutory clock, so the form is deliberately short:
 * anything that delays recording it eats into the deadline.
 */
export default function LogDataRequestForm({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<DsarState, FormData>(logDataRequestAction, {});

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" /> Log a request
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardTitle
        action={
          <button onClick={() => setOpen(false)} aria-label="Cancel" className="text-ink-secondary hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        }
      >
        Log a data request
      </CardTitle>

      {state.ok ? (
        <div className="flex flex-col gap-3">
          <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
            Logged. The one-month deadline is now running and shows in the list below.
          </p>
          <div className="flex justify-end">
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="locale" value={locale} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Who is asking" htmlFor="dr-name">
              <Input id="dr-name" name="subjectName" required placeholder="Patient's full name" />
            </Field>
            <Field label="Their email" htmlFor="dr-email" hint="Optional — how you'll reply.">
              <Input id="dr-email" name="subjectEmail" type="email" />
            </Field>
            <Field label="What they want" htmlFor="dr-kind">
              <Select id="dr-kind" name="kind" defaultValue="access">
                {(Object.keys(REQUEST_KIND_LABELS) as RequestKind[]).map((k) => (
                  <option key={k} value={k}>
                    {REQUEST_KIND_LABELS[k]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Case reference"
              htmlFor="dr-case"
              hint="Optional — links the request to their referral."
            >
              <Input id="dr-case" name="caseRef" placeholder="LM-2026-0101" />
            </Field>
          </div>
          <Field label="What they asked for" htmlFor="dr-detail" hint="Their words, as close as you can.">
            <Textarea id="dr-detail" name="detail" rows={3} />
          </Field>

          {state.error && (
            <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {state.error}
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px] text-ink-muted">
              You must respond within one calendar month of receipt.
            </p>
            <Button type="submit" size="sm" loading={pending}>
              Log request
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
