"use client";

import { useState } from "react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import Toggle from "@/components/ui/Toggle";
import { Field, Input } from "@/components/ui/Field";
import { updateHospitalAction } from "@/lib/adminActions";

const TAXONOMY = [
  "Oncology",
  "Orthopedics",
  "Fertility",
  "Cardiology",
  "Neurosurgery",
  "Transplantation",
  "Reconstructive surgery",
  "Thoracic surgery",
  "Trauma",
];

/**
 * Editable partner-hospital form (identity + publish + specialties) wired to
 * updateHospitalAction. Publishing controls whether the hospital appears in the
 * public directory and the intake wizard. Accreditation/clinicians are shown
 * read-only below (managed separately).
 */
export default function HospitalEditForm({
  locale,
  hospitalId,
  name,
  city,
  country,
  corridorLabel,
  published,
  specialties,
}: {
  locale: string;
  hospitalId: string;
  name: string;
  city: string;
  country: string;
  corridorLabel: string;
  published: boolean;
  specialties: string[];
}) {
  // Normalise stored specialties to the taxonomy (match on first word).
  const initialSelected = TAXONOMY.filter((s) =>
    specialties.some((x) => s.startsWith(x.split(" ")[0])),
  );
  const [selected, setSelected] = useState<string[]>(initialSelected);

  function toggleSpec(s: string, on: boolean) {
    setSelected((prev) => (on ? [...new Set([...prev, s])] : prev.filter((x) => x !== s)));
  }

  return (
    <form action={updateHospitalAction} className="flex flex-col gap-5 pb-24">
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <input type="hidden" name="locale" value={locale} />
      {selected.map((s) => (
        <input key={s} type="hidden" name="specialties" value={s} />
      ))}

      <Card>
        <CardTitle>Identity &amp; corridor</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hospital name" htmlFor="h-name">
            <Input id="h-name" name="name" defaultValue={name} required />
          </Field>
          <Field label="City" htmlFor="h-city">
            <Input id="h-city" name="city" defaultValue={city} />
          </Field>
          <Field label="Country" htmlFor="h-country">
            <Input id="h-country" name="country" defaultValue={country} />
          </Field>
          <Field label="Corridor" htmlFor="h-corridor" hint="Set by the corridor registry.">
            <Input id="h-corridor" defaultValue={corridorLabel} disabled />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle>Specialties (controlled taxonomy)</CardTitle>
        <div className="flex flex-wrap gap-2">
          {TAXONOMY.map((s) => {
            const on = selected.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggleSpec(s, !on)}
                className={
                  on
                    ? "inline-flex h-[34px] items-center rounded-full border border-accent-border bg-accent-soft px-4 text-sm font-medium text-accent"
                    : "inline-flex h-[34px] items-center rounded-full border border-transparent bg-subtle px-4 text-sm text-ink hover:border-line-strong"
                }
              >
                {s}
              </button>
            );
          })}
        </div>
        {selected.length === 0 && (
          <p className="mt-2 text-[13px] text-ink-muted">No specialties selected.</p>
        )}
      </Card>

      <Card>
        <CardTitle>Visibility &amp; status</CardTitle>
        <div className="grid gap-4">
          <Toggle
            name="published"
            defaultChecked={published}
            label="Published — visible in the public directory & intake"
            description="When off, this hospital is hidden from patients and the intake wizard; open cases continue."
          />
          <div className="border-t border-line pt-3">
            <SectionLabel className="mb-1">Data-residency confirmation</SectionLabel>
            <p className="text-sm text-ink">
              Cases route to: <span className="font-medium">{corridorLabel}</span> region
            </p>
          </div>
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-[72px] z-10 flex items-center justify-between gap-3 rounded-card bg-card p-3 shadow-elevated md:bottom-4">
        <p className="text-[13px] text-ink-secondary">Edits are written to the audit log</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" href={`/${locale}/admin/hospitals`}>
            Discard
          </Button>
          <SubmitButton size="sm" pendingLabel="Saving…">
            Save hospital
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
