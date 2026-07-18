import LegalLayout from "@/components/legal/LegalLayout";

// 9A · Acceptable use policy. DRAFT copy — pending legal review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Acceptable use policy"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "purpose-limits",
          heading: "Use the platform for referrals only",
          children: (
            <p>
              Accounts exist to create, receive, and manage patient referrals.
              Using the platform for marketing, recruitment, data harvesting, or
              any purpose unrelated to a real referral is prohibited.
            </p>
          ),
        },
        {
          id: "minimum-necessary",
          heading: "Share the minimum necessary",
          children: (
            <p>
              Attach only the records relevant to the referral. Do not upload
              records of patients who are not the subject of the case, and do
              not paste patient-identifying information into fields not designed
              for it (for example, message subjects or support forms).
            </p>
          ),
        },
        {
          id: "account-integrity",
          heading: "Keep your account yours",
          children: (
            <p>
              Credentials must not be shared, and multi-factor authentication
              must not be circumvented. Access on behalf of a colleague —
              including cover arrangements — requires that colleague&rsquo;s own
              account and role.
            </p>
          ),
        },
        {
          id: "no-circumvention",
          heading: "No off-platform workarounds",
          children: (
            <p>
              The platform exists so referrals never travel by email. Exporting
              case data to personal storage, emailing records to receiving
              teams, or otherwise routing around the platform&rsquo;s controls
              breaches this policy and may breach data-protection law.
            </p>
          ),
        },
        {
          id: "security-testing",
          heading: "Security testing",
          children: (
            <p>
              Do not probe, scan, or test the platform&rsquo;s security without
              written authorisation. Good-faith vulnerability reports are
              welcome via the responsible-disclosure route on the security page.
            </p>
          ),
        },
        {
          id: "enforcement",
          heading: "Enforcement",
          children: (
            <p>
              Breaches may lead to suspension or closure of the account,
              notification of the clinician&rsquo;s employing or registering
              body where professional obligations are engaged, and — where the
              law requires — notification of regulators. All enforcement
              actions are logged.
            </p>
          ),
        },
      ]}
    />
  );
}
