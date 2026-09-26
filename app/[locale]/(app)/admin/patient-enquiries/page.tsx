import Link from "next/link";
import { HeartHandshake, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import InterestRow from "@/components/admin/InterestRow";
import {
  getCampaigns,
  getInterestCounts,
  getInterests,
  interestReady,
} from "@/lib/db/patientInterest";
import { INTEREST_STATUSES, STATUS_LABEL, type InterestStatus } from "@/lib/patientInterest";
import { cn } from "@/lib/cn";

export const metadata = { title: "Patient enquiries · LibaMed" };

// Phase 2a · enquiries from the public /for-patients form.
//
// These are NOT cases and this screen is deliberately not a pipeline: there is
// no "convert to referral" here, because a patient cannot originate a clinical
// referral. Triage is manual — someone reads it and decides — and the four
// states say only what a person has done, never what the system will do next.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; campaign?: string }>;
}) {
  const { locale } = await params;
  const { status, campaign } = await searchParams;
  const ready = await interestReady();

  const active = (INTEREST_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as InterestStatus)
    : "all";

  const [interests, counts, campaigns]: [Awaited<ReturnType<typeof getInterests>>, Record<string, number>, string[]] = ready
    ? await Promise.all([
        getInterests({ status: active, campaign }),
        getInterestCounts(),
        getCampaigns(),
      ])
    : [[], {}, []];

  const total = Object.values(counts).reduce((n, c) => n + c, 0);
  const href = (patch: { status?: string; campaign?: string }) => {
    const q = new URLSearchParams();
    const s = patch.status ?? (active === "all" ? "" : active);
    const c = patch.campaign ?? campaign ?? "";
    if (s) q.set("status", s);
    if (c) q.set("campaign", c);
    const qs = q.toString();
    return `/${locale}/admin/patient-enquiries${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Patient enquiries</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          People who asked to be contacted through the public site. An enquiry is
          not a referral and does not become one on its own — a clinician still
          has to raise the case.
        </p>
      </div>

      {!ready && (
        <p className="flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Migration 008 hasn&rsquo;t been applied, so enquiries can&rsquo;t be stored or shown yet.
        </p>
      )}

      {ready && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <FilterLink href={href({ status: "" })} active={active === "all"}>
              All{total > 0 && ` · ${total}`}
            </FilterLink>
            {INTEREST_STATUSES.map((s) => (
              <FilterLink key={s} href={href({ status: s })} active={active === s}>
                {STATUS_LABEL[s]}
                {counts[s] ? ` · ${counts[s]}` : ""}
              </FilterLink>
            ))}
            {campaigns.length > 0 && (
              <span className="ms-auto flex flex-wrap items-center gap-2">
                <span className="text-[13px] text-ink-secondary">Campaign</span>
                <FilterLink href={href({ campaign: "" })} active={!campaign}>
                  Any
                </FilterLink>
                {campaigns.map((c) => (
                  <FilterLink key={c} href={href({ campaign: c })} active={campaign === c}>
                    {c}
                  </FilterLink>
                ))}
              </span>
            )}
          </div>

          <Card>
            <CardTitle>
              {active === "all" ? "All enquiries" : STATUS_LABEL[active]}
              {interests.length > 0 && ` · ${interests.length}`}
            </CardTitle>
            {interests.length === 0 ? (
              <EmptyState
                icon={HeartHandshake}
                title={total === 0 ? "No enquiries yet" : "Nothing matches this filter"}
                description={
                  total === 0
                    ? "Enquiries from the patient page arrive here the moment someone sends one."
                    : "Try a different status or campaign."
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {interests.map((i) => (
                  <InterestRow key={i.id} locale={locale} interest={i} />
                ))}
              </div>
            )}
          </Card>

          <p className="rounded-inner bg-subtle px-4 py-3 text-[13px] text-ink-secondary">
            Enquiries are kept for 24 months from the date they arrive, then deleted —
            they are not medical records and are not retained like one.
          </p>
        </>
      )}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <Chip
        size="sm"
        className={cn(
          "transition-colors",
          active ? "bg-navy text-white" : "bg-subtle text-ink-secondary hover:text-ink",
        )}
      >
        {children}
      </Chip>
    </Link>
  );
}
