"use client";

import { useState } from "react";
import { CheckCircle2, ShieldX } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import SubmitButton from "@/components/ui/SubmitButton";
import Checkbox from "@/components/ui/Checkbox";
import { withdrawConsentAction } from "@/lib/referralActions";

/**
 * Consent-withdrawal card. Withdrawal is irreversible and halts processing, so
 * it's gated behind an explicit confirmation checkbox before the destructive
 * server action can fire. If already withdrawn, shows the settled state.
 */
export default function WithdrawConsentCard({
  locale,
  caseRef,
  withdrawn,
  withdrawnAt,
}: {
  locale: string;
  caseRef: string;
  withdrawn: boolean;
  withdrawnAt?: string;
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (withdrawn) {
    return (
      <Card className="border border-danger-bg">
        <CardTitle className="mb-1 flex items-center gap-2">
          <ShieldX aria-hidden className="size-5 text-danger-text" />
          Consent withdrawn
        </CardTitle>
        <p className="text-sm text-ink-secondary">
          Patient consent was withdrawn{withdrawnAt ? ` on ${withdrawnAt}` : ""}. All
          processing has stopped and the receiving team no longer has access. This
          is recorded immutably in the audit trail.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-danger-bg">
      <CardTitle className="mb-1">Withdraw consent</CardTitle>
      <p className="text-sm text-ink-secondary">
        If your patient withdraws, all further processing stops immediately: the
        receiving team loses access, and the withdrawal is logged with time and
        actor. This cannot be undone from the platform.
      </p>

      <div className="mt-4 rounded-inner border border-line px-4">
        <Checkbox
          label="I confirm the patient has withdrawn their consent for this referral."
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
      </div>

      <form action={withdrawConsentAction} className="mt-4 flex justify-end">
        <input type="hidden" name="ref" value={caseRef} />
        <input type="hidden" name="locale" value={locale} />
        <input type="hidden" name="side" value="referring" />
        <SubmitButton variant="danger" size="sm" disabled={!confirmed} pendingLabel="Withdrawing…">
          <CheckCircle2 aria-hidden className="size-4" />
          Withdraw consent now
        </SubmitButton>
      </form>
    </Card>
  );
}
