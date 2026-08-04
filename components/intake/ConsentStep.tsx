"use client";

import { UserRound } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import type { CorridorRecord } from "@/lib/db/corridors";
import { CONSENT_ITEM_DEFS, CONSENT_VERSION } from "@/lib/intake";
import { useIntake } from "@/lib/intakeStore";

// Intake step 6 — SEPARATE, itemised patient consent (NHS-safeguard item 6),
// bound to the draft store. Country + safeguard are read from the chosen
// corridor so the wording stays accurate.
export default function ConsentStep({
  locale,
  hospitalNames,
  corridors,
}: {
  locale: string;
  hospitalNames: Record<string, string>;
  corridors: CorridorRecord[];
}) {
  const { data, set } = useIntake();
  const corridor = corridors.find((c) => c.id === data.corridorId) ?? corridors[0];
  const hospitalName =
    hospitalNames[corridor?.primaryHospitalId ?? ""] ?? "the receiving hospital";

  const bodyFor: Record<string, string> = {
    share: `${hospitalName} and the named specialist's direct clinical team only.`,
    safeguard: corridor.safeguard,
    categories: "Referral letter, laboratory results, and imaging (including DICOM).",
    purpose: "Review, treatment planning, and continuity of care for this case only.",
    withdraw: "Withdrawal stops further processing and is logged immutably.",
  };

  function toggle(id: string, on: boolean) {
    const next = on
      ? [...new Set([...data.consentAgreed, id])]
      : data.consentAgreed.filter((x) => x !== id);
    set({ consentAgreed: next });
  }

  return (
    <WizardShell
      locale={locale}
      step="consent"
      lede="This is the patient's own consent — captured separately from your referral. Confirm each item with them; each line is recorded with its exact wording and time."
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2.5 rounded-inner border border-accent-border bg-accent-soft/60 p-3.5 text-[13px] text-ink">
          <UserRound aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            The patient must understand that their records will leave the UK for{" "}
            <b className="font-medium">{corridor.country}</b>, and the safeguard that
            protects that transfer.
          </span>
        </div>

        <TransferBasisNotice corridor={corridor} />

        <ul className="flex flex-col gap-3">
          {CONSENT_ITEM_DEFS.map((item) => {
            const label = item.label.replace("{country}", corridor.country);
            const checked = data.consentAgreed.includes(item.id);
            return (
              <li key={item.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-card border border-line bg-card p-4 transition-colors hover:border-line-strong has-[:checked]:border-accent-border has-[:checked]:bg-accent-soft/50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggle(item.id, e.target.checked)}
                    className="mt-0.5 size-5 shrink-0 rounded"
                  />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-ink">{label}</span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-ink-secondary">
                      {bodyFor[item.id]}
                    </span>
                    <span className="mt-1.5 block text-xs text-ink-muted">
                      Consent {CONSENT_VERSION} · shown now
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <p className="text-[13px] text-ink-muted">
          By continuing you confirm the patient has given informed consent to each
          item above. The consent record is timestamped and cannot be edited after
          submission.
        </p>
      </div>
    </WizardShell>
  );
}
