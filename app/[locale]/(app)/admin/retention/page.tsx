import { Archive, Clock, Inbox, ShieldCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import LogDataRequestForm from "@/components/admin/LogDataRequestForm";
import DataRequestRow from "@/components/admin/DataRequestRow";
import {
  getDataRequests,
  getRetentionPolicy,
  getRetentionSchedule,
} from "@/lib/db/dsar";

// 9E · Retention & data-subject requests (#58).
// Two legal duties in one place: answer a person's request about their data
// within one calendar month, and destroy records once the corridor's retention
// period expires.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [requests, schedule, policy] = await Promise.all([
    getDataRequests(),
    getRetentionSchedule(),
    getRetentionPolicy(),
  ]);

  const open = requests.filter((r) => r.status === "open" || r.status === "in-progress");
  const closed = requests.filter((r) => r.status === "fulfilled" || r.status === "refused");
  const overdue = open.filter((r) => r.overdue);
  const dueForDeletion = schedule.filter((s) => s.due);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Retention &amp; data requests</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            A person may ask for a copy of their data, or its erasure. You must
            respond within one calendar month.
          </p>
        </div>
        <LogDataRequestForm locale={locale} />
      </div>

      {overdue.length > 0 && (
        <p className="rounded-inner bg-danger-bg px-4 py-3 text-[13px] font-medium text-danger-text">
          {overdue.length} request{overdue.length > 1 ? "s are" : " is"} past the statutory
          deadline. Responding late is itself a reportable breach.
        </p>
      )}

      {/* Open requests */}
      <Card>
        <CardTitle>
          Open requests{open.length > 0 ? ` · ${open.length}` : ""}
        </CardTitle>
        {open.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No open requests"
            description="Log a request as soon as it arrives — that's what starts the one-month clock."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {open.map((r) => (
              <DataRequestRow key={r.id} request={r} locale={locale} />
            ))}
          </ul>
        )}
      </Card>

      {/* Retention schedule. The card lists EVERY case with a deletion date,
          not only the ones that have reached it, so the heading says schedule
          and calls out how many are actually due — titled "Records due for
          deletion" it read as an action list while showing cases with ten
          years left. */}
      <Card>
        <CardTitle>
          Retention schedule
          {dueForDeletion.length > 0
            ? ` · ${dueForDeletion.length} due now`
            : schedule.length > 0
              ? ` · ${schedule.length} scheduled, none due`
              : ""}
        </CardTitle>
        {schedule.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="Nothing scheduled yet"
            description="Each referral gets a deletion date from its corridor's retention period."
          />
        ) : (
          <ResponsiveTable
            columns={[
              { key: "ref", label: "Case" },
              { key: "corridor", label: "Corridor" },
              { key: "until", label: "Keep until" },
              { key: "state", label: "Status" },
            ]}
            rows={schedule.slice(0, 25).map((s) => ({
              id: s.ref,
              cells: {
                ref: <span className="font-medium text-ink">{s.ref}</span>,
                corridor: s.corridorLabel,
                until: s.retentionUntil,
                state: s.redacted ? (
                  <span className="inline-flex items-center gap-1 text-[13px] text-ink-muted">
                    <ShieldCheck aria-hidden className="size-3.5" />
                    Erased
                  </span>
                ) : s.due ? (
                  <span className="rounded-full bg-danger-bg px-2.5 py-0.5 text-[11px] font-semibold text-danger-text">
                    Due for deletion
                  </span>
                ) : (
                  <span className="text-[13px] text-ink-secondary">
                    {s.daysLeft > 365
                      ? `${Math.floor(s.daysLeft / 365)} years left`
                      : `${s.daysLeft} days left`}
                  </span>
                ),
              },
            }))}
          />
        )}
        <p className="mt-3 text-xs text-ink-muted">
          Deletion is not automatic — a person reviews each record, because a case
          under complaint or litigation must be kept beyond its normal period.
        </p>
      </Card>

      {/* Policy */}
      <Card>
        <CardTitle>Retention policy by corridor</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "corridor", label: "Corridor" },
            { key: "years", label: "Records kept for" },
            { key: "basis", label: "Basis" },
          ]}
          rows={policy.map((p) => ({
            id: p.id,
            cells: {
              corridor: <span className="font-medium text-ink">{p.label}</span>,
              years: `${p.years} years`,
              basis:
                p.years >= 20
                  ? `${p.country} health-record law (the stricter of the two countries)`
                  : "UK health-record guidance",
            },
          }))}
        />
      </Card>

      {/* Closed */}
      {closed.length > 0 && (
        <Card>
          <CardTitle>Closed requests</CardTitle>
          <ul className="flex flex-col gap-3">
            {closed.slice(0, 20).map((r) => (
              <DataRequestRow key={r.id} request={r} locale={locale} />
            ))}
          </ul>
        </Card>
      )}

      <p className="flex items-start gap-2.5 rounded-inner bg-subtle p-3.5 text-[13px] text-ink-secondary">
        <Archive aria-hidden className="mt-0.5 size-4 shrink-0" />
        Erasure redacts the personal data but keeps the audit trail, which no
        longer identifies the person. That trail is the evidence the erasure
        happened, and it protects every other case on the platform — so it is
        never deleted.
      </p>
    </div>
  );
}
