import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DraftForm from "@/components/introducer/DraftForm";
import { cosignReady } from "@/lib/db/cosign";
import { getReferableCorridors } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";

export const metadata = { title: "Start a case · LibaMed" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // No migration, no writing: a form that silently discards what someone typed
  // about a patient is worse than no form.
  if (!(await cosignReady())) notFound();

  const [corridors, hospitals] = await Promise.all([getReferableCorridors(), getHospitals()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href={`/${locale}/introducer`}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          Your cases
        </Link>
        <h1 className="text-2xl font-semibold text-ink">Start a case</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          This stays a private draft until you submit it for co-sign. Nobody else can see it
          before then.
        </p>
      </div>

      <DraftForm
        locale={locale}
        corridors={corridors.map((c) => ({ id: c.id, label: c.label }))}
        hospitals={hospitals
          .filter((h) => h.published)
          .map((h) => ({ id: h.id, name: h.name, corridorLabel: h.corridorLabel }))}
      />
    </div>
  );
}
