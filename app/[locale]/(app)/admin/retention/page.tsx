import { Archive, Trash2 } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import SegmentedControl from "@/components/ui/SegmentedControl";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

// 9E · Retention / erasure / DSAR (#59). Three areas; the segmented control
// stands in for tabs (design-only — no client tab state yet).
const RETENTION = [
  { cat: "Referral records", corridor: "France", schedule: "20 years", review: "12 Mar 2044", due: "0" },
  { cat: "Referral records", corridor: "Israel", schedule: "10 years", review: "08 Jan 2036", due: "0" },
  { cat: "Imaging (DICOM)", corridor: "All", schedule: "8 years", review: "01 Sep 2034", due: "2" },
  { cat: "Audit events", corridor: "All", schedule: "As required", review: "—", due: "0" },
];

const DSARS = [
  { id: "DSAR-0021", type: "Access", received: "16 Jul 2026", deadline: "13 Aug 2026", days: 26, assignee: "Sam Okafor", status: "In progress" },
  { id: "DSAR-0019", type: "Erasure", received: "02 Jul 2026", deadline: "30 Jul 2026", days: 12, assignee: "Sam Okafor", status: "Awaiting corridor confirm" },
  { id: "DSAR-0016", type: "Rectification", received: "20 Jun 2026", deadline: "18 Jul 2026", days: 0, assignee: "Jordan Ellis", status: "Due today" },
];

export default async function Page() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Retention &amp; DSAR</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Retention schedules, scheduled erasure, and data-subject requests —
            each action logged.
          </p>
        </div>
        <SegmentedControl
          name="retention-tab"
          defaultValue="retention"
          options={[
            { value: "retention", label: "Retention" },
            { value: "erasure", label: "Erasure" },
            { value: "dsar", label: "DSAR" },
          ]}
        />
      </div>

      <Card>
        <CardTitle>Retention schedule</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "cat", label: "Data category" },
            { key: "corridor", label: "Corridor" },
            { key: "schedule", label: "Schedule" },
            { key: "review", label: "Next review" },
            { key: "due", label: "Items due", align: "end" },
          ]}
          rows={RETENTION.map((r, i) => ({
            id: `${r.cat}-${i}`,
            cells: {
              cat: <span className="font-medium">{r.cat}</span>,
              corridor: r.corridor,
              schedule: r.schedule,
              review: r.review,
              due:
                r.due === "0" ? (
                  <span className="text-ink-muted">0</span>
                ) : (
                  <Chip size="sm" className="bg-warning-bg text-warning-text">{r.due} due</Chip>
                ),
            },
          }))}
        />
      </Card>

      <Card>
        <CardTitle
          action={
            <Button variant="secondary" size="sm">
              <Trash2 aria-hidden className="size-4" /> Review erasure queue
            </Button>
          }
        >
          <span className="flex items-center gap-2">
            <Archive aria-hidden className="size-4.5 text-ink-secondary" /> Erasure queue
          </span>
        </CardTitle>
        <p className="text-sm text-ink-secondary">
          2 imaging items are past their retention window and flagged for
          anonymisation review. Deletion requires confirm-and-log and cannot be
          undone.
        </p>
      </Card>

      <Card>
        <CardTitle
          action={
            <Button size="sm">New request</Button>
          }
        >
          Data-subject requests
        </CardTitle>
        <ResponsiveTable
          columns={[
            { key: "id", label: "Request" },
            { key: "type", label: "Type" },
            { key: "received", label: "Received" },
            { key: "deadline", label: "Deadline" },
            { key: "assignee", label: "Assignee" },
            { key: "status", label: "Status" },
          ]}
          rows={DSARS.map((d) => ({
            id: d.id,
            cells: {
              id: <span className="font-medium">{d.id}</span>,
              type: d.type,
              received: d.received,
              deadline: (
                <span className="flex flex-col">
                  {d.deadline}
                  <span
                    className={
                      d.days === 0
                        ? "text-xs text-danger-text"
                        : d.days <= 12
                          ? "text-xs text-warning-text"
                          : "text-xs text-ink-muted"
                    }
                  >
                    {d.days === 0 ? "due today" : `${d.days} days left`}
                  </span>
                </span>
              ),
              assignee: d.assignee,
              status: <Chip size="sm">{d.status}</Chip>,
            },
          }))}
        />
      </Card>
    </div>
  );
}
