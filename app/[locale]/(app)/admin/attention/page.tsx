import Link from "next/link";
import { BadgeCheck, CheckCircle2, FileWarning, Globe2, TimerOff, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { getGovernanceSummary } from "@/lib/db/governance";
import { getCorridorDuties } from "@/lib/db/regulatory";
import { getExpiringAccess } from "@/lib/db/access";

// Admin/manager · Attention (sidebar aggregation) — everything that needs a
// governance decision, grouped by kind.
//
// Each group is built from records the platform actually holds: accreditation
// dates on the hospital rows, account_status on the profiles, and the corridor
// transfer basis against live case counts. Nothing is listed unless there is a
// row behind it — an admin must be able to trust that an empty page means
// nothing is outstanding.
//
// Regulatory filings and access windows are now RECORDED (migration 007), so
// this page states whether a task is outstanding rather than restating the duty
// on every load. A filed notice drops off the list; that is the whole point —
// a page that flags the same item for ever teaches an admin to ignore it.

type Severity = "high" | "medium" | "low";

const SEV_STYLE: Record<Severity, string> = {
  high: "bg-danger-bg text-danger-text",
  medium: "bg-warning-bg text-warning-text",
  low: "bg-subtle text-ink-secondary",
};

interface Item {
  title: string;
  sub: string;
  severity: Severity;
  tag: string;
  href: string;
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  const summary = await getGovernanceSummary(user);

  const groups: { title: string; icon: LucideIcon; items: Item[] }[] = [];

  // Only corridors whose notice is actually outstanding or stale. A satisfied
  // duty is not an attention item.
  const counts = new Map<string, number>();
  for (const c of summary.corridors) counts.set(c.id, c.cases);
  const duties = await getCorridorDuties(counts);
  const regulatory = duties
    .filter((d) => d.state === "outstanding" || d.state === "due-for-review")
    .map<Item>((d) => ({
      title: `${d.authority} notification — ${d.label}`,
      sub:
        d.state === "due-for-review"
          ? `Filed ${d.latest?.filedAt}, but the review date has passed. Confirm the notification is still current or file again.`
          : `${d.cases} ${d.cases === 1 ? "case" : "cases"} on this corridor transfer under Standard Contractual Clauses. The regulator must be notified within ${d.withinBusinessDays} business days of the first transfer, and no filing is recorded.`,
      severity: d.state === "outstanding" ? "high" : "medium",
      tag: d.state === "outstanding" ? "Not filed" : "Due for review",
      href: `/${locale}/admin/regulatory`,
    }));
  if (regulatory.length > 0) groups.push({ title: "Regulatory tasks", icon: Globe2, items: regulatory });

  if (summary.pendingVerifications > 0) {
    groups.push({
      title: "Verification",
      icon: UserRoundCheck,
      items: [
        {
          title: `${summary.pendingVerifications} ${summary.pendingVerifications === 1 ? "account" : "accounts"} awaiting verification`,
          sub: "Registrations cannot reach a case until their registration number and employment are confirmed.",
          severity: "medium",
          tag: "Pending",
          href: `/${locale}/admin/verification`,
        },
      ],
    });
  }

  const accreditation = summary.accreditationExpiring.map<Item>((a) => ({
    title: `${a.name} expiring — ${a.hospital}`,
    sub:
      a.monthsLeft < 0
        ? "Lapsed. Renewal evidence is required before this partner can take referrals."
        : "Renewal evidence is due before it lapses, or routing to this partner should be paused.",
    severity: a.monthsLeft <= 0 ? "high" : a.monthsLeft <= 3 ? "medium" : "low",
    tag: a.monthsLeft < 0 ? `Lapsed ${a.expires}` : `Expires ${a.expires}`,
    href: `/${locale}/admin/hospitals/${a.hospitalId}/edit`,
  }));
  if (accreditation.length > 0) {
    groups.push({ title: "Accreditation", icon: BadgeCheck, items: accreditation });
  }

  const access = (await getExpiringAccess(user)).map<Item>((w) => ({
    title: w.expired
      ? `${w.ref} — receiving access has lapsed`
      : `${w.ref} — receiving access closes ${w.expiresAt}`,
    sub: w.expired
      ? `${w.hospital || "The receiving hospital"} can still read this case but can no longer change it. Extend the window if the episode is genuinely still open.`
      : `${w.hospital || "The receiving hospital"} has ${w.daysLeft} ${w.daysLeft === 1 ? "day" : "days"} left to work on this case.`,
    severity: w.expired ? "high" : "medium",
    tag: w.expired ? `Lapsed ${w.expiresAt}` : `${w.daysLeft}d left`,
    href: `/${locale}/admin/cases/${w.ref}`,
  }));
  if (access.length > 0) {
    groups.push({ title: "Access windows", icon: TimerOff, items: access });
  }

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const high = groups.reduce((n, g) => n + g.items.filter((i) => i.severity === "high").length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Requires attention</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {total === 0
              ? "Regulatory tasks, verification, accreditation, and access windows — checked against live records."
              : `${total} ${total === 1 ? "item" : "items"} across regulatory tasks, verification, accreditation, and access windows.`}
          </p>
        </div>
        {high > 0 && (
          <Chip className="bg-danger-bg text-danger-text">
            <FileWarning aria-hidden className="size-3.5" /> {high} high priority
          </Chip>
        )}
      </div>

      {total === 0 ? (
        <Card>
          <EmptyState
            icon={CheckCircle2}
            title="Nothing needs attention"
            description="No accreditation is near expiry, no account is waiting on verification, every corridor's regulator notice is on file, and no receiving access window is closing."
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <Card key={group.title}>
              <CardTitle>
                <span className="flex items-center gap-2">
                  <group.icon aria-hidden className="size-4.5 text-ink-secondary" />
                  {group.title}
                </span>
              </CardTitle>
              <div className="-mx-2 flex flex-col">
                {group.items.map((item) => (
                  <ListRow
                    key={item.title}
                    leading={
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${SEV_STYLE[item.severity]}`}>
                        <FileWarning aria-hidden className="size-4.5" />
                      </span>
                    }
                    title={item.title}
                    subtitle={item.sub}
                    badge={
                      <span className="flex items-center gap-2">
                        <Chip size="sm" className={SEV_STYLE[item.severity]}>
                          {item.tag}
                        </Chip>
                        <Button variant="secondary" size="sm" href={item.href}>
                          Review
                        </Button>
                      </span>
                    }
                  />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-ink-muted">
        Every item here has a record behind it. Filings are recorded under{" "}
        <Link
          href={`/${locale}/admin/regulatory`}
          className="font-medium text-accent hover:underline"
        >
          Regulatory filings
        </Link>
        ; access windows start when a hospital accepts a case.{" "}
        <Link href={`/${locale}/admin`} className="font-medium text-accent hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
