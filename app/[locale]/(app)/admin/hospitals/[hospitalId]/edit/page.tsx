import { notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/Card";
import HospitalEditForm, { HospitalDeleteForm } from "@/components/admin/HospitalEditForm";
import { getHospital } from "@/lib/db/hospitals";

// 9E · Partner hospital add/edit (#53). Identity, intro, languages, specialties,
// accreditation, named clinicians and publish state all persist via
// updateHospitalAction, which revalidates the public directory and profile.
// Accreditation and clinicians used to be printed read-only here, under a list
// page promising they were editable.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; hospitalId: string }>;
}) {
  const { locale, hospitalId } = await params;
  const h = await getHospital(hospitalId);
  if (!h) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Partner hospitals</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Edit — {h.name}</h1>
      </div>

      <HospitalEditForm
        locale={locale}
        hospitalId={h.id}
        corridorLabel={h.corridorLabel}
        values={{
          name: h.name,
          city: h.city,
          country: h.country,
          intro: h.intro,
          languages: h.languages,
          published: h.published,
          specialties: h.specialties,
          accreditation: h.accreditation,
          clinicians: h.clinicians,
        }}
      />

      <Card>
        <CardTitle>Remove partner</CardTitle>
        <HospitalDeleteForm locale={locale} hospitalId={h.id} />
      </Card>
    </div>
  );
}
