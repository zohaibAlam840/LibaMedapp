"use client";

import { useState } from "react";
import { ArrowRight, Info } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Button from "@/components/ui/Button";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import { Field, Select, Textarea } from "@/components/ui/Field";
import { NON_SUBSTITUTION_OPTIONS } from "@/lib/referral";

const MIN_JUSTIFICATION = 10;

/**
 * Intake step — NHS non-substitution declaration (NHS-safeguard item 1). The GP
 * must state why NHS care is not the substitute before the referral can proceed;
 * Continue is gated until a reason and a real justification are given. The
 * declaration is written to the referral's audit trail (item 2).
 */
export default function NonSubstitutionStep({
  locale,
  nextHref,
}: {
  locale: string;
  nextHref: string;
}) {
  const [reason, setReason] = useState("");
  const [justification, setJustification] = useState("");
  const valid = reason !== "" && justification.trim().length >= MIN_JUSTIFICATION;

  return (
    <WizardShell
      locale={locale}
      step="declaration"
      lede="Referrals abroad must not substitute for care the NHS would provide. State the basis for this referral — it is recorded in the audit trail."
      footerNext={
        valid ? (
          <Button href={`/${locale}${nextHref}`} className="flex-1 sm:flex-none">
            Continue
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        ) : (
          <Button disabled className="flex-1 sm:flex-none">
            Continue
            <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <Field label="Basis for referring outside the NHS" htmlFor="ns-reason">
          <Select
            id="ns-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          >
            <option value="" disabled>
              Select a reason…
            </option>
            {NON_SUBSTITUTION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Clinical justification"
          htmlFor="ns-justification"
          hint={
            justification.trim().length < MIN_JUSTIFICATION
              ? `Add a short justification (at least ${MIN_JUSTIFICATION} characters).`
              : "Recorded verbatim in the referral audit trail."
          }
        >
          <Textarea
            id="ns-justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            placeholder="e.g. NHS pathway wait exceeds the clinical threshold for this patient."
          />
        </Field>

        <p className="flex items-start gap-2.5 rounded-inner bg-accent-soft p-3.5 text-[13px] text-ink">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          This declaration protects both you and your patient: it evidences that
          the referral complements, and does not replace, available NHS care.
        </p>

        <NoFeeNotice />
      </div>
    </WizardShell>
  );
}
