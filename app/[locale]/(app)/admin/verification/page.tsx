import { BadgeCheck, Info } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import RegistrationRow from "@/components/admin/RegistrationRow";
import { getRegistrations } from "@/lib/db/users";

// Registration verification queue. Neither the GMC nor the FCA publishes a free
// lookup API, so verification is a HUMAN step: an admin checks the number on the
// public register and approves or declines. Until then the account cannot reach
// patient data at all.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const all = await getRegistrations();
  const pending = all.filter((a) => a.status === "pending");
  const decided = all.filter((a) => a.status !== "pending").slice(0, 20);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Registration verification</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Check each registration number against the public register before
          approving. Unverified accounts cannot create referrals or see any
          patient data.
        </p>
      </div>

      <p className="flex items-start gap-2.5 rounded-inner bg-accent-soft p-3.5 text-[13px] text-ink">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        There is no automatic register lookup — the GMC and FCA don&rsquo;t offer
        one. Each row links to the right register so you can confirm the number
        belongs to the person applying, then approve or decline. They&rsquo;re
        emailed either way.
      </p>

      <Card>
        <CardTitle>
          Awaiting verification{pending.length > 0 ? ` · ${pending.length}` : ""}
        </CardTitle>
        {pending.length === 0 ? (
          <EmptyState
            icon={BadgeCheck}
            title="Nothing waiting"
            description="New registrations appear here as soon as someone signs up."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((a) => (
              <RegistrationRow key={a.id} account={a} locale={locale} />
            ))}
          </ul>
        )}
      </Card>

      {decided.length > 0 && (
        <Card>
          <CardTitle>Recently decided</CardTitle>
          <ul className="flex flex-col gap-3">
            {decided.map((a) => (
              <RegistrationRow key={a.id} account={a} locale={locale} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
