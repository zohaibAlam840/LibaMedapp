"use client";

import { useActionState, useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import { Field, Select, Textarea } from "@/components/ui/Field";
import SubmitButton from "@/components/ui/SubmitButton";
import { cosignCaseAction, declineCosignAction, type CosignState } from "@/lib/cosignActions";
import { NON_SUBSTITUTION_OPTIONS } from "@/lib/referral";

/**
 * Co-sign or send back.
 *
 * The NHS non-substitution declaration is collected HERE rather than from the
 * introducer, because it is a clinical statement: only a clinician can say this
 * referral is not displacing NHS care. Signing it makes the signer the
 * referring clinician of record — the attestation says so in those words, so
 * nobody can sign thinking they are merely approving someone else's referral.
 */
export default function CosignForm({ locale, caseRef }: { locale: string; caseRef: string }) {
  const [signState, signAction] = useActionState<CosignState, FormData>(cosignCaseAction, {});
  const [declineState, declineAction] = useActionState<CosignState, FormData>(
    declineCosignAction,
    {},
  );
  const [showDecline, setShowDecline] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <form action={signAction}>
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="ref" value={caseRef} />

        <Card className="flex flex-col gap-4">
          <CardTitle>Co-sign this referral</CardTitle>

          <Field
            label="Why this is not substituting for NHS care"
            htmlFor="nsReason"
            hint="Required on every referral, introducer-originated or not."
          >
            <Select id="nsReason" name="nsReason" required defaultValue="">
              <option value="" disabled>
                Choose a reason
              </option>
              {NON_SUBSTITUTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Your clinical justification" htmlFor="nsJustification">
            <Textarea
              id="nsJustification"
              name="nsJustification"
              rows={4}
              required
              maxLength={2000}
              placeholder="Why this referral is appropriate for this patient."
            />
          </Field>

          <Checkbox
            name="attest"
            required
            label="I am taking clinical responsibility for this referral"
            description="Co-signing records you as the referring clinician of record. The hospital will correspond with you, not with the introducer."
          />

          {signState.error && (
            <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {signState.error}
            </p>
          )}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowDecline((v) => !v)}
              className="rounded-full px-4 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
            >
              Send back instead
            </button>
            <SubmitButton pendingLabel="Co-signing…">Co-sign and send</SubmitButton>
          </div>
        </Card>
      </form>

      {showDecline && (
        <form action={declineAction}>
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="ref" value={caseRef} />
          <Card className="flex flex-col gap-4">
            <CardTitle>Send back to the introducer</CardTitle>
            <p className="text-sm text-ink-secondary">
              The case returns to them as a draft with your note. It is not rejected — they can
              revise it and submit it again.
            </p>
            <Field label="What is missing or wrong" htmlFor="note">
              <Textarea id="note" name="note" rows={4} required maxLength={2000} />
            </Field>

            {declineState.error && (
              <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                {declineState.error}
              </p>
            )}

            <div className="flex justify-end">
              <SubmitButton variant="secondary" pendingLabel="Sending…">
                Send back
              </SubmitButton>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
}
