import { Star, Stethoscope } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import EmptyState from "@/components/ui/EmptyState";
import AddDoctorForm from "@/components/admin/AddDoctorForm";
import DoctorRowActions from "@/components/admin/DoctorRowActions";
import { getAllDoctors } from "@/lib/db/doctors";
import { getHospitals } from "@/lib/db/hospitals";

// 9E · Named clinician management (#54): every receiving clinician, their
// hospital, and their public state. Referrals only ever route to APPROVED
// names; FEATURED ones also appear on the public home page.
const STATUS_TONE: Record<string, string> = {
  approved: "bg-success-bg text-success-text",
  pending: "bg-warning-bg text-warning-text",
  rejected: "bg-danger-bg text-danger-text",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [doctors, hospitals] = await Promise.all([getAllDoctors(), getHospitals()]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Named clinicians</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            The receiving specialists cases can route to. Approve a clinician to
            publish them on their hospital page; feature them to show on the home page.
          </p>
        </div>
        <AddDoctorForm
          locale={locale}
          hospitals={hospitals.map((h) => ({ id: h.id, name: h.name }))}
          canChooseHospital
        />
      </div>

      <Card>
        <CardTitle>
          All clinicians · {doctors.length}
          {doctors.some((d) => d.featured) && (
            <span className="ms-2 text-[13px] font-normal text-ink-secondary">
              {doctors.filter((d) => d.featured).length} featured
            </span>
          )}
        </CardTitle>
        {doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No clinicians yet"
            description="Add your first named receiving clinician above. (If you've just set up the database, apply migration 002 first.)"
          />
        ) : (
          <ResponsiveTable
            columns={[
              { key: "name", label: "Clinician" },
              { key: "hospital", label: "Hospital" },
              { key: "role", label: "Specialty" },
              { key: "status", label: "Status" },
              { key: "actions", label: "" },
            ]}
            rows={doctors.map((d) => ({
              id: d.id,
              cells: {
                name: (
                  <span className="flex items-center gap-2.5 font-medium">
                    <Avatar name={d.name} size="sm" />
                    <span>
                      {d.name}
                      {d.featured && (
                        <span className="ms-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-accent">
                          <Star aria-hidden className="size-3" /> Featured
                        </span>
                      )}
                    </span>
                  </span>
                ),
                hospital: d.hospitalName || "—",
                role: d.role || "—",
                status: (
                  <Chip size="sm" className={STATUS_TONE[d.status]}>
                    {d.status[0].toUpperCase() + d.status.slice(1)}
                  </Chip>
                ),
                actions: <DoctorRowActions d={d} locale={locale} />,
              },
            }))}
          />
        )}
      </Card>
    </div>
  );
}
