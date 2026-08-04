import { ArrowRight, CheckCircle2, ClipboardCheck, FileCheck2, Send } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import { advanceStatusAction } from "@/lib/referralActions";
import type { CaseStatus } from "@/lib/caseStatus";

// Renders the status-transition action(s) available to the current side at the
// current status. Each is a server-action <form> — one click moves the case
// forward, writes an audit entry, and revalidates. Terminal / not-your-turn
// states render a short waiting note instead of a button.

interface Transition {
  to: CaseStatus;
  event: string;
  label: string;
  icon: typeof ArrowRight;
  variant?: "primary" | "accent";
}

// side → current status → the action that side can take next.
const TRANSITIONS: Record<"referring" | "receiving", Partial<Record<CaseStatus, Transition>>> = {
  receiving: {
    submitted: { to: "under-review", event: "Case accepted for review", label: "Accept for review", icon: ClipboardCheck, variant: "accent" },
    "under-review": { to: "plan-received", event: "Treatment plan submitted", label: "Submit treatment plan", icon: Send, variant: "accent" },
    confirmed: { to: "complete", event: "Treatment completed", label: "Mark treatment complete", icon: CheckCircle2, variant: "accent" },
    complete: { to: "summary-returned", event: "Clinical summary returned", label: "Return clinical summary", icon: FileCheck2, variant: "accent" },
  },
  referring: {
    "plan-received": { to: "confirmed", event: "Referral confirmed by referrer", label: "Confirm & proceed", icon: CheckCircle2, variant: "primary" },
  },
};

const WAIT_NOTE: Partial<Record<CaseStatus, string>> = {
  "consent-withdrawn": "Patient consent was withdrawn — this case is closed to further processing.",
  "access-expired": "Access to this case has expired.",
  "summary-returned": "The clinical summary has been returned. This case is complete.",
};

export default function CaseActionBar({
  locale,
  side,
  caseRef,
  status,
}: {
  locale: string;
  side: "referring" | "receiving";
  caseRef: string;
  status: CaseStatus;
}) {
  const note = WAIT_NOTE[status];
  if (note) {
    return (
      <p className="rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">{note}</p>
    );
  }

  const t = TRANSITIONS[side][status];
  if (!t) {
    return (
      <p className="rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
        {side === "referring"
          ? "Waiting on the receiving team for the next step."
          : "Waiting on the referring clinician for the next step."}
      </p>
    );
  }

  const Icon = t.icon;
  return (
    <form action={advanceStatusAction}>
      <input type="hidden" name="ref" value={caseRef} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="status" value={t.to} />
      <input type="hidden" name="event" value={t.event} />
      <SubmitButton variant={t.variant ?? "primary"} size="sm" pendingLabel="Working…">
        <Icon aria-hidden className="size-4" />
        {t.label}
      </SubmitButton>
    </form>
  );
}
