import { CheckCircle2, Clock, FileWarning, TriangleAlert } from "lucide-react";
import FilingForm from "@/components/admin/FilingForm";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { getCases } from "@/lib/db/referrals";
import { getCorridorDuties, getFilings, regulatoryReady, type CorridorDuty } from "@/lib/db/regulatory";
import { deleteFilingAction } from "@/lib/governanceActions";

export const metadata = { title: "Regulatory filings · LibaMed" };

const STATE: Record<CorridorDuty["state"], { label: string; className: string }> = {
  "not-required": { label: "Nothing transferred yet", className: "bg-subtle text-ink-secondary" },
  satisfied: { label: "Filed", className: "bg-success-bg text-success-text" },
  "due-for-review": { label: "Due for review", className: "bg-warning-bg text-warning-text" },
  outstanding: { label: "Not filed", className: "bg-danger-bg text-danger-text" },
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();
  const ready = await regulatoryReady();

  const cases = await getCases(user);
  const counts = new Map<string, number>();
  for (const c of cases) counts.set(c.corridor, (counts.get(c.corridor) ?? 0) + 1);

  const duties = ready ? await getCorridorDuties(counts) : [];
  const filings = ready ? await getFilings() : [];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Regulatory filings</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Corridors that transfer under Standard Contractual Clauses owe their regulator a
          notification. This is the record of whether it was filed — until now nothing held it,
          so Attention flagged the same task for ever.
        </p>
      </div>

      {!ready && (
        <p className="flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Migration 007 hasn&rsquo;t been applied, so filings can&rsquo;t be recorded yet.
        </p>
      )}

      {ready && duties.length === 0 && (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="No corridor requires a notification"
            description="Every configured corridor transfers under an adequacy decision, so no regulator notice is owed."
          />
        </Card>
      )}

      {ready && duties.length > 0 && (
        <Card className="flex flex-col gap-3">
          <CardTitle>Duties by corridor</CardTitle>
          <ul className="divide-y divide-line">
            {duties.map((d) => (
              <li key={d.corridorId} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">
                    {d.authority} — {d.label}
                  </span>
                  <span className="block text-[13px] text-ink-secondary">
                    {d.cases} {d.cases === 1 ? "case" : "cases"} · notice due within{" "}
                    {d.withinBusinessDays} business days of the first transfer
                    {d.latest && ` · last filed ${d.latest.filedAt}`}
                    {d.latest?.reviewBy && ` · review by ${d.latest.reviewBy}`}
                  </span>
                </span>
                <Chip size="sm" className={STATE[d.state].className}>
                  {STATE[d.state].label}
                </Chip>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {ready && (
        <FilingForm
          locale={locale}
          corridors={duties.map((d) => ({
            id: d.corridorId,
            label: d.label,
            authority: d.authority,
          }))}
        />
      )}

      {ready && filings.length > 0 && (
        <Card className="flex flex-col gap-3">
          <CardTitle>
            <span className="flex items-center gap-2">
              <Clock aria-hidden className="size-4.5 text-ink-secondary" />
              History
            </span>
          </CardTitle>
          <ul className="divide-y divide-line">
            {filings.map((f) => (
              <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-ink">
                    {f.authority} · filed {f.filedAt}
                    {!f.current && (
                      <span className="ms-2 text-[13px] font-normal text-warning-text">
                        review passed
                      </span>
                    )}
                  </span>
                  <span className="block text-[13px] text-ink-secondary">
                    {[
                      f.reference && `Ref ${f.reference}`,
                      f.reviewBy && `Review by ${f.reviewBy}`,
                      f.filedBy && `Recorded by ${f.filedBy}`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {f.note && (
                    <span className="mt-1 block whitespace-pre-line text-[13px] text-ink">
                      {f.note}
                    </span>
                  )}
                </span>
                <form action={deleteFilingAction}>
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={f.id} />
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
          <p className="flex items-start gap-2 text-xs text-ink-muted">
            <FileWarning aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Remove is for entries made in error. A superseded notification should be replaced by
            recording the new one, so the history stays readable.
          </p>
        </Card>
      )}
    </div>
  );
}
