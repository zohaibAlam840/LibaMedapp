import Link from "next/link";
import { Building2, Plus } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import HospitalPublishToggle from "@/components/admin/HospitalPublishToggle";
import { AccreditationBadge } from "@/components/ui/Badges";
import { getHospitals } from "@/lib/db/hospitals";
import { accreditationState, getAccreditationExpiries } from "@/lib/db/governance";

// 9E · Partner hospital list (#52) — admin-editable without a developer (§8.3).
//
// The publish switch writes straight through to the row and revalidates the
// public directory, so "live" here means live there. Accreditation state is
// computed from the stored expiry date rather than the row's position in the
// table, which is how it used to be decided.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const hospitals = await getHospitals();
  const live = hospitals.filter((h) => h.published).length;

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
        <Button href={`/${locale}/admin/hospitals/new`}>
          <Plus aria-hidden className="size-4" /> Add hospital
        </Button>
      </div>

      <Card>
        <CardTitle>
          All partners
          {hospitals.length > 0 && ` · ${hospitals.length} (${live} live)`}
        </CardTitle>
        {hospitals.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No partner hospitals yet"
            description="Add a partner to make it available to the intake wizard and, once published, the public directory."
          >
            <Button href={`/${locale}/admin/hospitals/new`}>
              <Plus aria-hidden className="size-4" /> Add hospital
            </Button>
          </EmptyState>
        ) : (
          <ResponsiveTable
            columns={[
              { key: "name", label: "Hospital" },
              { key: "corridor", label: "Corridor" },
              { key: "accreditation", label: "Accreditation" },
              { key: "specialties", label: "Specialties", align: "end" },
              { key: "clinicians", label: "Named clinicians", align: "end" },
              { key: "published", label: "Public site" },
              { key: "actions", label: "" },
            ]}
            rows={hospitals.map((h) => {
              const first = h.accreditation[0];
              return {
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
                  corridor: h.corridorLabel || "—",
                  accreditation: first ? (
                    <AccreditationBadge
                      body={first.name}
                      expires={first.expires}
                      state={accreditationState(first.expires)}
                    />
                  ) : (
                    <span className="text-ink-muted">None recorded</span>
                  ),
                  specialties: h.specialties.length,
                  clinicians: h.clinicians.length,
                  published: (
                    <HospitalPublishToggle
                      hospitalId={h.id}
                      name={h.name}
                      locale={locale}
                      published={h.published}
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
              };
            })}
          />
        )}
      </Card>

      {/* Accreditation watch. Previously a fixed sentence about Anadolu next to
          an "auto-pause routing on expiry" switch that controlled nothing. The
          list is now computed from the stored expiry dates; the switch is gone
          until routing actually pauses. */}
      <AccreditationWatch locale={locale} />
    </div>
  );
}

async function AccreditationWatch({ locale }: { locale: string }) {
  const expiring = await getAccreditationExpiries();
  if (expiring.length === 0) return null;

  return (
    <Card>
      <CardTitle className="mb-1">Accreditation watch</CardTitle>
      <p className="mb-3 text-sm text-ink-secondary">
        Renewal evidence is due before these lapse, or routing to the partner
        should be paused by hand.
      </p>
      <ul className="flex flex-col gap-2">
        {expiring.map((a) => (
          <li
            key={`${a.hospitalId}-${a.name}`}
            className="flex flex-wrap items-center justify-between gap-2 rounded-inner border border-line px-3.5 py-2.5 text-[15px]"
          >
            <span className="font-medium text-ink">
              {a.hospital}
              <span className="ms-2 font-normal text-ink-secondary">{a.name}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="text-[13px] text-ink-secondary">
                {a.monthsLeft < 0 ? `lapsed ${a.expires}` : `expires ${a.expires}`}
              </span>
              <Link
                href={`/${locale}/admin/hospitals/${a.hospitalId}/edit`}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Edit
              </Link>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
