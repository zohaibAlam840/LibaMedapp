import HospitalCreateForm from "@/components/admin/HospitalCreateForm";
import { getCorridors } from "@/lib/db/corridors";

// 9E · Partner hospital add (#53). The list page has always had an "Add
// hospital" button; until now it had no destination behind it.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const corridors = await getCorridors();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Partner hospitals</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Add hospital</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Saved unpublished unless you say otherwise, so you can finish the
          record before it reaches the public directory.
        </p>
      </div>

      <HospitalCreateForm
        locale={locale}
        corridors={corridors.map((c) => ({ id: c.id, label: c.label }))}
      />
    </div>
  );
}
