import { Plus, Trash2 } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import Toggle from "@/components/ui/Toggle";
import { Field, Input, Select } from "@/components/ui/Field";
import { getDemoHospital } from "@/lib/demo";

// 9E · Partner hospital add/edit (#53): sectioned form, shared shell for both.
// Sticky save bar. Design-only — no persistence yet.
const TAXONOMY = ["Oncology", "Orthopedics", "Fertility", "Cardiology", "Neurosurgery", "Transplantation", "Reconstructive surgery", "Thoracic surgery", "Trauma"];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; hospitalId: string }>;
}) {
  const { locale, hospitalId } = await params;
  const h = getDemoHospital(hospitalId);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-24">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Partner hospitals</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Edit — {h.name}</h1>
      </div>

      <Card>
        <CardTitle>Identity &amp; corridor</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Hospital name" htmlFor="h-name">
            <Input id="h-name" defaultValue={h.name} />
          </Field>
          <Field label="City" htmlFor="h-city">
            <Input id="h-city" defaultValue={h.city} />
          </Field>
          <Field label="Country" htmlFor="h-country">
            <Input id="h-country" defaultValue={h.country} />
          </Field>
          <Field label="Corridor" htmlFor="h-corridor">
            <Select id="h-corridor" defaultValue={h.corridorLabel}>
              <option>UK → Israel</option>
              <option>UK → France</option>
              <option>UK → Turkey</option>
              <option>UK → Switzerland</option>
            </Select>
          </Field>
        </div>
      </Card>

      <Card>
        <CardTitle
          action={
            <Button variant="ghost" size="sm">
              <Plus aria-hidden className="size-4" /> Add accreditation
            </Button>
          }
        >
          Accreditation
        </CardTitle>
        <div className="flex flex-col gap-3">
          {h.accreditation.map((a) => (
            <div
              key={a.name}
              className="grid gap-3 rounded-inner border border-line p-3.5 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Field label="Body" htmlFor={`acc-${a.name}`}>
                <Input id={`acc-${a.name}`} defaultValue={a.name} />
              </Field>
              <Field label="Valid to" htmlFor={`acc-exp-${a.name}`}>
                <Input id={`acc-exp-${a.name}`} defaultValue={a.expires} />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="self-end text-danger-text"
                aria-label={`Remove ${a.name}`}
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Specialties (controlled taxonomy)</CardTitle>
        <div className="flex flex-wrap gap-2">
          {TAXONOMY.map((s) => (
            <Chip
              key={s}
              name="h-specialties"
              value={s}
              multiple
              defaultSelected={h.specialties.some((x) => s.startsWith(x.split(" ")[0]))}
            >
              {s}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle
          action={
            <Button variant="ghost" size="sm">
              <Plus aria-hidden className="size-4" /> Add clinician
            </Button>
          }
        >
          Named receiving clinicians
        </CardTitle>
        <div className="flex flex-col gap-3">
          {h.clinicians.map((c) => (
            <div
              key={c.name}
              className="grid gap-3 rounded-inner border border-line p-3.5 sm:grid-cols-[1fr_1fr_auto]"
            >
              <Field label="Name" htmlFor={`cl-${c.name}`}>
                <Input id={`cl-${c.name}`} defaultValue={c.name} />
              </Field>
              <Field label="Role / specialty" htmlFor={`cl-role-${c.name}`}>
                <Input id={`cl-role-${c.name}`} defaultValue={c.role} />
              </Field>
              <Button
                variant="ghost"
                size="sm"
                className="self-end text-danger-text"
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Status</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contract / LOI status" htmlFor="h-contract">
            <Select id="h-contract" defaultValue="contract">
              <option value="loi">LOI — in discussion</option>
              <option value="contract">Contracted</option>
              <option value="paused">Paused</option>
            </Select>
          </Field>
          <div className="self-end">
            <SectionLabel className="mb-1">Data-residency confirmation</SectionLabel>
            <p className="text-sm text-ink">
              Cases route to: <span className="font-medium">{h.corridorLabel}</span> region
            </p>
          </div>
        </div>
        <div className="mt-4 border-t border-line pt-2">
          <Toggle
            label="Active — accepts new referrals"
            description="Pausing hides the hospital from the intake wizard; open cases continue"
            defaultChecked
          />
        </div>
      </Card>

      {/* Sticky save bar */}
      <div className="sticky bottom-[72px] z-10 flex items-center justify-between gap-3 rounded-card bg-card p-3 shadow-elevated md:bottom-4">
        <p className="text-[13px] text-ink-secondary">
          Unsaved changes · edits are written to the audit log
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" href={`/${locale}/admin/hospitals`}>
            Discard
          </Button>
          <Button size="sm">Save hospital</Button>
        </div>
      </div>
    </div>
  );
}
