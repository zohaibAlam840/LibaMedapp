import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  FileText,
  Globe2,
  Languages,
  Mail,
  MapPin,
} from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import PersonCard from "@/components/ui/PersonCard";
import { getHospital } from "@/lib/db/hospitals";
import { getHospitalDoctors } from "@/lib/db/doctors";
import { getCorridors } from "@/lib/db/corridors";
import {
  getHospitalSections,
  getHospitalStats,
  sectionsOfKind,
  type HospitalSection,
} from "@/lib/db/hospitalContent";
import { getPartnerImages } from "@/lib/partnerImages";

// 9A · Hospital profile (#6) — data-driven template (design spec §3.6):
// header + accreditation + specialty taxonomy tags + languages + named clinicians.
//
// Partner-supplied brochure content (migration 010) extends the same template:
// the numbers a partner leads with, its centres and programmes, what it offers
// a referring clinician, what a referred patient receives, and the brochures
// themselves. Those panels are labelled as partner-supplied — a clinician
// choosing where to send a patient should be able to tell the partner's own
// claims from LibaMed's verified record of accreditation and residency.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; hospitalId: string }>;
}) {
  const { locale, hospitalId } = await params;
  const h = await getHospital(hospitalId);
  // Unpublished hospitals 404, exactly as unpublished corridors do. Checking
  // only for existence made every hospital in the table reachable by direct
  // URL: the index listed Hirslanden alone, but /hospitals/sheba,
  // /hospitals/anadolu and /hospitals/acibadem-healthcare-group all returned a
  // full profile. `published` is how the client stages a partner that is agreed
  // in the backend but not yet contracted to be shown — Acıbadem is unpublished
  // precisely because its fee terms are still open — so serving one unlisted
  // but reachable announced a commercial relationship that does not exist yet,
  // to anyone guessing the slug or following a crawler.
  if (!h || !h.published) notFound();
  // Admin-approved doctors (migration 002); falls back to the hospital record's
  // own clinician list when the directory hasn't been populated yet.
  const doctors = await getHospitalDoctors(hospitalId);
  const [stats, sections] = await Promise.all([
    getHospitalStats(hospitalId),
    getHospitalSections(hospitalId),
  ]);
  // Link the hospital back to its corridor page (published corridors only).
  const corridor = (await getCorridors()).find(
    (c) => c.published && c.primaryHospitalId === hospitalId,
  );
  const named = doctors.length
    ? doctors.map((d) => ({ name: d.name, role: d.role }))
    : h.clinicians;

  const centres = sectionsOfKind(sections, "centre");
  const programmes = sectionsOfKind(sections, "programme");
  const services = sectionsOfKind(sections, "service");
  const support = sectionsOfKind(sections, "support");
  const brochures = h.brochures ?? [];
  const office = h.intlOffice;
  const locations = h.locations ?? [];
  const { feature, credit } = getPartnerImages(hospitalId);
  // Any partner-supplied panel on the page earns the attribution note.
  const partnerContent =
    stats.length > 0 || sections.length > 0 || Boolean(h.aboutLong);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      {/* Header */}
      <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <Avatar name={h.name} size="xl" />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-ink">{h.name}</h1>
          {h.affiliation && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-secondary">
              <Building2 aria-hidden className="size-4" />
              {h.affiliation}
            </p>
          )}
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
          {locations.length > 0 && (
            <p className="mt-1 text-[13px] text-ink-muted">
              Treating sites: {locations.join(" · ")}
            </p>
          )}
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
            {/* The partner's own long-form description when it has sent one;
                `intro` otherwise, which is also what listings show. */}
            <p className="text-[15px] leading-relaxed text-ink">
              {h.aboutLong || h.intro}
            </p>
          </Card>

          {stats.length > 0 && (
            <Card>
              <CardTitle>By the numbers</CardTitle>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-xs leading-snug text-ink-muted">
                      {s.label}
                    </dt>
                    <dd className="text-[19px] font-semibold leading-tight text-ink">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          )}

          <Card>
            <CardTitle>Specialties</CardTitle>
            <div className="flex flex-wrap gap-2">
              {h.specialties.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
          </Card>

          {centres.length > 0 && (
            <Card>
              <CardTitle>Hospitals and centres</CardTitle>
              <SectionList sections={centres} />
            </Card>
          )}

          {programmes.length > 0 && (
            <Card>
              <CardTitle>Clinical and research programmes</CardTitle>
              <SectionList sections={programmes} />
            </Card>
          )}

          <Card>
            <CardTitle>Named receiving clinicians</CardTitle>
            {/* A partner can be published before its clinician list is
                confirmed. Saying so is the only honest option: an empty panel
                reads as a rendering fault, and the alternative — leaving
                placeholder names in place — tells a referring clinician they
                can send a patient to someone who does not exist. */}
            {named.length > 0 ? (
              <>
                <div className="flex flex-col gap-3">
                  {named.map((c) => (
                    <PersonCard key={c.name} name={c.name} role={c.role} />
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-muted">
                  Referrals route to a named clinician&rsquo;s personal queue —
                  never a shared inbox.
                </p>
              </>
            ) : (
              <p className="text-[15px] leading-relaxed text-ink-secondary">
                The named specialists accepting referrals at this partner are
                being confirmed with the hospital. Referrals always route to a
                named clinician&rsquo;s personal queue — never a shared inbox —
                so this list is published only once the hospital has confirmed
                it.{" "}
                <Link
                  href={`/${locale}/contact`}
                  className="font-medium text-accent hover:underline"
                >
                  Ask us about a case
                </Link>{" "}
                in the meantime.
              </p>
            )}
          </Card>

          {services.length > 0 && (
            <Card>
              <CardTitle>Services for referring clinicians</CardTitle>
              <SectionList sections={services} />
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {/* Partner photography. Portrait, so it leads the narrow column
              rather than stretching across the page as a hero would. */}
          {feature && (
            <figure className="overflow-hidden rounded-card bg-card shadow-card">
              {/* eslint-disable-next-line @next/next/no-img-element -- static
                  partner asset; next/image would add a loader for one file. */}
              <img
                src={feature.src}
                alt={feature.alt}
                className="aspect-4/5 w-full object-cover"
              />
              {credit && (
                <figcaption className="px-4 py-3 text-xs text-ink-muted">
                  {credit}
                </figcaption>
              )}
            </figure>
          )}

          {h.languages.length > 0 && (
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
          )}

          {support.length > 0 && (
            <Card>
              <CardTitle className="mb-3">Patient support</CardTitle>
              <SectionList sections={support} compact />
            </Card>
          )}

          {office?.name && (
            <Card>
              <SectionLabel className="mb-2">International office</SectionLabel>
              <p className="text-[15px] font-medium text-ink">{office.name}</p>
              {office.title && (
                <p className="text-[13px] text-ink-secondary">{office.title}</p>
              )}
              {/* Email and website only. The direct line the partner gave us is
                  held on the record for LibaMed staff, not published here. */}
              <div className="mt-3 flex flex-col gap-1.5 text-[13px]">
                {office.email && (
                  <a
                    href={`mailto:${office.email}`}
                    className="flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <Mail aria-hidden className="size-3.5 shrink-0" />
                    <span className="truncate">{office.email}</span>
                  </a>
                )}
                {office.website && (
                  <a
                    href={office.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <Globe2 aria-hidden className="size-3.5 shrink-0" />
                    <span className="truncate">
                      {office.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
              </div>
            </Card>
          )}

          {brochures.length > 0 && (
            <Card>
              <CardTitle className="mb-3">Partner materials</CardTitle>
              <ul className="flex flex-col gap-3">
                {brochures.map((b) => (
                  <li key={b.url}>
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="flex items-start gap-2 text-[13px] font-medium text-accent hover:underline"
                    >
                      <FileText aria-hidden className="mt-0.5 size-4 shrink-0" />
                      <span>{b.title} (PDF)</span>
                    </a>
                    {b.source && (
                      <p className="ms-6 text-xs text-ink-muted">{b.source}</p>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card>
            <SectionLabel className="mb-2">Data protection</SectionLabel>
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Records for this corridor are transferred and stored under the
              stricter of UK and destination rules, with every access logged.
            </p>
          </Card>

          {partnerContent && (
            <p className="px-1 text-xs leading-relaxed text-ink-muted">
              Figures, programme descriptions and service details on this page
              are supplied by the partner and reproduced from its own material.
              Accreditation, data residency and the named clinicians accepting
              referrals are verified by LibaMed.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/** Partner section list: title, optional paragraph, optional bullets. */
function SectionList({
  sections,
  compact = false,
}: {
  sections: HospitalSection[];
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-5"}>
      {sections.map((s) => (
        <div key={s.title}>
          <h3
            className={
              compact
                ? "text-[13px] font-semibold text-ink"
                : "text-[15px] font-semibold text-ink"
            }
          >
            {s.title}
          </h3>
          {s.body && (
            <p className="mt-1 text-[14px] leading-relaxed text-ink-secondary">
              {s.body}
            </p>
          )}
          {s.items.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1">
              {s.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[13px] text-ink-secondary"
                >
                  <span
                    aria-hidden
                    className="mt-[7px] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
