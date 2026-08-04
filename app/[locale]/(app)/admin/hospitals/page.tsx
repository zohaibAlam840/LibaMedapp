import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import Toggle from "@/components/ui/Toggle";
import { AccreditationBadge } from "@/components/ui/Badges";
import { getHospitals } from "@/lib/db/hospitals";

// 9E · Partner hospital list (#52) — admin-editable without a developer (§8.3).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const hospitals = await getHospitals();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Partner hospitals</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Accreditation, specialties, and named clinicians — editable here,
            no developer needed. Toggle a partner <b className="font-medium text-ink">live</b>{" "}
            to show it on the public site.
          </p>
        </div>
        <Button>
          <Plus aria-hidden className="size-4" /> Add hospital
        </Button>
      </div>

      <Card>
        <CardTitle>All partners</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "name", label: "Hospital" },
            { key: "corridor", label: "Corridor" },
            { key: "accreditation", label: "Accreditation" },
            { key: "specialties", label: "Specialties", align: "end" },
            { key: "clinicians", label: "Named clinicians", align: "end" },
            { key: "contract", label: "Contract" },
            { key: "published", label: "Public site" },
            { key: "actions", label: "" },
          ]}
          rows={hospitals.map((h, i) => ({
            id: h.id,
            cells: {
              name: (
                <span className="font-medium">
                  {h.name}
                  <span className="block text-xs font-normal text-ink-muted">
                    {h.city}, {h.country}
                  </span>
                </span>
              ),
              corridor: h.corridorLabel,
              accreditation: (
                <AccreditationBadge
                  body={h.accreditation[0].name}
                  expires={h.accreditation[0].expires}
                  state={i === 2 ? "expiring" : "valid"}
                />
              ),
              specialties: h.specialties.length,
              clinicians: h.clinicians.length,
              contract: i === 3 ? "LOI — in discussion" : "Contracted",
              published: (
                <Toggle
                  label={<span className="sr-only">Show {h.name} on the public site</span>}
                  defaultChecked={h.published}
                />
              ),
              actions: (
                <Link
                  href={`/${locale}/admin/hospitals/${h.id}/edit`}
                  className="text-[13px] font-medium text-accent hover:underline"
                >
                  Edit
                </Link>
              ),
            },
          }))}
        />
      </Card>

      <Card className="flex items-center justify-between gap-4">
        <div>
          <CardTitle className="mb-1">Accreditation watch</CardTitle>
          <p className="text-sm text-ink-secondary">
            Anadolu&rsquo;s JCI certification expires Sep 2026 — renewal
            evidence is due before referrals can continue routing.
          </p>
        </div>
        <Toggle label="Auto-pause routing on expiry" defaultChecked />
      </Card>
    </div>
  );
}
