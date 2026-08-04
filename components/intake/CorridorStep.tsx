"use client";

import { useMemo } from "react";
import { Check, Globe2, Lock } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Chip from "@/components/ui/Chip";
import TransferBasisNotice from "@/components/ui/TransferBasisNotice";
import { SectionLabel } from "@/components/ui/Card";
import { isReferable, NHS_AVAILABILITY_LABELS, type CorridorId } from "@/lib/corridors";
import type { CorridorRecord } from "@/lib/db/corridors";
import { useIntake } from "@/lib/intakeStore";
import { cn } from "@/lib/cn";

/**
 * Intake step — destination & specialty, with platform-enforced eligibility
 * gating (NHS-safeguard item 7) and the data-transfer basis callout (item 5).
 * Specialties routinely available on the NHS are disabled here, so the platform
 * — not the GP's judgement each time — holds the line.
 */
export default function CorridorStep({
  locale,
  hospitalNames,
  corridors,
}: {
  locale: string;
  /** hospitalId → current name, passed from the server so admin edits show here. */
  hospitalNames: Record<string, string>;
  /** Referable corridors, loaded from the DB so admin-created ones appear. */
  corridors: CorridorRecord[];
}) {
  const { data, set } = useIntake();
  const corridor = corridors.find((c) => c.id === data.corridorId) ?? corridors[0];
  const corridorId = corridor?.id ?? "";
  const specialty = data.specialty || corridor?.specialties.find(isReferable)?.name || "";

  function pickCorridor(id: CorridorId) {
    const next = corridors.find((c) => c.id === id)?.specialties.find(isReferable)?.name ?? "";
    set({ corridorId: id, specialty: next });
  }
  const setSpecialty = (name: string) => set({ specialty: name });

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
          {corridor?.label}
        </Chip>
      </>
    ),
    [specialty, corridor?.label],
  );

  // No published corridor has a referable specialty yet — an admin must
  // configure one before any referral can be created.
  if (!corridor) {
    return (
      <WizardShell
        locale={locale}
        step="corridor"
        lede="No destinations are available yet."
      >
        <p className="rounded-inner bg-warning-bg px-3.5 py-3 text-[13px] text-warning-text">
          No corridors are currently open for referral. An administrator needs to
          publish a corridor and add at least one specialty that isn&rsquo;t
          routinely available on the NHS.
        </p>
      </WizardShell>
    );
  }

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
            {corridors.map((c) => {
              const hospitalName = hospitalNames[c.primaryHospitalId ?? ""] ?? c.label;
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
                    <span className="block text-[15px] font-medium text-ink">{hospitalName}</span>
                    <span className="block text-[13px] text-ink-secondary">
                      {c.country} · {c.label}
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
