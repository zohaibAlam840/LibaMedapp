"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Toggle from "@/components/ui/Toggle";
import { Field, Input, Textarea } from "@/components/ui/Field";

export const TAXONOMY = [
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

export interface HospitalValues {
  name: string;
  city: string;
  country: string;
  intro: string;
  languages: string[];
  published: boolean;
  specialties: string[];
  accreditation: { name: string; expires: string }[];
  clinicians: { name: string; role: string }[];
}

/**
 * The editable body of a partner-hospital record, shared by the create and edit
 * forms so the two can never drift apart.
 *
 * Accreditation and named clinicians are real inputs here. They used to be
 * printed read-only under a page that promised they were "editable here, no
 * developer needed" — the copy was right about the intent and wrong about the
 * software.
 *
 * Repeated rows post as parallel `accreditationName[] / accreditationExpires[]`
 * fields, which the server action zips back into objects.
 */
export default function HospitalFields({
  values,
  corridorLabel,
  corridors,
}: {
  values: HospitalValues;
  /** Shown read-only on edit (the corridor registry owns it). */
  corridorLabel?: string;
  /** Offered as a choice on create. */
  corridors?: { id: string; label: string }[];
}) {
  const [selected, setSelected] = useState<string[]>(values.specialties);
  const [accreditation, setAccreditation] = useState(
    values.accreditation.length > 0 ? values.accreditation : [{ name: "", expires: "" }],
  );
  const [clinicians, setClinicians] = useState(
    values.clinicians.length > 0 ? values.clinicians : [{ name: "", role: "" }],
  );

  return (
    <>
      <Card>
        <CardTitle>Identity &amp; corridor</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hospital name" htmlFor="h-name">
            <Input id="h-name" name="name" defaultValue={values.name} required />
          </Field>
          <Field label="City" htmlFor="h-city">
            <Input id="h-city" name="city" defaultValue={values.city} />
          </Field>
          <Field label="Country" htmlFor="h-country">
            <Input id="h-country" name="country" defaultValue={values.country} />
          </Field>
          {corridors ? (
            <Field label="Corridor" htmlFor="h-corridor" hint="Which corridor this partner receives on.">
              <select
                id="h-corridor"
                name="corridorId"
                defaultValue=""
                className="h-11 w-full rounded-inner border border-line bg-card px-4 text-[15px] text-ink focus:border-accent focus:outline-none"
              >
                <option value="">Not assigned yet</option>
                {corridors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Corridor" htmlFor="h-corridor-ro" hint="Set by the corridor registry.">
              <Input id="h-corridor-ro" defaultValue={corridorLabel ?? ""} disabled />
            </Field>
          )}
        </div>
        <div className="mt-4 grid gap-4">
          <Field
            label="Introduction"
            htmlFor="h-intro"
            hint="One paragraph, shown on the public profile."
          >
            <Textarea id="h-intro" name="intro" rows={3} defaultValue={values.intro} />
          </Field>
          <Field
            label="Languages"
            htmlFor="h-languages"
            hint="Comma separated, e.g. English, Hebrew, Arabic."
          >
            <Input id="h-languages" name="languages" defaultValue={values.languages.join(", ")} />
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle>Specialties (controlled taxonomy)</CardTitle>
        {selected.map((s) => (
          <input key={s} type="hidden" name="specialties" value={s} />
        ))}
        <div className="flex flex-wrap gap-2">
          {TAXONOMY.map((s) => {
            const on = selected.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setSelected((prev) => (on ? prev.filter((x) => x !== s) : [...prev, s]))
                }
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
        <CardTitle>Accreditation</CardTitle>
        <div className="flex flex-col gap-3">
          {accreditation.map((a, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <Field label={i === 0 ? "Body" : ""} htmlFor={`acc-name-${i}`}>
                  <Input
                    id={`acc-name-${i}`}
                    name="accreditationName"
                    defaultValue={a.name}
                    placeholder="JCI"
                  />
                </Field>
              </div>
              <div className="min-w-40 flex-1">
                <Field label={i === 0 ? "Valid to" : ""} htmlFor={`acc-exp-${i}`}>
                  <Input
                    id={`acc-exp-${i}`}
                    name="accreditationExpires"
                    defaultValue={a.expires}
                    placeholder="Mar 2027"
                  />
                </Field>
              </div>
              <button
                type="button"
                aria-label="Remove accreditation"
                onClick={() => setAccreditation((prev) => prev.filter((_, x) => x !== i))}
                className="mb-1 flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-subtle hover:text-ink"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setAccreditation((prev) => [...prev, { name: "", expires: "" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          <Plus aria-hidden className="size-4" /> Add accreditation
        </button>
        <p className="mt-2 text-[13px] text-ink-muted">
          The expiry drives the accreditation watch, so write it as a month and
          year — &ldquo;Mar 2027&rdquo;.
        </p>
      </Card>

      <Card>
        <CardTitle>Named receiving clinicians</CardTitle>
        <div className="flex flex-col gap-3">
          {clinicians.map((c, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <div className="min-w-48 flex-1">
                <Field label={i === 0 ? "Name" : ""} htmlFor={`cli-name-${i}`}>
                  <Input
                    id={`cli-name-${i}`}
                    name="clinicianName"
                    defaultValue={c.name}
                    placeholder="Dr. Noa Peretz"
                  />
                </Field>
              </div>
              <div className="min-w-48 flex-1">
                <Field label={i === 0 ? "Role" : ""} htmlFor={`cli-role-${i}`}>
                  <Input
                    id={`cli-role-${i}`}
                    name="clinicianRole"
                    defaultValue={c.role}
                    placeholder="Consultant haematologist"
                  />
                </Field>
              </div>
              <button
                type="button"
                aria-label="Remove clinician"
                onClick={() => setClinicians((prev) => prev.filter((_, x) => x !== i))}
                className="mb-1 flex size-11 items-center justify-center rounded-full text-ink-muted hover:bg-subtle hover:text-ink"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setClinicians((prev) => [...prev, { name: "", role: "" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          <Plus aria-hidden className="size-4" /> Add clinician
        </button>
      </Card>

      <Card>
        <CardTitle>Visibility</CardTitle>
        <Toggle
          name="published"
          defaultChecked={values.published}
          label="Published — visible in the public directory &amp; intake"
          description="When off, this hospital is hidden from the public site and the intake wizard; open cases continue."
        />
      </Card>
    </>
  );
}
