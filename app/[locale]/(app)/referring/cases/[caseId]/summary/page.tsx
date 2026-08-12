import { notFound } from "next/navigation";
import { Hourglass } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import PrintButton from "@/components/ui/PrintButton";
import { getCase } from "@/lib/db/referrals";
import { getClinicalSummary } from "@/lib/db/clinical";

// The 5-working-day handback as the referring clinician receives it. Printable,
// because it goes into the patient's UK record.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const s = await getClinicalSummary(c.ref);

  const sections = s
    ? [
        { label: "Treatment performed", body: s.treatmentPerformed },
        { label: "Follow-up required", body: s.followUp },
        { label: "Medication changes", body: s.medicationChanges },
        { label: "Fitness / restrictions", body: s.restrictions },
      ].filter((x) => x.body)
    : [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref} · patient {c.patientRef}</p>
          <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Clinical summary</h1>
          {s?.submittedAt && (
            <p className="mt-1 text-[15px] text-ink-secondary">
              Returned {s.submittedAt} by {c.specialist || "the receiving specialist"}, {c.hospital}.
            </p>
          )}
        </div>
        {s?.status === "sent" && <PrintButton />}
      </div>

      {!s || s.status !== "sent" ? (
        <Card>
          <EmptyState
            icon={Hourglass}
            title="Summary not returned yet"
            description="The receiving team returns a structured clinical summary within 5 working days of treatment completion. It will appear here."
          />
        </Card>
      ) : (
        <Card>
          <div className="flex flex-col gap-5">
            {sections.map((x) => (
              <div key={x.label}>
                <CardTitle className="mb-1">{x.label}</CardTitle>
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{x.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-line pt-3 text-xs text-ink-muted">
            This handback is recorded in the case audit trail and forms part of
            the patient&rsquo;s continuity of care.
          </p>
        </Card>
      )}
    </div>
  );
}
