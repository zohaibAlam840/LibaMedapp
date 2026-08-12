import { ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import JoinPortalForm from "@/components/auth/JoinPortalForm";
import { lookupInvite } from "@/lib/db/patientInvites";

// Patients arrive here from the single-use link their clinician gave them.
// The token is validated server-side before the form is shown, so an expired or
// already-used link never renders a password box.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale } = await params;
  const { token } = await searchParams;
  const invite = token ? await lookupInvite(token) : null;

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-12">
      {!invite ? (
        <Card className="p-8">
          <EmptyState
            icon={ShieldCheck}
            title="This link is no longer valid"
            description="Invitations can only be used once and expire after 14 days. Please ask your clinician's practice for a new one."
          />
        </Card>
      ) : (
        <Card className="p-7">
          <CardTitle className="mb-1">Set up your access</CardTitle>
          <p className="mb-5 text-[15px] text-ink-secondary">
            You&rsquo;ve been invited to follow your referral
            {invite.caseRef ? ` (${invite.caseRef})` : ""}. Choose a password and
            you&rsquo;ll be able to see its progress, what you consented to, and
            your documents.
          </p>
          <JoinPortalForm locale={locale} token={token!} email={invite.email} />
          <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 text-[13px] text-ink-secondary">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            This account only ever shows this one referral. It is read-only — you
            cannot change any clinical information.
          </p>
        </Card>
      )}
    </div>
  );
}
