import Link from "next/link";
import { ArrowRight, FolderLock, Globe2, ScrollText, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import EmptyState from "@/components/ui/EmptyState";
import ListRow from "@/components/ui/ListRow";
import StatCard from "@/components/ui/StatCard";
import StatusChip from "@/components/ui/StatusChip";
import { getSessionUser } from "@/lib/auth";
import { getCases } from "@/lib/db/referrals";
import { getGovernanceSummary } from "@/lib/db/governance";

// 9E · Admin dashboard (#50) — case flow across corridors, consent + residency
// confirmation per case (C2C spec §8.3). Rich analytics deferred to V1.5.
//
// Every figure is counted from live rows. Corridor cards come from the corridor
// directory, so a corridor an admin creates appears here without a code change,
// and one with no cases reads 0 rather than a plausible-looking number.

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  const [cases, summary] = await Promise.all([getCases(user), getGovernanceSummary(user)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Governance dashboard</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Case flow, consent, and data-residency confirmation across all
          corridors.
        </p>
      </div>

      {/* Corridor stat cards */}
      {summary.corridors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summary.corridors.map((c) => (
            <StatCard
              key={c.id}
              label={c.label}
              value={c.cases}
              description={`Residency: ${c.residency || "—"}`}
              delta={
                c.notificationAuthority && c.cases > 0
                  ? { tone: "negative", text: `${c.notificationAuthority} notice required` }
                  : undefined
              }
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Live case flow */}
        <Card>
          <CardTitle
            action={
              <Link
                href={`/${locale}/admin/audit`}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Audit log
              </Link>
            }
          >
            Live case flow
          </CardTitle>
          {cases.length === 0 ? (
            <EmptyState
              icon={FolderLock}
              title="No cases yet"
              description="Referrals appear here the moment a referring clinician submits one. Nothing is shown until then."
            />
          ) : (
            <div className="-mx-2 flex flex-col">
              {cases.map((c) => (
                <ListRow
                  key={c.id}
                  href={`/${locale}/admin/cases/${c.id}`}
                  leading={
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
                      <FolderLock aria-hidden className="size-4.5" />
                    </span>
                  }
                  title={`${c.ref} · ${c.corridorLabel}`}
                  subtitle={`${c.specialty} · ${c.hospital} · residency: ${c.residency}`}
                  meta={c.updated}
                  badge={<StatusChip status={c.status} />}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Compliance side panel. Each row states a counted fact; where the
            platform does not yet track completion (whether a regulator notice
            was filed) it says how many cases require one, not how many are
            overdue. */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">Compliance checks</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow
                icon={ScrollText}
                label="Consent records"
                value={
                  summary.totalCases === 0
                    ? "No cases yet"
                    : `${summary.consentCaptured} of ${summary.totalCases} cases with consent captured` +
                      (summary.consentWithdrawn > 0 ? ` · ${summary.consentWithdrawn} withdrawn` : "")
                }
              />
              <DetailPanelRow
                icon={ShieldCheck}
                label="Data residency"
                value={
                  summary.corridors.length === 0
                    ? "No corridors configured"
                    : `${summary.corridors.length} corridors configured, each pinned to a declared region`
                }
              />
              <DetailPanelRow
                icon={Globe2}
                label="Regulator notification"
                value={
                  summary.casesNeedingNotification === 0
                    ? "No cases in corridors that require one"
                    : `${summary.casesNeedingNotification} ${summary.casesNeedingNotification === 1 ? "case" : "cases"} require ${summary.notificationAuthorities.join(", ")} notice`
                }
              />
              <DetailPanelRow
                icon={UserRoundCheck}
                label="Verification queue"
                value={
                  summary.pendingVerifications === 0
                    ? "No accounts awaiting review"
                    : `${summary.pendingVerifications} awaiting review`
                }
              />
            </div>
          </Card>

          <Card className="p-2">
            {[
              { href: `/${locale}/admin/corridors`, label: "Corridor configuration" },
              { href: `/${locale}/admin/hospitals`, label: "Partner hospitals" },
              { href: `/${locale}/admin/users`, label: "Users & roles" },
              { href: `/${locale}/admin/retention`, label: "Retention & DSAR" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 rounded-inner px-3 py-3 transition-colors hover:bg-subtle"
              >
                <span className="flex-1 text-[15px] font-medium text-ink">{label}</span>
                <ArrowRight aria-hidden className="size-4 text-ink-muted rtl:-scale-x-100" />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
