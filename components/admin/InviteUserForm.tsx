"use client";

import { useActionState, useState } from "react";
import { Check, Copy, Plus, ShieldCheck, TriangleAlert, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { inviteUserAction, type InviteState } from "@/lib/adminActions";

const ROLES = [
  { value: "receiving", label: "Receiving clinician" },
  { value: "coordinator", label: "Hospital coordinator" },
  { value: "caseManager", label: "Case manager" },
  { value: "admin", label: "Compliance / admin" },
  { value: "referring", label: "Referring clinician" },
  { value: "introducer", label: "Introducer" },
  { value: "patient", label: "Patient (read-only)" },
];

const NEEDS_HOSPITAL = new Set(["receiving", "coordinator"]);

export default function InviteUserForm({
  locale,
  hospitals,
}: {
  locale: string;
  hospitals: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("receiving");
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState<InviteState, FormData>(inviteUserAction, {});

  if (!open && !state.ok) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden className="size-4" /> Invite user
      </Button>
    );
  }

  // Success panel — shows the one-time temporary password.
  if (state.ok && state.tempPassword) {
    return (
      <Card className="w-full border border-success-bg">
        <CardTitle
          className="flex items-center gap-2"
          action={
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-ink-secondary hover:text-ink"
            >
              <X aria-hidden className="size-4" />
            </button>
          }
        >
          <ShieldCheck aria-hidden className="size-5 text-success-text" /> Account created
        </CardTitle>
        <p className="text-sm text-ink-secondary">
          Share these credentials with <b className="text-ink">{state.email}</b> over a
          secure channel. The temporary password is shown once — they should change it
          and enrol MFA on first sign-in.
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-inner bg-subtle px-3.5 py-2.5">
          <code className="flex-1 truncate font-mono text-sm text-ink">{state.tempPassword}</code>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(state.tempPassword!);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
          >
            {copied ? <Check aria-hidden className="size-3.5" /> : <Copy aria-hidden className="size-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </Card>
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
        Invite a user
      </CardTitle>
      <form action={action} className="flex flex-col gap-4">
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" htmlFor="iu-name">
            <Input id="iu-name" name="name" required placeholder="Dr. Noa Peretz" />
          </Field>
          <Field label="Work email" htmlFor="iu-email">
            <Input id="iu-email" name="email" type="email" required placeholder="name@hospital.org" />
          </Field>
          <Field label="Role" htmlFor="iu-role">
            <Select id="iu-role" name="role" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Organisation" htmlFor="iu-org" hint="Optional">
            <Input id="iu-org" name="org" placeholder="e.g. Sheba Medical Center" />
          </Field>
          {NEEDS_HOSPITAL.has(role) && (
            <Field label="Hospital" htmlFor="iu-hospital">
              <Select id="iu-hospital" name="hospitalId" defaultValue="">
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

        {state.error && (
          <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
            <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
            {state.error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-ink-muted">A one-time password is generated and shown once.</p>
          <Button type="submit" size="sm" loading={pending}>
            Create account
          </Button>
        </div>
      </form>
    </Card>
  );
}
