import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import { getHospitals } from "@/lib/db/hospitals";

// 9A · Partner hospitals list (#5). Public site shows only published partners
// (admin controls this via the publish toggle on /admin/hospitals).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const hospitals = (await getHospitals()).filter((h) => h.published);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-ink">Partner hospitals</h1>
        <p className="mt-2 text-[15px] text-ink-secondary">
          Every partner passes four-stage accreditation before a single referral
          routes: international certification, outcome transparency, a
          UK-standard complaints process, and clinical quality audit.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {hospitals.map((h) => (
          <Link key={h.id} href={`/${locale}/hospitals/${h.id}`} className="group">
            <Card className="flex h-full flex-col gap-4 p-6 transition-shadow group-hover:shadow-elevated">
              <div className="flex items-center gap-3">
                <Avatar name={h.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-ink">{h.name}</p>
                  <p className="flex items-center gap-1 text-[13px] text-ink-secondary">
                    <MapPin aria-hidden className="size-3.5" />
                    {h.city}, {h.country} · {h.corridorLabel}
                  </p>
                </div>
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
                />
              </div>
              <p className="text-sm leading-relaxed text-ink-secondary">{h.intro}</p>
              <div className="mt-auto flex flex-wrap gap-2">
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
    </div>
  );
}
