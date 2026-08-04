import { Stethoscope } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import EmptyState from "@/components/ui/EmptyState";
import AddDoctorForm from "@/components/admin/AddDoctorForm";
import { getSessionUser } from "@/lib/auth";
import { getDoctorsForHospital } from "@/lib/db/doctors";
import { getCases } from "@/lib/db/referrals";
import { getHospital } from "@/lib/db/hospitals";

// Coordinator · Specialists (sidebar aggregation) — the named receiving
// clinicians at the coordinator's own hospital, with live queue counts.
// Operational view: no clinical content. A coordinator can submit a new
// clinician; an admin approves them before they appear publicly.
const STATUS_TONE: Record<string, string> = {
  approved: "bg-success-bg text-success-text",
  pending: "bg-warning-bg text-warning-text",
  rejected: "bg-danger-bg text-danger-text",
};

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();
  const hospitalId = user?.hospitalId;

  const [doctors, cases, hospital] = await Promise.all([
    hospitalId ? getDoctorsForHospital(hospitalId) : Promise.resolve([]),
    getCases(user),
    hospitalId ? getHospital(hospitalId) : Promise.resolve(null),
  ]);

  // Live workload: open cases currently addressed to each named clinician.
  const openCases = cases.filter(
    (c) => c.status !== "summary-returned" && c.status !== "consent-withdrawn",
  );
  const queueFor = (name: string) => openCases.filter((c) => c.specialist === name).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Specialists</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            {hospital?.name ?? "Your hospital"} · workload across your named
            receiving clinicians.
          </p>
        </div>
        {hospitalId && (
          <AddDoctorForm locale={locale} hospitals={[]} canChooseHospital={false} />
        )}
      </div>

      <Card>
        <CardTitle>Workload</CardTitle>
        {!hospitalId ? (
          <EmptyState
            icon={Stethoscope}
            title="No hospital linked"
            description="Your account isn't linked to a hospital yet — ask an administrator to assign you."
          />
        ) : doctors.length === 0 ? (
          <EmptyState
            icon={Stethoscope}
            title="No clinicians yet"
            description="Add your first named receiving clinician above. An admin approves them before they appear publicly."
          />
        ) : (
          <ResponsiveTable
            columns={[
              { key: "name", label: "Clinician" },
              { key: "specialty", label: "Specialty" },
              { key: "queue", label: "Open cases" },
              { key: "status", label: "Status" },
            ]}
            rows={doctors.map((d) => ({
              id: d.id,
              cells: {
                name: (
                  <span className="flex items-center gap-2.5 font-medium">
                    <Avatar name={d.name} size="sm" />
                    {d.name}
                  </span>
                ),
                specialty: d.role || "—",
                queue: queueFor(d.name),
                status: (
                  <Chip size="sm" className={STATUS_TONE[d.status]}>
                    {d.status[0].toUpperCase() + d.status.slice(1)}
                  </Chip>
                ),
              },
            }))}
          />
        )}
      </Card>
    </div>
  );
}
