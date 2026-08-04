import { Card, CardTitle } from "@/components/ui/Card";
import HospitalEditForm from "@/components/admin/HospitalEditForm";
import { getHospital } from "@/lib/db/hospitals";

// 9E · Partner hospital add/edit (#53). Identity, specialties, and publish state
// persist via updateHospitalAction; accreditation & named clinicians are shown
// read-only (managed separately).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; hospitalId: string }>;
}) {
  const { locale, hospitalId } = await params;
  const h = await getHospital(hospitalId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Partner hospitals</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Edit — {h.name}</h1>
      </div>

      <HospitalEditForm
        locale={locale}
        hospitalId={h.id}
        name={h.name}
        city={h.city}
        country={h.country}
        corridorLabel={h.corridorLabel}
        published={h.published}
        specialties={h.specialties}
      />

      {(h.accreditation.length > 0 || h.clinicians.length > 0) && (
        <div className="flex flex-col gap-5">
          {h.accreditation.length > 0 && (
            <Card>
              <CardTitle>Accreditation</CardTitle>
              <ul className="flex flex-col gap-2">
                {h.accreditation.map((a) => (
                  <li
                    key={a.name}
                    className="flex items-center justify-between rounded-inner border border-line px-3.5 py-2.5 text-[15px]"
                  >
                    <span className="font-medium text-ink">{a.name}</span>
                    <span className="text-[13px] text-ink-secondary">Valid to {a.expires}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {h.clinicians.length > 0 && (
            <Card>
              <CardTitle>Named receiving clinicians</CardTitle>
              <ul className="flex flex-col gap-2">
                {h.clinicians.map((c) => (
                  <li
                    key={c.name}
                    className="flex items-center justify-between rounded-inner border border-line px-3.5 py-2.5 text-[15px]"
                  >
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-[13px] text-ink-secondary">{c.role}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
