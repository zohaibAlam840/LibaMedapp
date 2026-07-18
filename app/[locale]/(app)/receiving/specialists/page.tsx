import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import ProgressBar from "@/components/ui/ProgressBar";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import { getDemoHospital } from "@/lib/demo";

// Coordinator · Specialists (sidebar aggregation) — per-specialist workload at
// the coordinator's hospital. Operational view: no clinical content.
const WORKLOAD = [
  { name: "Dr. Noa Peretz", specialty: "Oncology", queue: 3, avg: "1.8 days", load: 60 },
  { name: "Dr. Avi Shalev", specialty: "Orthopedics — spine", queue: 2, avg: "2.4 days", load: 40 },
  { name: "Dr. Tamar Ben-David", specialty: "Fertility", queue: 1, avg: "1.1 days", load: 20 },
];

export default async function Page() {
  const hospital = getDemoHospital("sheba");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Specialists</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          {hospital.name} · workload across your named receiving clinicians.
        </p>
      </div>

      <Card>
        <CardTitle>Workload</CardTitle>
        <ResponsiveTable
          columns={[
            { key: "name", label: "Specialist" },
            { key: "specialty", label: "Specialty" },
            { key: "queue", label: "In queue", align: "end" },
            { key: "avg", label: "Avg response" },
            { key: "load", label: "Load" },
          ]}
          rows={WORKLOAD.map((w) => ({
            id: w.name,
            cells: {
              name: (
                <span className="flex items-center gap-2.5 font-medium">
                  <Avatar name={w.name} size="sm" />
                  {w.name}
                </span>
              ),
              specialty: w.specialty,
              queue: w.queue,
              avg: w.avg,
              load: (
                <ProgressBar
                  value={w.load}
                  label={`${w.name} load`}
                  className="w-28"
                />
              ),
            },
          }))}
        />
        <p className="mt-3 text-xs text-ink-muted">
          Coordinators see status, timing, and logistics only — not clinical
          detail or diagnostic documents.
        </p>
      </Card>
    </div>
  );
}
