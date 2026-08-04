"use client";

import { useActionState, useState } from "react";
import { Globe2, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Toggle from "@/components/ui/Toggle";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import SpecialtyEditor from "@/components/admin/SpecialtyEditor";
import { createCorridorAction, type InviteState } from "@/lib/adminActions";

/**
 * Create a new corridor. A corridor is a legal object, not just a label: the
 * transfer basis and safeguard wording it carries are shown to the GP at intake
 * and to the patient at consent, so both are required up front.
 */
export default function CreateCorridorForm({
  locale,
  hospitals,
}: {
  locale: string;
  hospitals: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [basis, setBasis] = useState<"adequacy" | "scc">("scc");
  const [state, action, pending] = useActionState<InviteState, FormData>(createCorridorAction, {});

  if (!open) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Globe2 aria-hidden className="size-4" /> Add corridor
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardTitle
        action={
          <button onClick={() => setOpen(false)} aria-label="Cancel" className="text-ink-secondary hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        }
      >
        Add a corridor
      </CardTitle>

      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Destination country" htmlFor="nc-country">
            <Input id="nc-country" name="country" required placeholder="e.g. Spain" />
          </Field>
          <Field label="Label" htmlFor="nc-label" hint="Defaults to “UK → {country}”.">
            <Input id="nc-label" name="label" placeholder="UK → Spain" />
          </Field>
          <Field
            label="Data residency"
            htmlFor="nc-residency"
            hint="Where this corridor's patient records are hosted."
          >
            <Input id="nc-residency" name="residency" defaultValue="UK (London)" />
          </Field>
          <Field label="Primary hospital" htmlFor="nc-hospital" hint="Optional — can be set later.">
            <Select id="nc-hospital" name="primaryHospitalId" defaultValue="">
              <option value="">None yet</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Transfer basis"
          htmlFor="nc-basis"
          hint="Adequacy = no extra contract needed. SCC/IDTA = Standard Contractual Clauses required."
        >
          <Select
            id="nc-basis"
            name="transferBasis"
            value={basis}
            onChange={(e) => setBasis(e.target.value as "adequacy" | "scc")}
          >
            <option value="adequacy">UK adequacy — no additional transfer contract</option>
            <option value="scc">SCC / IDTA required — no adequacy finding</option>
          </Select>
        </Field>

        {basis === "scc" && (
          <div className="grid gap-4 rounded-inner border border-warning-text/25 bg-warning-bg/40 p-3.5 sm:grid-cols-2">
            <Field label="Notifying authority" htmlFor="nc-auth" hint="Optional — e.g. KVKK (Turkey).">
              <Input id="nc-auth" name="notificationAuthority" placeholder="KVKK (Turkey)" />
            </Field>
            <Field label="Notify within (business days)" htmlFor="nc-days">
              <Input id="nc-days" name="notificationDays" inputMode="numeric" placeholder="5" />
            </Field>
          </div>
        )}

        <Field
          label="Safeguard wording"
          htmlFor="nc-safeguard"
          hint="Shown verbatim to the GP at intake and to the patient at consent. Use your legal team's text."
        >
          <Textarea
            id="nc-safeguard"
            name="safeguard"
            rows={4}
            required
            placeholder="e.g. Spain is in the EEA and covered by UK adequacy; no additional transfer contract is required."
          />
        </Field>

        <div className="border-t border-line pt-2">
          <SpecialtyEditor />
        </div>

        <div className="border-t border-line pt-2">
          <Toggle
            name="published"
            defaultChecked
            label="Published — show on the public site"
            description="You can create it hidden and publish once the partner hospital is live."
          />
        </div>

        {state.error && (
          <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
            Corridor created.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">
            Residency and eligibility rules take effect immediately across intake.
          </p>
          <Button type="submit" size="sm" loading={pending}>
            Create corridor
          </Button>
        </div>
      </form>
    </Card>
  );
}
