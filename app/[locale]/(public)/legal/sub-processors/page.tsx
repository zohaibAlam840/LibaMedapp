import LegalLayout from "@/components/legal/LegalLayout";
import ResponsiveTable from "@/components/ui/ResponsiveTable";

// 9A · Data processing / sub-processors. DRAFT — providers are placeholders
// until the hosting topology (C2C spec §2.1) is contracted.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Data processing & sub-processors"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "roles",
          heading: "Our role",
          children: (
            <p>
              For referral data, LibaMed acts as processor to the referring
              clinician&rsquo;s organisation (controller), under a
              data-processing agreement incorporating the corridor&rsquo;s
              transfer mechanism. For clinician account data, LibaMed is the
              controller.
            </p>
          ),
        },
        {
          id: "list",
          heading: "Sub-processors",
          children: (
            <>
              <p>
                Infrastructure providers under evaluation are listed with the
                safeguard each will operate under. This table becomes binding
                when hosting contracts are signed; we give notice before any
                change that touches patient data.
              </p>
              <ResponsiveTable
                columns={[
                  { key: "name", label: "Provider" },
                  { key: "purpose", label: "Purpose" },
                  { key: "location", label: "Location" },
                  { key: "safeguard", label: "Safeguard" },
                ]}
                rows={[
                  { id: "eu-host", cells: { name: "EEA cloud region (TBC)", purpose: "France-corridor data plane", location: "EEA", safeguard: "HDS certification · DPA" } },
                  { id: "uk-host", cells: { name: "UK cloud region (TBC)", purpose: "UK-baseline data plane", location: "United Kingdom", safeguard: "UK GDPR · DPA" } },
                  { id: "email", cells: { name: "Transactional email (TBC)", purpose: "Account + case notifications (no PHI in emails)", location: "EU", safeguard: "DPA · no clinical content" } },
                ]}
              />
            </>
          ),
        },
        {
          id: "commitments",
          heading: "Commitments",
          children: (
            <p>
              Every sub-processor touching patient data is bound to the same
              encryption, residency, and audit obligations we carry. A clean
              export-and-delete of a corridor&rsquo;s data is contractually
              guaranteed from day one (reversibility), so no provider ever
              becomes a lock-in on patient records.
            </p>
          ),
        },
      ]}
    />
  );
}
