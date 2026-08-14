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
            <>
              <p>
                Clinical records are kept for the period required by the
                strictest jurisdiction involved in the referral —{" "}
                <strong>20 years</strong> where French health-record law applies,
                and <strong>10 years</strong> for our other corridors — measured
                from the last activity on the case.
              </p>
              <p>
                Once that period expires the record is flagged for review rather
                than deleted automatically, because a case subject to a complaint
                or legal claim must be kept for longer. Audit records are
                retained as required for regulatory accountability.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          heading: "Your rights and DSARs",
          children: (
            <>
              <p>
                Patients and clinicians can request access to, rectification of,
                or erasure of their personal data, and can ask for it in a
                portable form. We respond within{" "}
                <strong>one calendar month</strong> of receiving the request, as
                required by UK GDPR. Requests can be raised through the referring
                clinician or via the contact page; each one is logged with its
                deadline and tracked to completion.
              </p>
              <p>
                Erasure removes your personal data from the referral record and
                deletes the associated documents. The tamper-evident audit trail
                is retained, because it is the evidence that the erasure was
                carried out and it protects every other case on the platform —
                but it no longer identifies you.
              </p>
              <p>
                If you are unhappy with how we have handled your data you can
                complain to the Information Commissioner&rsquo;s Office: Wycliffe
                House, Water Lane, Wilmslow, Cheshire SK9 5AF · 0303 123 1113 ·
                ico.org.uk
              </p>
            </>
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
            <>
              <p>
                The data controller is <strong>Libamed Ltd</strong>, 58 Ael-Y-Bryn,
                Caerdydd (Cardiff) CF23 9LH, Wales, United Kingdom — company
                no. 17272473.
              </p>
              <p>
                We are registered with the Information Commissioner&rsquo;s Office
                under registration reference{" "}
                <strong>ZC220043</strong>, valid to 10 August 2027.
              </p>
              <p>
                A Data Protection Officer appointment is in progress; until then
                the registered office is the contact point for all
                data-protection matters.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
