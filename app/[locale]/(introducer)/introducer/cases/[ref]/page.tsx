import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Hourglass, TriangleAlert } from "lucide-react";
import DraftForm from "@/components/introducer/DraftForm";
import Button from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";
import SubmitButton from "@/components/ui/SubmitButton";
import { getSessionUser } from "@/lib/auth";
import { getOriginatedCase } from "@/lib/db/cosign";
import { getReferableCorridors } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";
import { submitForCosignAction } from "@/lib/introducerActions";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; ref: string }>;
}) {
  const { locale, ref } = await params;
  const user = await getSessionUser();
  const c = await getOriginatedCase(ref, user);
  // notFound rather than a permission message: a case that isn't theirs must
  // not be confirmed to exist.
  if (!c) notFound();

  const editable = c.status === "draft";
  const verified = user?.accountStatus === "verified";
  const [corridors, hospitals] = editable
    ? await Promise.all([getReferableCorridors(), getHospitals()])
    : [[], []];

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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-ink">{c.ref}</h1>
          <StatusChip status={c.status} />
        </div>
        <p className="mt-1 text-sm text-ink-secondary">
          {[c.patientRef, c.corridorLabel, c.hospital].filter(Boolean).join(" · ")}
        </p>
      </div>

      {c.cosignState === "declined" && c.cosignNote && (
        <Card className="border-warning-text/20 bg-warning-bg">
          <CardTitle>Sent back by {c.cosignedBy || "a clinician"}</CardTitle>
          <p className="mt-2 whitespace-pre-line text-sm text-warning-text">{c.cosignNote}</p>
          <p className="mt-2 text-[13px] text-warning-text">
            Revise the case below and submit it again.
          </p>
        </Card>
      )}

      {c.status === "awaiting-cosign" && (
        <Card>
          <div className="flex items-start gap-3">
            <Hourglass aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" />
            <div>
              <CardTitle>With a UK clinician</CardTitle>
              <p className="mt-1 text-sm text-ink-secondary">
                A UK-registered clinician is reviewing this case. They will either co-sign it —
                which sends it to the hospital and makes them the referring clinician — or send it
                back to you with what is missing. You&rsquo;ll get an email either way.
              </p>
            </div>
          </div>
        </Card>
      )}

      {c.cosignState === "signed" && (
        <Card>
          <div className="flex items-start gap-3">
            <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success-text" />
            <div>
              <CardTitle>Co-signed{c.cosignedBy ? ` by ${c.cosignedBy}` : ""}</CardTitle>
              <p className="mt-1 text-sm text-ink-secondary">
                {c.cosignedAt && `Signed ${c.cosignedAt}. `}
                This is now a live referral and the clinical conversation runs between the
                clinicians. You can see its progress here, but not the clinical record — that is
                between the referring and receiving clinicians.
              </p>
            </div>
          </div>
        </Card>
      )}

      {!editable && c.status !== "awaiting-cosign" && c.cosignState !== "signed" && (
        <Card>
          <CardTitle>Progress</CardTitle>
          <p className="mt-1 text-sm text-ink-secondary">Last change {c.updated}.</p>
        </Card>
      )}

      {editable ? (
        <>
          <DraftForm
            locale={locale}
            corridors={corridors.map((x) => ({ id: x.id, label: x.label }))}
            hospitals={hospitals
              .filter((h) => h.published)
              .map((h) => ({ id: h.id, name: h.name, corridorLabel: h.corridorLabel }))}
            existing={c}
          />

          <Card className="flex flex-col gap-3">
            <CardTitle>Submit for co-sign</CardTitle>
            <p className="text-sm text-ink-secondary">
              Save your changes first. Submitting puts the case in front of a UK-registered
              clinician; it does not send it to a hospital.
            </p>
            {!verified && (
              <p className="flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
                <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
                Your registration is still being checked, so you can&rsquo;t submit yet. The draft
                is saved and waiting.
              </p>
            )}
            <form action={submitForCosignAction} className="flex justify-end">
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="ref" value={c.ref} />
              <SubmitButton disabled={!verified} pendingLabel="Submitting…">
                Submit for co-sign
              </SubmitButton>
            </form>
          </Card>
        </>
      ) : (
        <Card className="flex flex-col gap-3">
          <CardTitle>What you submitted</CardTitle>
          <dl className="flex flex-col gap-3 text-sm">
            <Row label="Specialty" value={c.specialty} />
            <Row label="Urgency" value={c.urgency} />
            <Row label="What is being sought" value={c.treatmentScope} />
            <Row label="Background" value={c.clinicalSummary} />
          </dl>
        </Card>
      )}

      {!editable && (
        <div>
          <Button href={`/${locale}/introducer`} variant="secondary" size="sm">
            Back to your cases
          </Button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-[13px] font-medium text-ink-secondary">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line text-ink">{value}</dd>
    </div>
  );
}
