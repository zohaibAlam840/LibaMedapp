import Link from "next/link";
import { BadgeCheck, Clock, FileWarning, Globe2, ScrollText, Timer, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ListRow from "@/components/ui/ListRow";
import Chip from "@/components/ui/Chip";

// Admin/manager · Attention (sidebar aggregation) — everything that needs a
// governance decision, grouped by kind. Surfaces the Turkish 5-business-day SCC
// flag even though the full tracker is V1.5 (Vol III Part 5 / C2C §8.3).
type Severity = "high" | "medium" | "low";

const SEV_STYLE: Record<Severity, string> = {
  high: "bg-danger-bg text-danger-text",
  medium: "bg-warning-bg text-warning-text",
  low: "bg-subtle text-ink-secondary",
};

const GROUPS: {
  title: string;
  icon: LucideIcon;
  items: { title: string; sub: string; severity: Severity; tag: string }[];
}[] = [
  {
    title: "Regulatory tasks",
    icon: Globe2,
    items: [
      { title: "Turkey SCC notification — case LM-2026-0133", sub: "KVKK must be notified within 5 business days of signature", severity: "high", tag: "Due in 3 days" },
    ],
  },
  {
    title: "Consent",
    icon: ScrollText,
    items: [
      { title: "Consent nearing expiry — case LM-2026-0139", sub: "Renew with the referring clinician before it lapses", severity: "medium", tag: "9 days" },
    ],
  },
  {
    title: "Access",
    icon: Timer,
    items: [
      { title: "Receiving access nearing expiry — case LM-2026-0127", sub: "90-day inactivity window closing for Dr. Lukas Baumann", severity: "medium", tag: "12 days" },
    ],
  },
  {
    title: "Verification",
    icon: UserRoundCheck,
    items: [
      { title: "Clinician onboarding pending — Dr. Selin Aydın", sub: "Employment confirmation awaiting hospital sign-off", severity: "low", tag: "Onboarding" },
    ],
  },
  {
    title: "Accreditation",
    icon: BadgeCheck,
    items: [
      { title: "JCI expiring — Anadolu Medical Center", sub: "Renewal evidence due before Sep 2026 or routing auto-pauses", severity: "medium", tag: "Expires Sep 2026" },
    ],
  },
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const total = GROUPS.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Requires attention</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {total} items across regulatory tasks, consent, access, and
            accreditation.
          </p>
        </div>
        <Chip className="bg-danger-bg text-danger-text">
          <Clock aria-hidden className="size-3.5" /> 1 due this week
        </Chip>
      </div>

      <div className="flex flex-col gap-4">
        {GROUPS.map((group) => (
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
                      <Button variant="secondary" size="sm" href={`/${locale}/admin/cases`}>
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

      <p className="text-xs text-ink-muted">
        The full regulatory-task tracker (dated Turkish SCC to-dos, incident log)
        is V1.5 — this surfaces the flags now.{" "}
        <Link href={`/${locale}/admin`} className="font-medium text-accent hover:underline">
          Back to dashboard
        </Link>
      </p>
    </div>
  );
}
