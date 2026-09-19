import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import CosignForm from "@/components/cosign/CosignForm";
import { Card, CardTitle } from "@/components/ui/Card";
import { getSessionUser } from "@/lib/auth";
import { getCosignCase } from "@/lib/db/cosign";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; ref: string }>;
}) {
  const { locale, ref } = await params;
  const user = await getSessionUser();
  const c = await getCosignCase(ref, user);
  if (!c) notFound();

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <Link
          href={`/${locale}/referring/cosign`}
          className="mb-3 inline-flex items-center gap-1.5 text-[13px] text-ink-secondary hover:text-ink"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          Awaiting co-sign
        </Link>
        <h1 className="text-2xl font-semibold text-ink">{c.ref}</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {[c.patientRef, c.corridorLabel, c.hospital || "No hospital chosen"]
            .filter(Boolean)
            .join(" · ")}
          {c.introducer && ` · raised by ${c.introducer}`}
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <CardTitle>What the introducer has given you</CardTitle>
        <dl className="flex flex-col gap-3 text-sm">
          <Row label="Specialty" value={c.specialty} />
          <Row label="Urgency" value={c.urgency} />
          <Row label="What is being sought" value={c.treatmentScope} />
          <Row label="Background" value={c.clinicalSummary} />
        </dl>
        <p className="border-t border-line pt-3 text-[13px] text-ink-secondary">
          This is everything recorded. If it isn&rsquo;t enough to decide on, send it back rather
          than signing — the introducer gets your note and can revise it.
        </p>
      </Card>

      <CosignForm locale={locale} caseRef={c.ref} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] font-medium text-ink-secondary">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-ink">
        {value || <span className="text-ink-muted">Not given</span>}
      </dd>
    </div>
  );
}
