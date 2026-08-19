import Link from "next/link";
import { BadgeCheck, CheckCircle2, FileWarning, Globe2, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { getGovernanceSummary } from "@/lib/db/governance";

// Admin/manager · Attention (sidebar aggregation) — everything that needs a
// governance decision, grouped by kind.
//
// Each group is built from records the platform actually holds: accreditation
// dates on the hospital rows, account_status on the profiles, and the corridor
// transfer basis against live case counts. Nothing is listed unless there is a
// row behind it — an admin must be able to trust that an empty page means
// nothing is outstanding.
//
// Dated regulatory to-dos (was the KVKK notice filed, and when) and access-
// expiry tracking are V1.5: there is no column recording either, so this page
// surfaces the cases that require attention rather than inventing a countdown.

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

  const regulatory = summary.corridors
    .filter((c) => c.notificationAuthority && c.cases > 0)
    .map<Item>((c) => ({
      title: `${c.notificationAuthority} notification — ${c.label}`,
      sub: `${c.cases} ${c.cases === 1 ? "case" : "cases"} on this corridor transfer under Standard Contractual Clauses. The regulator must be notified within ${c.notificationDays ?? 5} business days of the first transfer.`,
      severity: "high",
      tag: `${c.cases} ${c.cases === 1 ? "case" : "cases"}`,
      href: `/${locale}/admin/cases`,
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

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const high = groups.reduce((n, g) => n + g.items.filter((i) => i.severity === "high").length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Requires attention</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {total === 0
              ? "Regulatory tasks, verification, and accreditation — checked against live records."
              : `${total} ${total === 1 ? "item" : "items"} across regulatory tasks, verification, and accreditation.`}
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
            description="No accreditation is near expiry, no account is waiting on verification, and no live case sits on a corridor with an outstanding regulator notice."
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
        Dated regulatory to-dos (when each notice was filed) and access-expiry
        tracking are V1.5 — this page flags what the records support today.{" "}
        <Link href={`/${locale}/admin`} className="font-medium text-accent hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
