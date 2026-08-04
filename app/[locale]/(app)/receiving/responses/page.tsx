import { ClipboardList, FileText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { getCases } from "@/lib/db/referrals";
import type { DemoCase } from "@/lib/demo";

// Receiving · Responses (sidebar aggregation) — treatment plans and clinical
// summaries this specialist has sent. Derived from case status: a plan exists
// once the case has left review; a summary exists once it has been returned.
interface Response {
  caseRef: string;
  kind: "Treatment plan" | "Clinical summary";
  when: string;
  c: DemoCase;
}

function responsesFor(cases: DemoCase[]): Response[] {
  const out: Response[] = [];
  for (const c of cases) {
    const sentPlan = ["plan-received", "confirmed", "complete", "summary-returned"].includes(c.status);
    if (sentPlan) out.push({ caseRef: c.ref, kind: "Treatment plan", when: c.updated, c });
    if (c.status === "summary-returned")
      out.push({ caseRef: c.ref, kind: "Clinical summary", when: c.updated, c });
  }
  return out;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cases = await getCases();
  const responses = responsesFor(cases);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Responses</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Treatment plans and clinical summaries you&rsquo;ve authored.
        </p>
      </div>

      <Card>
        <CardTitle
          action={
            responses.length > 0 ? (
              <SegmentedControl
                name="responses-filter"
                defaultValue="all"
                options={[
                  { value: "all", label: "All" },
                  { value: "plans", label: "Plans" },
                  { value: "summaries", label: "Summaries" },
                ]}
              />
            ) : undefined
          }
        >
          {responses.length} responses
        </CardTitle>
        {responses.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No responses yet"
            description="Treatment plans and clinical summaries you send appear here."
          />
        ) : (
          <div className="-mx-2 flex flex-col">
            {responses.map((r) => {
              const isPlan = r.kind === "Treatment plan";
              return (
                <ListRow
                  key={`${r.caseRef}-${r.kind}`}
                  href={`/${locale}/receiving/cases/${r.c.id}/${isPlan ? "treatment-plan" : "summary"}`}
                  chevron
                  leading={
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      {isPlan ? (
                        <ClipboardList aria-hidden className="size-4.5" />
                      ) : (
                        <FileText aria-hidden className="size-4.5" />
                      )}
                    </span>
                  }
                  title={`${r.caseRef} · ${r.kind}`}
                  subtitle={`${r.c.specialty} · ${r.c.hospital}`}
                  meta={r.when}
                  badge={
                    <Chip size="sm" selected>
                      Sent
                    </Chip>
                  }
                />
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
