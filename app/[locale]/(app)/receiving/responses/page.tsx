import { ClipboardList, FileText } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Chip from "@/components/ui/Chip";
import { DEMO_CASES } from "@/lib/demo";

// Receiving · Responses (sidebar aggregation) — treatment plans and clinical
// summaries this specialist has drafted or sent.
const RESPONSES = [
  { caseId: "LM-2026-0139", kind: "Treatment plan", state: "Sent", when: "2 days ago" },
  { caseId: "LM-2026-0133", kind: "Treatment plan", state: "Draft", when: "Yesterday" },
  { caseId: "LM-2026-0127", kind: "Clinical summary", state: "Sent", when: "5 days ago" },
  { caseId: "LM-2026-0118", kind: "Clinical summary", state: "Sent", when: "1 week ago" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const target = (id: string) => DEMO_CASES.find((c) => c.id === id) ?? DEMO_CASES[0];

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
            <SegmentedControl
              name="responses-filter"
              defaultValue="all"
              options={[
                { value: "all", label: "All" },
                { value: "plans", label: "Plans" },
                { value: "summaries", label: "Summaries" },
              ]}
            />
          }
        >
          {RESPONSES.length} responses
        </CardTitle>
        <div className="-mx-2 flex flex-col">
          {RESPONSES.map((r) => {
            const c = target(r.caseId);
            const isPlan = r.kind === "Treatment plan";
            return (
              <ListRow
                key={`${r.caseId}-${r.kind}`}
                href={`/${locale}/receiving/cases/${c.id}/${isPlan ? "treatment-plan" : "summary"}`}
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
                title={`${r.caseId} · ${r.kind}`}
                subtitle={`${c.specialty} · ${c.hospital}`}
                meta={r.when}
                badge={
                  r.state === "Draft" ? (
                    <Chip size="sm" className="bg-warning-bg text-warning-text">Draft</Chip>
                  ) : (
                    <Chip size="sm" selected>Sent</Chip>
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
