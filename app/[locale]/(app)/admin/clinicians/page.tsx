import { Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { DEMO_HOSPITALS } from "@/lib/demo";

// 9E · Named clinician management (#54): every receiving clinician, their
// hospital, verification status. Referrals only ever route to these names.
export default async function Page() {
  const clinicians = DEMO_HOSPITALS.flatMap((h) =>
    h.clinicians.map((c) => ({ ...c, hospital: h.name, languages: h.languages.slice(0, 2).join(", ") })),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Named clinicians</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            The receiving specialists cases can route to — verified once at
            onboarding via their hospital.
          </p>
        </div>
        <Button>
          <Plus aria-hidden className="size-4" /> Add clinician
        </Button>
      </div>

      <Card>
        <CardTitle>All receiving clinicians</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "name", label: "Clinician" },
            { key: "hospital", label: "Hospital" },
            { key: "role", label: "Specialty" },
            { key: "languages", label: "Languages" },
            { key: "verification", label: "Verification" },
            { key: "active", label: "Status" },
          ]}
          rows={clinicians.map((c, i) => ({
            id: `${c.name}-${i}`,
            cells: {
              name: (
                <span className="flex items-center gap-2.5 font-medium">
                  <Avatar name={c.name} size="sm" />
                  {c.name}
                </span>
              ),
              hospital: c.hospital,
              role: c.role,
              languages: c.languages,
              verification: (
                <Chip size="sm" selected>
                  Employment confirmed
                </Chip>
              ),
              active: i === 5 ? <Chip size="sm">Onboarding</Chip> : <Chip size="sm" variant="outline">Active</Chip>,
            },
          }))}
        />
        <p className="mt-3 text-xs text-ink-muted">
          Verification evidence (employment confirmation + licence/specialty) is
          stored on each record and reviewed at hospital audit.
        </p>
      </Card>
    </div>
  );
}
