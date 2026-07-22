"use client";

import { useMemo, useState } from "react";
import { Check, Globe2, Lock } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Chip from "@/components/ui/Chip";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import { SectionLabel } from "@/components/ui/Card";
import {
  CORRIDOR_LIST,
  getCorridor,
  isReferable,
  NHS_AVAILABILITY_LABELS,
  type CorridorId,
} from "@/lib/corridors";
import { getDemoHospital } from "@/lib/demo";
import { cn } from "@/lib/cn";

/**
 * Intake step — destination & specialty, with platform-enforced eligibility
 * gating (NHS-safeguard item 7) and the data-transfer basis callout (item 5).
 * Specialties routinely available on the NHS are disabled here, so the platform
 * — not the GP's judgement each time — holds the line.
 */
export default function CorridorStep({ locale }: { locale: string }) {
  const [corridorId, setCorridorId] = useState<CorridorId>("israel");
  const corridor = getCorridor(corridorId);
  const firstReferable = corridor.specialties.find(isReferable)?.name ?? "";
  const [specialty, setSpecialty] = useState(firstReferable);

  function pickCorridor(id: CorridorId) {
    setCorridorId(id);
    const next = getCorridor(id).specialties.find(isReferable)?.name ?? "";
    setSpecialty(next);
  }

  const summary = useMemo(
    () => (
      <>
        <span className="text-[13px] text-ink-secondary">So far:</span>
        {specialty && (
          <Chip selected size="sm">
            {specialty}
          </Chip>
        )}
        <Chip selected size="sm">
          {corridor.label}
        </Chip>
      </>
    ),
    [specialty, corridor.label],
  );

  return (
    <WizardShell
      locale={locale}
      step="corridor"
      lede="Pick a destination, then a specialty. Records are routed to a named specialist — never a general inbox."
      summary={summary}
    >
      <div className="flex flex-col gap-6">
        {/* Destination */}
        <div>
          <SectionLabel className="mb-2">Destination hospital</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {CORRIDOR_LIST.map((c) => {
              const hospital = getDemoHospital(c.hospitalId);
              const selected = c.id === corridorId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickCorridor(c.id)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-start gap-3 rounded-card border p-3.5 text-start transition-colors",
                    selected
                      ? "border-accent-border bg-accent-soft"
                      : "border-line bg-card hover:border-line-strong",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-accent bg-accent text-white" : "border-line-strong",
                    )}
                  >
                    {selected && <Check aria-hidden className="size-3.5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-ink">{hospital.name}</span>
                    <span className="block text-[13px] text-ink-secondary">
                      {hospital.city}, {c.country} · {c.label}
                    </span>
                    <span
                      className={cn(
                        "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                        c.transferBasis === "scc"
                          ? "bg-warning-bg text-warning-text"
                          : "bg-success-bg text-success-text",
                      )}
                    >
                      {c.transferBasis === "scc" ? "SCC required" : "UK adequacy"}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Specialty — gated by NHS availability */}
        <div>
          <SectionLabel className="mb-1">Specialty</SectionLabel>
          <p className="mb-2.5 text-[13px] text-ink-muted">
            Only specialties not routinely available on the NHS can be referred abroad.
          </p>
          <div className="flex flex-wrap gap-2">
            {corridor.specialties.map((s) => {
              const referable = isReferable(s);
              const active = s.name === specialty;
              if (!referable) {
                return (
                  <span
                    key={s.name}
                    title={NHS_AVAILABILITY_LABELS[s.nhs]}
                    className="inline-flex h-[34px] cursor-not-allowed items-center gap-1.5 rounded-full border border-transparent bg-transparent px-4 text-sm text-ink-muted line-through decoration-ink-muted/40"
                  >
                    <Lock aria-hidden className="size-3.5" />
                    {s.name}
                  </span>
                );
              }
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => setSpecialty(s.name)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-[34px] items-center rounded-full border px-4 text-sm transition-colors",
                    active
                      ? "border-accent-border bg-accent-soft font-medium text-accent"
                      : "border-transparent bg-subtle text-ink hover:border-line-strong",
                  )}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
          {corridor.specialties.some((s) => !isReferable(s)) && (
            <p className="mt-2 text-[12px] text-ink-muted">
              Struck-through specialties are routinely available on the NHS and are
              blocked for overseas referral.
            </p>
          )}
        </div>

        {/* Data-transfer basis (item 5) */}
        <TransferBasisNotice corridor={corridor} />

        {/* Residency */}
        <p className="flex items-start gap-2.5 rounded-inner bg-subtle p-3.5 text-[13px] text-ink-secondary">
          <Globe2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          Records for this corridor are stored in <b className="font-medium text-ink">{corridor.residency}</b>.
          The residency rule is applied automatically from the destination.
        </p>
      </div>
    </WizardShell>
  );
}
