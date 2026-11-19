import { ArrowRight, Building2 } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import HospitalCard from "@/components/marketing/HospitalCard";
import { getHospitals } from "@/lib/db/hospitals";

// 9A · Partner hospitals list (#5). Public site shows only published partners
// (admin controls this via the publish toggle on /admin/hospitals) — so this
// page can legitimately be empty, and says so rather than rendering a bare
// heading over nothing.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const base = `/${locale}`;
  const hospitals = (await getHospitals()).filter((h) => h.published);

  return (
    <div>
      <section className="border-b border-line bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
          <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Partner hospitals
          </h1>
          <p className="mt-4 max-w-[64ch] text-lg leading-relaxed text-ink-secondary">
            Every partner passes four-stage accreditation before a single referral
            routes: international certification, outcome transparency, a
            UK-standard complaints process, and clinical quality audit.
          </p>
          {hospitals.length > 0 && (
            <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-line bg-page px-3.5 py-2 text-[13px] font-medium text-ink-secondary">
              <Building2 aria-hidden className="size-4" />
              {hospitals.length} accredited {hospitals.length === 1 ? "partner" : "partners"}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8">
        {hospitals.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No partners published yet"
            description="Accredited hospitals appear here once they clear the four-stage check. If you have a case in mind in the meantime, ask us and we'll tell you where it can be referred."
          >
            <div className="flex flex-wrap justify-center gap-3">
              <Button href={`${base}/corridors`}>
                Explore corridors
                <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
              </Button>
              <Button variant="secondary" href={`${base}/contact`}>
                Ask about a case
              </Button>
            </div>
          </EmptyState>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {hospitals.map((h) => (
              <HospitalCard key={h.id} hospital={h} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
