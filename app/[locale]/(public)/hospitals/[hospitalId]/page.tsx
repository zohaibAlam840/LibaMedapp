import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Globe2, Languages, MapPin } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import PersonCard from "@/components/ui/PersonCard";
import { getHospital } from "@/lib/db/hospitals";
import { getHospitalDoctors } from "@/lib/db/doctors";
import { getCorridors } from "@/lib/db/corridors";

// 9A · Hospital profile (#6) — data-driven template (design spec §3.6):
// header + accreditation + specialty taxonomy tags + languages + named clinicians.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; hospitalId: string }>;
}) {
  const { locale, hospitalId } = await params;
  const h = await getHospital(hospitalId);
  if (!h) notFound();
  // Admin-approved doctors (migration 002); falls back to the hospital record's
  // own clinician list when the directory hasn't been populated yet.
  const doctors = await getHospitalDoctors(hospitalId);
  // Link the hospital back to its corridor page (published corridors only).
  const corridor = (await getCorridors()).find(
    (c) => c.published && c.primaryHospitalId === hospitalId,
  );
  const named = doctors.length
    ? doctors.map((d) => ({ name: d.name, role: d.role }))
    : h.clinicians;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      {/* Header */}
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={h.name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-ink">{h.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-secondary">
            <MapPin aria-hidden className="size-4" />
            {h.city}, {h.country}
            <span aria-hidden>·</span>
            <Globe2 aria-hidden className="size-4" />
            {corridor ? (
              <Link
                href={`/${locale}/corridors/${corridor.id}`}
                className="font-medium text-accent hover:underline"
              >
                {corridor.label}
              </Link>
            ) : (
              h.corridorLabel
            )}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {h.accreditation.map((a) => (
              <Chip key={a.name} selected size="sm">
                <BadgeCheck aria-hidden className="size-3.5" />
                {a.name} · valid to {a.expires}
              </Chip>
            ))}
          </div>
        </div>
        <Button href={`/${locale}/for-clinicians`} className="shrink-0">
          Refer a patient
        </Button>
      </Card>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardTitle>About</CardTitle>
            <p className="text-[15px] leading-relaxed text-ink">{h.intro}</p>
          </Card>

          <Card>
            <CardTitle>Specialties</CardTitle>
            <div className="flex flex-wrap gap-2">
              {h.specialties.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Named receiving clinicians</CardTitle>
            <div className="flex flex-col gap-3">
              {named.map((c) => (
                <PersonCard key={c.name} name={c.name} role={c.role} />
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-muted">
              Referrals route to a named clinician&rsquo;s personal queue — never
              a shared inbox.
            </p>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardTitle className="mb-3">Languages</CardTitle>
            <div className="flex flex-wrap gap-2">
              {h.languages.map((l) => (
                <Chip key={l} size="sm">
                  <Languages aria-hidden className="size-3.5" />
                  {l}
                </Chip>
              ))}
            </div>
          </Card>

          <Card>
            <SectionLabel className="mb-2">Data protection</SectionLabel>
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Records for this corridor are transferred and stored under the
              stricter of UK and destination rules, with every access logged.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
