import { AlertTriangle, FolderLock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";
import { DEMO_CASES } from "@/lib/demo";

// Coordinator · Overdue (sidebar aggregation) — cases past their expected
// response window, for the coordinator to chase. Days-waiting drives urgency.
const OVERDUE = [
  { id: "LM-2026-0133", days: 4, specialist: "Dr. Emre Kaya", severity: "high" },
  { id: "LM-2026-0139", days: 2, specialist: "Dr. Claire Moreau", severity: "medium" },
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
        <h1 className="text-[28px] font-semibold text-ink">Overdue responses</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Cases past the expected response window. Chase the specialist or flag
          for reassignment.
        </p>
      </div>

      <Card>
        <CardTitle>Needs chasing</CardTitle>
        <div className="-mx-2 flex flex-col">
          {OVERDUE.map((o) => {
            const c = target(o.id);
            const high = o.severity === "high";
            return (
              <ListRow
                key={o.id}
                leading={
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                      high ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"
                    }`}
                  >
                    <AlertTriangle aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Assigned to ${o.specialist}`}
                badge={
                  <span className="flex items-center gap-2">
                    <Chip
                      size="sm"
                      className={high ? "bg-danger-bg text-danger-text" : "bg-warning-bg text-warning-text"}
                    >
                      {o.days} days waiting
                    </Chip>
                    <Button variant="secondary" size="sm">
                      Chase
                    </Button>
                  </span>
                }
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
          <FolderLock aria-hidden className="size-4 shrink-0" />
          Reassignment needs a case manager or admin — coordinators can request
          it, and the request is logged.
        </div>
      </Card>
    </div>
  );
}
