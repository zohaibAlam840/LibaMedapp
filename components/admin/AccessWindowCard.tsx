"use client";

import { useActionState } from "react";
import { TimerOff, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { extendAccessAction, type GovernanceState } from "@/lib/governanceActions";

/**
 * The receiving hospital's access window on one case, and the way to extend it.
 *
 * A reason is required, not optional: the extension is the exception to a
 * control, and an audit entry saying only "extended by 90 days" answers none of
 * the questions anyone would later ask of it.
 */
export default function AccessWindowCard({
  locale,
  caseRef,
  window,
}: {
  locale: string;
  caseRef: string;
  window: { expiresAt: string; daysLeft: number; expired: boolean } | null;
}) {
  const [state, action] = useActionState<GovernanceState, FormData>(extendAccessAction, {});

  return (
    <Card className="flex flex-col gap-3">
      <CardTitle>
        <span className="flex items-center gap-2">
          <TimerOff aria-hidden className="size-4.5 text-ink-secondary" />
          Receiving access
        </span>
      </CardTitle>

      {!window ? (
        <p className="text-sm text-ink-secondary">
          No window is running. It starts when the hospital accepts the case — a referral waiting
          in a queue is not being worked on, so its clock has not started.
        </p>
      ) : (
        <p className="text-sm text-ink-secondary">
          {window.expired ? (
            <>
              Closed on <b className="font-medium text-ink">{window.expiresAt}</b>. The hospital can
              still read this case but can no longer change it.
            </>
          ) : (
            <>
              Runs to <b className="font-medium text-ink">{window.expiresAt}</b> — {window.daysLeft}{" "}
              {window.daysLeft === 1 ? "day" : "days"} left.
            </>
          )}
        </p>
      )}

      {window && (
        <form action={action} className="flex flex-col gap-3 border-t border-line pt-3">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="ref" value={caseRef} />

          <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
            <Field label="Extend by" htmlFor="days">
              <Select id="days" name="days" defaultValue="30">
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </Select>
            </Field>
            <Field label="Why" htmlFor="reason">
              <Input
                id="reason"
                name="reason"
                required
                maxLength={500}
                placeholder="Recorded in the audit log"
              />
            </Field>
          </div>

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
            <SubmitButton size="sm" variant="secondary" pendingLabel="Extending…">
              Extend window
            </SubmitButton>
          </div>
        </form>
      )}
    </Card>
  );
}
