import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
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
              <Link key={h.id} href={`${base}/hospitals/${h.id}`} className="group">
                <Card className="flex h-full flex-col gap-4 p-6 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-elevated">
                  <div className="flex items-center gap-3">
                    <Avatar name={h.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-semibold text-ink">{h.name}</p>
                      <p className="flex items-center gap-1 text-[13px] text-ink-secondary">
                        <MapPin aria-hidden className="size-3.5 shrink-0" />
                        <span className="truncate">
                          {h.city}, {h.country} · {h.corridorLabel}
                        </span>
                      </p>
                    </div>
                    <ArrowRight
                      aria-hidden
                      className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                    />
                  </div>
                  <p className="text-sm leading-relaxed text-ink-secondary">{h.intro}</p>
                  <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
                    {h.accreditation.map((a) => (
                      <Chip key={a.name} selected size="sm">
                        <BadgeCheck aria-hidden className="size-3.5" />
                        {a.name}
                      </Chip>
                    ))}
                    {h.specialties.slice(0, 3).map((s) => (
                      <Chip key={s} size="sm">
                        {s}
                      </Chip>
                    ))}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
