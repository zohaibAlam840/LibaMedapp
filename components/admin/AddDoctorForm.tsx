"use client";

import { useActionState, useState } from "react";
import { Plus, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { addDoctorAction, type InviteState } from "@/lib/adminActions";

/**
 * Add a named clinician. Admins create them already approved; a hospital
 * coordinator submits for review (the hospital picker is hidden — they can only
 * add to their own hospital, enforced server-side).
 */
export default function AddDoctorForm({
  locale,
  hospitals,
  canChooseHospital,
}: {
  locale: string;
  hospitals: { id: string; name: string }[];
  canChooseHospital: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState<InviteState, FormData>(addDoctorAction, {});

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" /> Add clinician
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
        Add a named clinician
      </CardTitle>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="d-name">
            <Input id="d-name" name="name" required placeholder="Dr. Noa Peretz" />
          </Field>
          <Field label="Specialty / title" htmlFor="d-role">
            <Input id="d-role" name="role" placeholder="Consultant oncologist" />
          </Field>
          {canChooseHospital && (
            <Field label="Hospital" htmlFor="d-hospital">
              <Select id="d-hospital" name="hospitalId" defaultValue="">
                <option value="">Select hospital…</option>
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}
        </div>
        <Field label="Short bio" htmlFor="d-bio" hint="Shown on the public hospital page when approved.">
          <Textarea id="d-bio" name="bio" rows={3} />
        </Field>

        {state.error && (
          <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </p>
        )}
        {state.ok && (
          <p className="rounded-inner bg-success-bg px-3.5 py-2.5 text-[13px] text-success-text">
            Clinician added.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">
            {canChooseHospital
              ? "Added as approved — feature them to show on the home page."
              : "Submitted for admin review before appearing publicly."}
          </p>
          <Button type="submit" size="sm" loading={pending}>
            Add clinician
          </Button>
        </div>
      </form>
    </Card>
  );
}
