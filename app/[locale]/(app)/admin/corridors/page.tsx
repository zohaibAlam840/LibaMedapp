import { Card } from "@/components/ui/Card";
import CorridorEditCard from "@/components/admin/CorridorEditCard";
import CreateCorridorForm from "@/components/admin/CreateCorridorForm";
import { getCorridors, corridorCode } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";
import { getSessionUser } from "@/lib/auth";

// 9E · Corridor configuration (#55). Corridor = first-class config object
// (C2C §4/§10). Editing is gated on the admin `canEditCorridors` flag
// (Vol III §0.4); publishing a corridor controls whether it appears on the
// public marketing site.
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [corridors, user, hospitals] = await Promise.all([
    getCorridors(),
    getSessionUser(),
    getHospitals(),
  ]);
  const canEdit = Boolean(user?.canEditCorridors);
  const publishedCount = corridors.filter((c) => c.published).length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[28px] font-semibold text-ink">Corridor configuration</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Residency, transfer mechanism, safeguard wording, specialties, and
            public visibility — per corridor. {publishedCount} of {corridors.length} shown publicly.
          </p>
        </div>
        {canEdit && (
          <CreateCorridorForm
            locale={locale}
            hospitals={hospitals.map((h) => ({ id: h.id, name: h.name }))}
          />
        )}
      </div>

      {!canEdit && (
        <Card className="border border-warning-bg">
          <p className="text-[13px] text-ink-secondary">
            You have read-only access to corridor configuration. An administrator
            with corridor rights can make changes.
          </p>
        </Card>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {corridors.map((c) => (
          <CorridorEditCard
            key={c.id}
            corridor={c}
            code={corridorCode(c)}
            locale={locale}
            canEdit={canEdit}
          />
        ))}
      </div>

      <p className="rounded-inner bg-subtle px-4 py-3 text-[13px] text-ink-secondary">
        Every change here is written to the audit log. Consent wording and
        transfer templates are legally supplied — the platform stores and
        versions them. Data-residency and eligibility rules are enforced in code
        and are not editable from this screen.
      </p>
    </div>
  );
}
