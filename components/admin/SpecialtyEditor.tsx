"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input, Select } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/Card";
import { NHS_AVAILABILITY_LABELS, type CorridorSpecialty } from "@/lib/corridors";

/**
 * Editable specialty list for a corridor. Each row emits a parallel
 * specialtyName / specialtyNhs pair so the server action can zip them back
 * together — no JSON blob in a hidden field.
 *
 * NHS availability is the eligibility gate (item 7): anything marked
 * "nhs-routine" is struck out in the intake wizard and cannot be referred.
 */
export default function SpecialtyEditor({
  initial = [],
}: {
  initial?: CorridorSpecialty[];
}) {
  const [rows, setRows] = useState<CorridorSpecialty[]>(
    initial.length ? initial : [{ name: "", nhs: "nhs-delayed" }],
  );

  const update = (i: number, patch: Partial<CorridorSpecialty>) =>
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));

  return (
    <div className="flex flex-col gap-2">
      <SectionLabel>Specialties &amp; NHS availability</SectionLabel>
      <p className="text-[13px] text-ink-muted">
        Specialties marked &ldquo;routinely available on the NHS&rdquo; are blocked
        from overseas referral in the intake wizard.
      </p>

      {rows.map((row, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_220px_auto]">
          <Input
            name="specialtyName"
            value={row.name}
            onChange={(e) => update(i, { name: e.target.value })}
            placeholder="e.g. Oncology"
            aria-label={`Specialty ${i + 1} name`}
          />
          <Select
            name="specialtyNhs"
            value={row.nhs}
            onChange={(e) => update(i, { nhs: e.target.value as CorridorSpecialty["nhs"] })}
            aria-label={`Specialty ${i + 1} NHS availability`}
          >
            {(Object.keys(NHS_AVAILABILITY_LABELS) as CorridorSpecialty["nhs"][]).map((k) => (
              <option key={k} value={k}>
                {NHS_AVAILABILITY_LABELS[k]}
              </option>
            ))}
          </Select>
          <button
            type="button"
            onClick={() => setRows((r) => r.filter((_, j) => j !== i))}
            aria-label={`Remove specialty ${i + 1}`}
            className="flex size-11 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-danger-bg hover:text-danger-text"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => setRows((r) => [...r, { name: "", nhs: "nhs-delayed" }])}
        className="mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        <Plus aria-hidden className="size-4" />
        Add specialty
      </button>
    </div>
  );
}
