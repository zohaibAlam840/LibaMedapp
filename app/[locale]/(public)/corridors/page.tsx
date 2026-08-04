import type { Metadata } from "next";
import { Globe2 } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import CorridorCard from "@/components/marketing/CorridorCard";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import { getPublishedCorridors } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";

export const metadata: Metadata = {
  title: "Corridors — LibaMed",
  description:
    "Every LibaMed corridor and the data-protection rules that travel with it: where records are held, the legal transfer basis, and the specialties available.",
};

// Public corridor directory. A corridor is a legal route with its own residency
// and transfer rules, so it gets a real page rather than a badge — this is the
// index; /corridors/[corridorId] is the detail.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [corridors, hospitals] = await Promise.all([getPublishedCorridors(), getHospitals()]);
  const hospitalName = (id?: string) => hospitals.find((h) => h.id === id)?.name;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="max-w-[60ch]">
        <p className="text-[13px] font-medium text-accent">Corridors</p>
        <h1 className="mt-1 text-3xl font-semibold text-ink">Where we refer</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">
          A corridor is more than a destination. Each one carries its own data
          residency, legal transfer basis, and consent wording — applied
          automatically to every case, so the rules are never decided per
          referral.
        </p>
      </div>

      {corridors.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={Globe2}
          title="No corridors published yet"
          description="Corridors appear here once they're live."
        />
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {corridors.map((c) => (
            <CorridorCard
              key={c.id}
              corridor={c}
              hospitalName={hospitalName(c.primaryHospitalId)}
              locale={locale}
            />
          ))}
        </div>
      )}

      <NoFeeNotice className="mt-10" />
    </div>
  );
}
