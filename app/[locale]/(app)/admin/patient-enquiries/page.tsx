import { requireOversight } from "@/lib/auth";
import { HeartHandshake, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import InterestRow from "@/components/admin/InterestRow";
import EnquiryFilters from "@/components/admin/EnquiryFilters";
import {
  getCampaigns,
  getInterestCounts,
  getInterests,
  interestReady,
} from "@/lib/db/patientInterest";
import {
  ENQUIRY_FOR,
  INTEREST_STATUSES,
  STATUS_LABEL,
  type InterestStatus,
} from "@/lib/patientInterest";

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
  searchParams: Promise<{ status?: string; campaign?: string; for?: string }>;
}) {
  const { locale } = await params;
  const { status, campaign, for: forWhom } = await searchParams;
  await requireOversight(locale);
  const ready = await interestReady();

  const active = (INTEREST_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as InterestStatus)
    : "all";

  // Only the two values the question offers are honoured, so ?for=anything
  // cannot quietly filter the list down to nothing and look like no enquiries.
  const activeFor = ENQUIRY_FOR.some((o) => o.value === forWhom) ? forWhom : undefined;

  const [interests, counts, campaigns]: [Awaited<ReturnType<typeof getInterests>>, Record<string, number>, string[]] = ready
    ? await Promise.all([
        getInterests({ status: active, campaign, enquiryFor: activeFor }),
        getInterestCounts(),
        getCampaigns(),
      ])
    : [[], {}, []];

  const total = Object.values(counts).reduce((n, c) => n + c, 0);

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
          <EnquiryFilters
            basePath={`/${locale}/admin/patient-enquiries`}
            status={active}
            enquiryFor={activeFor}
            campaign={campaign}
            campaigns={campaigns}
            counts={counts}
            total={total}
          />

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
                    : `Nothing matched ${[
                        active !== "all" && `status “${STATUS_LABEL[active]}”`,
                        activeFor && `for “${ENQUIRY_FOR.find((o) => o.value === activeFor)?.label}”`,
                        campaign && `campaign “${campaign}”`,
                      ]
                        .filter(Boolean)
                        .join(", ")}. Clear the filters above to see all ${total}.`
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

