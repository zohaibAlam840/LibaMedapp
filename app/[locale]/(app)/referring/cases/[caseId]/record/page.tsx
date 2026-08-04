import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  ScrollText,
  ShieldAlert,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import PrintButton from "@/components/ui/PrintButton";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import HandbackBadge from "@/components/ui/HandbackBadge";
import AuditTrailList from "@/components/case/AuditTrailList";
import EmptyState from "@/components/ui/EmptyState";
import { getCorridorRecord } from "@/lib/db/corridors";
import { NON_SUBSTITUTION_LABELS } from "@/lib/referral";
import { getCase, getReferralCompliance } from "@/lib/db/referrals";

// 9C · Referral record (NHS-safeguard item 2) — the GP's own immutable,
// exportable copy of the referral: declaration, consent, acceptance, scope, and
// the append-only audit chain. Immutability is guaranteed by the backend store;
// this page presents it and offers a self-served PDF (print).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();
  const record = await getReferralCompliance(caseId);
  const corridor = await getCorridorRecord(c.corridor);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      {/* Print-only letterhead */}
      <div className="hidden print:block">
        <p className="text-lg font-semibold text-ink">LibaMed — Referral record</p>
        <p className="text-[13px] text-ink-secondary">
          Generated for the referring clinician&rsquo;s records.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/${locale}/referring/cases/${c.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          Back to case
        </Link>
        <PrintButton />
      </div>

      <div>
        <p className="text-[13px] font-medium text-ink-secondary">
          Referral record · case {c.ref} · patient {c.patientRef}
        </p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">
          {c.specialty} referral · {c.hospital}
        </h1>
      </div>

      {!record ? (
        <Card>
          <EmptyState
            icon={ScrollText}
            title="No compliance record for this case"
            description="This demo case predates the NHS-safeguard fields. Newer referrals carry a full declaration, consent, and audit record here."
          />
        </Card>
      ) : (
        <>
          <Card>
            <CardTitle className="mb-2">Summary</CardTitle>
            <div className="divide-y divide-line">
              <DetailPanelRow icon={Stethoscope} label="Treatment scope" value={record.treatmentScope} />
              <DetailPanelRow icon={Globe2} label="Corridor & residency" value={`${corridor?.label ?? c.corridorLabel} · ${corridor?.residency ?? c.residency}`} />
              <DetailPanelRow
                icon={ShieldAlert}
                label="Data-transfer basis"
                value={corridor?.transferBasis === "scc" ? `Standard Contractual Clauses · ${corridor.country}` : `UK adequacy · ${corridor?.country ?? ""}`}
              />
              <DetailPanelRow
                icon={CheckCircle2}
                label="Continuity of care"
                value={<HandbackBadge handback={record.handback} withDate />}
              />
            </div>
          </Card>

          <Card>
            <CardTitle className="mb-2">NHS non-substitution declaration</CardTitle>
            <p className="text-[15px] font-medium text-ink">
              {NON_SUBSTITUTION_LABELS[record.nonSubstitution.reason]}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-ink-secondary">
              {record.nonSubstitution.justification}
            </p>
            <p className="mt-2 text-xs text-ink-muted">
              Declared by {record.nonSubstitution.declaredBy} · {record.nonSubstitution.declaredAt}
            </p>
          </Card>

          <Card>
            <CardTitle className="mb-2">Patient consent · v{record.patientConsent.version}</CardTitle>
            <p className="mb-3 text-[13px] text-ink-secondary">
              Captured {record.patientConsent.capturedAt} · records shared with{" "}
              {record.patientConsent.country} · {record.patientConsent.safeguard}
            </p>
            <ul className="flex flex-col gap-2">
              {record.patientConsent.items.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                  {item.label}
                </li>
              ))}
            </ul>
          </Card>

          <NoFeeNotice />

          <Card>
            <CardTitle className="mb-3">Audit trail</CardTitle>
            <AuditTrailList entries={record.audit} />
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              This log is append-only and hash-chained in the case data store; entries
              cannot be edited or removed. Hashes shown are chain references.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}
