import { ScrollText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";
import { getCases } from "@/lib/db/referrals";

// Referring · Consent (sidebar aggregation) — every consent record across the
// clinician's cases. Each links to that case's itemised consent + withdrawal.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Consent records</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Itemised, versioned, and immutable. Withdrawal stops processing
          immediately and is logged.
        </p>
      </div>

      <Card>
        <CardTitle>Across your cases</CardTitle>
        <div className="-mx-2 flex flex-col">
          {cases.map((c, i) => {
            const withdrawn = c.status === "consent-withdrawn";
            const expiringSoon = i === 1;
            return (
              <ListRow
                key={c.id}
                href={`/${locale}/referring/cases/${c.id}/consent`}
                chevron
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <ScrollText aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · wording v2`}
                subtitle={`Patient ${c.patientRef} · 5 items · captured 12 Jul 2026`}
                badge={
                  withdrawn ? (
                    <Chip size="sm" className="bg-danger-bg text-danger-text">Withdrawn</Chip>
                  ) : expiringSoon ? (
                    <Chip size="sm" className="bg-warning-bg text-warning-text">Expires in 9 days</Chip>
                  ) : (
                    <Chip size="sm" selected>Active</Chip>
                  )
                }
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
