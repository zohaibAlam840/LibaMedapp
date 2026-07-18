import LegalLayout from "@/components/legal/LegalLayout";
import { FactPill } from "@/components/ui/Badges";

// 9A · Security / trust page. DRAFT copy — pending review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Security overview"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "encryption",
          heading: "Encryption",
          children: (
            <>
              <p>
                All data is encrypted with <strong>AES-256 at rest</strong> and{" "}
                <strong>TLS 1.3 in transit</strong> — no exceptions, including
                internal service-to-service traffic. Documents are stored as
                PDF/A where applicable; imaging transfers are chunked and
                resumable so nothing travels unencrypted or incomplete.
              </p>
              <div className="flex flex-wrap gap-2">
                <FactPill>AES-256 at rest</FactPill>
                <FactPill>TLS 1.3 in transit</FactPill>
                <FactPill>HDS-certified EEA hosting for France</FactPill>
              </div>
            </>
          ),
        },
        {
          id: "hosting",
          heading: "Hosting and residency",
          children: (
            <p>
              Case data is pinned to the region its corridor requires, set
              automatically at intake. French health data is hosted on{" "}
              <strong>HDS-certified infrastructure in the EEA</strong>; other
              corridors use UK or EEA regions. The residency region is shown on
              every case and confirmed on the governance dashboard.
            </p>
          ),
        },
        {
          id: "access-control",
          heading: "Access control",
          children: (
            <p>
              Five roles on a least-privilege basis, mandatory multi-factor
              authentication, session timeout on inactivity, user-visible
              session and device revocation, and time-limited receiving access
              that expires after 90 days of case inactivity. Referrals route to
              a named specialist — never a shared inbox.
            </p>
          ),
        },
        {
          id: "audit",
          heading: "Audit",
          children: (
            <p>
              Every view, download, export, consent event, and status change is
              written to an <strong>append-only, tamper-evident audit log</strong>.
              A regulator can reconstruct any case from the audit trail alone —
              that is a design requirement, not an aspiration.
            </p>
          ),
        },
        {
          id: "disclosure",
          heading: "Responsible disclosure",
          children: (
            <p>
              Found a vulnerability? Report it via the contact page marked
              &ldquo;security&rdquo;. We acknowledge within two working days,
              won&rsquo;t pursue good-faith research conducted without
              accessing real patient data, and credit fixes where wanted.
              Formal certifications (Cyber Essentials Plus, ISO 27001) are on
              the published roadmap.
            </p>
          ),
        },
      ]}
    />
  );
}
