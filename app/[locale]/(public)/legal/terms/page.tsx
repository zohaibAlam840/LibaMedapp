import LegalLayout from "@/components/legal/LegalLayout";

// 9A · Terms of service. DRAFT copy — pending legal review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Terms of service"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "service",
          heading: "The service",
          children: (
            <p>
              LibaMed provides a secure platform for clinician-to-clinician
              international medical referrals. LibaMed is not a healthcare
              provider, does not give medical advice, and is not a party to any
              treatment contract between a patient and a receiving hospital.
            </p>
          ),
        },
        {
          id: "eligibility",
          heading: "Who may use it",
          children: (
            <p>
              Referring access is limited to clinicians whose professional
              registration we have verified. Receiving access is limited to
              named specialists and coordinators at contracted partner
              hospitals. Accounts are personal and must not be shared; patients
              may not hold accounts.
            </p>
          ),
        },
        {
          id: "responsibilities",
          heading: "Clinician responsibilities",
          children: (
            <p>
              The referring clinician remains responsible for their clinical
              judgement, for obtaining and accurately recording patient
              consent, and for the accuracy of the records they attach. The
              receiving clinician is responsible for the plans and summaries
              they return. Nothing on the platform modifies either party&rsquo;s
              professional obligations.
            </p>
          ),
        },
        {
          id: "fees",
          heading: "Fees and cost transparency",
          children: (
            <p>
              Treatment costs are set by the receiving hospital and presented as
              an itemised estimate before treatment. LibaMed adds no hidden
              platform fee to the clinical estimate.
            </p>
          ),
        },
        {
          id: "liability",
          heading: "Liability",
          children: (
            <p>
              To the extent permitted by law, LibaMed&rsquo;s liability is
              limited to the operation of the platform itself. LibaMed is not
              liable for clinical outcomes, hospital performance, or travel
              arrangements. Nothing in these terms limits liability that cannot
              lawfully be limited.
            </p>
          ),
        },
        {
          id: "termination",
          heading: "Suspension and closure",
          children: (
            <p>
              We may suspend accounts that breach these terms or the acceptable
              use policy. On closure of a corridor or of the service, case data
              is exported and deleted per the documented reversibility
              commitment in our data-processing terms.
            </p>
          ),
        },
        {
          id: "law",
          heading: "Governing law",
          children: (
            <p>
              These terms are governed by the law of England and Wales, and the
              courts of England and Wales have exclusive jurisdiction, without
              affecting mandatory protections in a user&rsquo;s own
              jurisdiction.
            </p>
          ),
        },
      ]}
    />
  );
}
