"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Globe2,
  ScrollText,
  ShieldAlert,
  Stethoscope,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import NoFeeNotice from "@/components/ui/NoFeeNotice";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import Button from "@/components/ui/Button";
import type { CorridorRecord } from "@/lib/db/corridors";
import { NON_SUBSTITUTION_LABELS } from "@/lib/referral";
import { CONSENT_ITEM_DEFS, CONSENT_VERSION } from "@/lib/intake";
import { useIntake } from "@/lib/intakeStore";
import { createReferralAction } from "@/lib/referralActions";

// Intake step 7 — review & submit. Reads the draft, shows the real chosen
// values, and on submit calls createReferralAction (which inserts the referral,
// itemised consent, documents, and audit entries), then clears the draft and
// lands on the confirmation with the new case reference.
export default function ReviewStep({
  locale,
  hospitalNames,
  corridors,
}: {
  locale: string;
  hospitalNames: Record<string, string>;
  corridors: CorridorRecord[];
}) {
  const { data, clear } = useIntake();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const corridor = corridors.find((c) => c.id === data.corridorId) ?? corridors[0];
  const hospitalName = hospitalNames[corridor?.primaryHospitalId ?? ""] ?? "Receiving hospital";
  const agreedCount = data.consentAgreed.length;
  const allConsent = agreedCount === CONSENT_ITEM_DEFS.length;
  const patientName = [data.firstName, data.lastName].filter(Boolean).join(" ") || "—";

  // Minimum to open a case: a corridor+specialty, the NHS declaration, and full consent.
  const ready = Boolean(corridor && data.specialty && data.nsReason && data.nsJustification && allConsent);

  const edit = (step: string) => (
    <Link
      href={`/${locale}/referring/intake/${step}`}
      className="text-[13px] font-medium text-accent hover:underline"
    >
      Edit
    </Link>
  );

  function submit() {
    setError(null);
    startTransition(async () => {
      // Opaque patient reference — never a real name in lists (spec §7.1).
      const patientRef = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      const res = await createReferralAction({
        locale,
        patientRef,
        corridorId: corridor?.id ?? data.corridorId,
        hospitalId: corridor?.primaryHospitalId ?? null,
        specialist: null,
        specialty: data.specialty,
        treatmentScope: data.specialty,
        nsReason: data.nsReason || null,
        nsJustification: data.nsJustification || null,
        documents: data.documents,
        consent: {
          version: CONSENT_VERSION,
          country: corridor?.country ?? "",
          safeguard: corridor?.safeguard ?? "",
          items: CONSENT_ITEM_DEFS.map((i) => ({
            id: i.id,
            label: i.label.replace("{country}", corridor?.country ?? ""),
            agreed: data.consentAgreed.includes(i.id),
          })),
        },
      });
      if (res.ok) {
        clear();
        router.push(`/${locale}/referring/intake/confirmation?ref=${encodeURIComponent(res.ref)}`);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <WizardShell
      locale={locale}
      step="review"
      lede="Check everything once. After you submit, the case gets a unique reference and consent is locked."
      footerNext={
        <Button
          onClick={submit}
          loading={pending}
          disabled={!ready || pending}
          className="flex-1 sm:flex-none"
        >
          Submit referral
          <ArrowRight aria-hidden className="size-4 rtl:-scale-x-100" />
        </Button>
      }
    >
      <div className="divide-y divide-line rounded-card border border-line px-4">
        <DetailPanelRow
          icon={UserRound}
          label="Patient"
          value={`${patientName}${data.dob ? ` · DOB ${data.dob}` : ""} · reference issued on submit`}
          trailing={edit("patient")}
        />
        <DetailPanelRow
          icon={Stethoscope}
          label="Referral"
          value={`${data.specialty || "No specialty chosen"} · ${data.urgency} · ${data.summary ? "summary recorded" : "no summary"}`}
          trailing={edit("clinical")}
        />
        <DetailPanelRow
          icon={Globe2}
          label="Destination"
          value={`${hospitalName} · ${corridor?.label ?? "—"} corridor`}
          trailing={edit("corridor")}
        />
        <DetailPanelRow
          icon={ShieldAlert}
          label="NHS non-substitution"
          value={
            data.nsReason
              ? `${NON_SUBSTITUTION_LABELS[data.nsReason as keyof typeof NON_SUBSTITUTION_LABELS] ?? data.nsReason} · justification recorded`
              : "Not yet declared"
          }
          trailing={edit("declaration")}
        />
        <DetailPanelRow
          icon={FileText}
          label="Documents"
          value={data.documents.length ? `${data.documents.length} attached` : "None attached"}
          trailing={edit("documents")}
        />
        <DetailPanelRow
          icon={ScrollText}
          label="Patient consent"
          value={`${agreedCount} of ${CONSENT_ITEM_DEFS.length} items confirmed · ${CONSENT_VERSION}`}
          trailing={edit("consent")}
        />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {corridor && <TransferBasisNotice corridor={corridor} />}
        <NoFeeNotice compact />
      </div>

      {!ready && (
        <p className="mt-4 flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Before submitting: choose a specialty, complete the NHS non-substitution
          declaration, and confirm all {CONSENT_ITEM_DEFS.length} consent items.
        </p>
      )}
      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}

      <p className="mt-4 text-[13px] text-ink-muted">
        On submit: records are stored in the corridor&rsquo;s region, the named
        specialist is notified, and every step — including this declaration and
        consent — is written to the immutable audit trail.
      </p>
    </WizardShell>
  );
}
