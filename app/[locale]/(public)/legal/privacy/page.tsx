import LegalLayout from "@/components/legal/LegalLayout";

// 9A · Privacy policy (spec V2 pages 10–16). DRAFT copy — pending legal review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Privacy policy"
      updated="18 Jul 2026"
      version="0.3 (draft)"
      sections={[
        {
          id: "what-we-process",
          heading: "What we process",
          children: (
            <>
              <p>
                <strong>Clinician account data:</strong> name, professional email,
                GMC (or equivalent) registration details, role, and organisation.
              </p>
              <p>
                <strong>Patient referral data:</strong> the minimum clinical
                information a referring clinician includes in a case — identity
                details, clinical summaries, and medical records including
                imaging. Patients are never platform users; their data enters
                only through their clinician, with their consent.
              </p>
              <p>
                <strong>Operational data:</strong> audit events (who accessed
                what, when, from where), security logs, and support
                correspondence.
              </p>
            </>
          ),
        },
        {
          id: "lawful-basis",
          heading: "Lawful basis",
          children: (
            <p>
              We process referral data on the basis of the patient&rsquo;s
              explicit consent, captured item by item at referral creation and
              versioned with the exact wording shown. Clinician account data is
              processed for the performance of our contract with the clinician
              and our legitimate interest in verifying professional identity.
              UK GDPR and the Data Protection Act 2018 apply as the baseline to
              every case.
            </p>
          ),
        },
        {
          id: "transfers",
          heading: "Corridors and international transfers",
          children: (
            <>
              <p>
                Each referral travels along a defined corridor with its own
                lawful transfer mechanism: Israel (UK adequacy), France (EU —
                direct transfer), Switzerland (adequacy), and Turkey
                (KVKK-approved standard contractual clauses, notified to the
                Turkish authority within 5 business days of signature).
              </p>
              <p>
                For every transfer we apply the <strong>stricter of both
                countries&rsquo; rules</strong> on residency, retention, breach
                notification, and data-subject rights.
              </p>
            </>
          ),
        },
        {
          id: "residency",
          heading: "Data residency",
          children: (
            <p>
              A case&rsquo;s storage region is set automatically from its
              corridor at intake. Cases involving France are stored on
              <strong> HDS-certified infrastructure physically located in the
              EEA</strong>; other corridors use UK or EEA regions. The residency
              region is visible on every case.
            </p>
          ),
        },
        {
          id: "retention",
          heading: "Retention",
          children: (
            <p>
              Clinical records are retained per the schedule of the strictest
              involved jurisdiction, then flagged for deletion or anonymisation
              review. Audit records are retained longer, as required for
              regulatory accountability. The full schedule per data category and
              corridor is available on request.
            </p>
          ),
        },
        {
          id: "your-rights",
          heading: "Your rights and DSARs",
          children: (
            <p>
              Patients and clinicians can request access, rectification, or
              erasure of their personal data. We respond within the shortest
              statutory window across the corridors involved in the request.
              Requests can be raised through the referring clinician or directly
              via the contact page; each request is logged and tracked to
              completion.
            </p>
          ),
        },
        {
          id: "security",
          heading: "Security measures",
          children: (
            <p>
              AES-256 encryption at rest, TLS 1.3 in transit, role-based access
              on a least-privilege basis, mandatory multi-factor authentication,
              time-limited access for receiving clinicians, and an append-only
              tamper-evident audit log of every view, download, and export. See
              the security overview for detail.
            </p>
          ),
        },
        {
          id: "sub-processors",
          heading: "Sub-processors",
          children: (
            <p>
              We use a small number of infrastructure sub-processors, each
              bound by data-processing agreements and listed — with purpose,
              location, and safeguard — on the sub-processors page. We will
              give notice before adding or changing sub-processors that touch
              patient data.
            </p>
          ),
        },
        {
          id: "contact",
          heading: "Contact and DPO",
          children: (
            <p>
              Data-protection enquiries: LibaMed Ltd, Cardiff, Wales, United
              Kingdom (company no. 17272473). A Data Protection Officer
              appointment is in progress; until then the registered office is
              the contact point for all data-protection matters.
            </p>
          ),
        },
      ]}
    />
  );
}
