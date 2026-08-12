"use client";

import { useActionState, useState } from "react";
import { Check, Copy, TriangleAlert, UserRound } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { invitePatientAction, type InviteState } from "@/lib/patientActions";
import type { PatientInvite } from "@/lib/db/patientInvites";

/**
 * Invite the patient to the read-only portal. Access is per referral: the link
 * grants sight of this case only, and works once. Because no email is sent yet,
 * the clinician copies the link and passes it on themselves.
 */
export default function InvitePatientCard({
  locale,
  caseRef,
  invites,
}: {
  locale: string;
  caseRef: string;
  invites: PatientInvite[];
}) {
  const [state, action, pending] = useActionState<InviteState, FormData>(invitePatientAction, {});
  const [copied, setCopied] = useState(false);

  const active = invites.find((i) => !i.redeemed && !i.expired);
  const redeemed = invites.find((i) => i.redeemed);
  const fullLink = state.link ? `${typeof window !== "undefined" ? window.location.origin : ""}${state.link}` : "";

  return (
    <Card>
      <CardTitle className="mb-1 flex items-center gap-2">
        <UserRound aria-hidden className="size-5 text-accent" />
        Patient access
      </CardTitle>

      {redeemed ? (
        <p className="text-[13px] text-ink-secondary">
          {redeemed.email} activated their portal{redeemed.redeemedAt ? ` on ${redeemed.redeemedAt}` : ""}.
          They can see this referral&rsquo;s progress, consent and documents —
          nothing else.
        </p>
      ) : (
        <>
          <p className="mb-3 text-[13px] text-ink-secondary">
            Give your patient a read-only view of this referral. The link works
            once and covers this case only.
          </p>

          {state.ok && state.link ? (
            <div className="rounded-inner border border-success-bg bg-success-bg/40 p-3.5">
              <p className="text-[13px] font-medium text-ink">
                Invitation ready for {state.email}
              </p>
              <p className="mt-1 text-[13px] text-ink-secondary">
                {state.emailed
                  ? "We've emailed them the link. You can also copy it below if they don't receive it."
                  : "No email was sent — copy this link and pass it to them securely."}
              </p>
              <div className="mt-2.5 flex items-center gap-2 rounded-inner bg-card px-3 py-2">
                <code className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink">
                  {fullLink}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(fullLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-accent hover:underline"
                >
                  {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          ) : (
            <form action={action} className="flex flex-col gap-3">
              <input type="hidden" name="ref" value={caseRef} />
              <input type="hidden" name="locale" value={locale} />
              <Field label="Patient email" htmlFor={`pi-${caseRef}`}>
                <Input
                  id={`pi-${caseRef}`}
                  name="email"
                  type="email"
                  required
                  placeholder="patient@example.com"
                />
              </Field>
              {state.error && (
                <p className="flex items-start gap-2 text-[13px] text-danger-text">
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                  {state.error}
                </p>
              )}
              <div className="flex items-center justify-between gap-3">
                {active && (
                  <p className="text-[12px] text-ink-muted">
                    An unused invitation already exists — sending again replaces it.
                  </p>
                )}
                <Button type="submit" size="sm" loading={pending} className="ms-auto">
                  Create invitation
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </Card>
  );
}
