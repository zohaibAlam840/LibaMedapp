import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Globe2,
  Languages,
  Lock,
  ScrollText,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import { isReferable, NHS_AVAILABILITY_LABELS } from "@/lib/corridors";
import { corridorCode, getCorridorRecord, getPublishedCorridors } from "@/lib/db/corridors";
import { getHospital } from "@/lib/db/hospitals";
import { getHospitalDoctors } from "@/lib/db/doctors";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ corridorId: string }>;
}): Promise<Metadata> {
  const { corridorId } = await params;
  const c = await getCorridorRecord(corridorId);
  if (!c) return { title: "Corridor — LibaMed" };
  return {
    title: `${c.label} — LibaMed`,
    description: `Data residency, legal transfer basis, and available specialties for the ${c.label} corridor.`,
  };
}

// Public corridor detail. Deliberately leads with the compliance facts — a
// clinician's first question is where records go and under what basis, not
// marketing copy. Unpublished corridors 404 rather than leak.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; corridorId: string }>;
}) {
  const { locale, corridorId } = await params;
  const corridor = await getCorridorRecord(corridorId);
  if (!corridor || !corridor.published) notFound();

  const [hospital, others] = await Promise.all([
    corridor.primaryHospitalId ? getHospital(corridor.primaryHospitalId) : Promise.resolve(null),
    getPublishedCorridors(),
  ]);
  const doctors = corridor.primaryHospitalId
    ? await getHospitalDoctors(corridor.primaryHospitalId)
    : [];

  const referable = corridor.specialties.filter(isReferable);
  const blocked = corridor.specialties.filter((s) => !isReferable(s));

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
      <Link
        href={`/${locale}/corridors`}
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
        All corridors
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent-soft text-lg font-semibold text-accent">
          {corridorCode(corridor)}
        </span>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold text-ink">{corridor.label}</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Referrals from the United Kingdom to {corridor.country}
            {hospital ? ` · ${hospital.name}` : ""}
          </p>
        </div>
      </div>

      {/* The compliance facts, first */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardTitle className="mb-2">How your patient&rsquo;s data is protected</CardTitle>
            <TransferBasisNotice corridor={corridor} />
            <div className="mt-3 divide-y divide-line">
              <DetailPanelRow icon={Globe2} label="Data residency" value={corridor.residency} />
              <DetailPanelRow
                icon={ScrollText}
                label="Legal transfer basis"
                value={
                  corridor.transferBasis === "scc"
                    ? "Standard Contractual Clauses / IDTA"
                    : "UK adequacy regulations"
                }
              />
              {corridor.notification && (
                <DetailPanelRow
                  icon={ScrollText}
                  label="Regulatory notification"
                  value={`${corridor.notification.authority} — within ${corridor.notification.withinBusinessDays} business days of first transfer`}
                />
              )}
            </div>
          </Card>

          {/* Specialties + the eligibility line */}
          <Card>
            <CardTitle className="mb-1">Specialties available</CardTitle>
            <p className="mb-3 text-[13px] text-ink-secondary">
              Only care that isn&rsquo;t routinely available on the NHS can be
              referred abroad — the platform enforces this, not the referring
              clinician&rsquo;s judgement case by case.
            </p>
            {referable.length === 0 ? (
              <p className="rounded-inner bg-subtle px-3.5 py-3 text-[13px] text-ink-muted">
                No specialties are open for referral in this corridor yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {referable.map((s) => (
                  <span key={s.name} title={NHS_AVAILABILITY_LABELS[s.nhs]}>
                    <Chip size="sm">
                      <Stethoscope aria-hidden className="size-3.5" />
                      {s.name}
                    </Chip>
                  </span>
                ))}
              </div>
            )}

            {blocked.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-[13px] font-medium text-ink-secondary">
                  Not referable — routinely available on the NHS
                </p>
                <div className="flex flex-wrap gap-2">
                  {blocked.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex h-[26px] items-center gap-1 rounded-full bg-transparent px-2.5 text-[13px] text-ink-muted line-through decoration-ink-muted/40"
                    >
                      <Lock aria-hidden className="size-3" />
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Named clinicians at the partner hospital */}
          {doctors.length > 0 && (
            <Card>
              <CardTitle className="mb-1">Named specialists</CardTitle>
              <p className="mb-3 text-[13px] text-ink-secondary">
                Referrals route to a named consultant&rsquo;s personal queue — never a shared inbox.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {doctors.map((d) => (
                  <div key={d.id} className="flex items-center gap-3 rounded-inner border border-line p-3">
                    <Avatar name={d.name} size="md" />
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-medium text-ink">{d.name}</p>
                      <p className="truncate text-[13px] text-ink-secondary">{d.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          {hospital && (
            <Card>
              <CardTitle className="mb-2">Partner hospital</CardTitle>
              <div className="flex items-center gap-3">
                <Avatar name={hospital.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-ink">{hospital.name}</p>
                  <p className="truncate text-[13px] text-ink-secondary">
                    {hospital.city}, {hospital.country}
                  </p>
                </div>
              </div>
              {hospital.languages.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
                  {hospital.languages.slice(0, 4).map((l) => (
                    <Chip key={l} size="sm">
                      <Languages aria-hidden className="size-3" />
                      {l}
                    </Chip>
                  ))}
                </div>
              )}
              {hospital.published && (
                <Button
                  variant="secondary"
                  size="sm"
                  href={`/${locale}/hospitals/${hospital.id}`}
                  className="mt-3 w-full"
                >
                  <Building2 aria-hidden className="size-4" />
                  View hospital
                </Button>
              )}
            </Card>
          )}

          <Card>
            <CardTitle className="mb-2">Refer into this corridor</CardTitle>
            <p className="text-[13px] leading-relaxed text-ink-secondary">
              Referrals are made by clinicians. Register with your GMC number to
              open a case — consent and the data-transfer basis are captured
              before anything is shared.
            </p>
            <Button href={`/${locale}/register`} size="sm" className="mt-3 w-full">
              Register as a clinician
              <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              href={`/${locale}/for-clinicians`}
              className="mt-1 w-full"
            >
              How referrals work
            </Button>
          </Card>

          {others.length > 1 && (
            <Card>
              <CardTitle className="mb-2">Other corridors</CardTitle>
              <div className="flex flex-col">
                {others
                  .filter((o) => o.id !== corridor.id)
                  .map((o) => (
                    <Link
                      key={o.id}
                      href={`/${locale}/corridors/${o.id}`}
                      className="flex items-center gap-2.5 rounded-inner px-2 py-2.5 transition-colors hover:bg-subtle"
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
                        {corridorCode(o)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ink">
                        {o.label}
                      </span>
                      <ArrowRight aria-hidden className="size-3.5 text-ink-muted rtl:-scale-x-100" />
                    </Link>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <NoFeeNotice className="mt-6" />
    </div>
  );
}
