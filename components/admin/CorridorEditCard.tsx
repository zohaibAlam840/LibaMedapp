"use client";

import { useState } from "react";
import { Globe2, Lock, Pencil, Trash2, X } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import Toggle from "@/components/ui/Toggle";
import Chip from "@/components/ui/Chip";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { CorridorBadge } from "@/components/ui/Badges";
import SpecialtyEditor from "@/components/admin/SpecialtyEditor";
import {
  deleteCorridorAction,
  updateCorridorAction,
  updateCorridorSpecialtiesAction,
} from "@/lib/adminActions";
import { isReferable } from "@/lib/corridors";
import type { CorridorRecord } from "@/lib/db/corridors";

/**
 * One corridor: read-only summary that flips into an edit form. Publishing a
 * corridor is what makes it appear on the public site, so the toggle lives
 * right next to the wording it controls.
 */
export default function CorridorEditCard({
  corridor,
  code,
  locale,
  canEdit,
}: {
  corridor: CorridorRecord;
  code: string;
  locale: string;
  canEdit: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <Card>
        <CardTitle
          action={
            canEdit ? (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil aria-hidden className="size-4" /> Edit
              </Button>
            ) : undefined
          }
        >
          <span className="flex items-center gap-2">
            <CorridorBadge code={code} label={corridor.label} />
            {!corridor.published && (
              <span className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-secondary">
                Hidden
              </span>
            )}
          </span>
        </CardTitle>
        <div className="divide-y divide-line">
          <DetailPanelRow icon={Globe2} label="Data residency" value={corridor.residency} />
          <DetailPanelRow
            icon={Globe2}
            label="Transfer basis"
            value={corridor.transferBasis === "scc" ? "SCC / IDTA" : "UK adequacy"}
          />
          {corridor.notification && (
            <DetailPanelRow
              icon={Globe2}
              label="Regulatory notification"
              value={
                <span className="text-warning-text">
                  {corridor.notification.authority} · within{" "}
                  {corridor.notification.withinBusinessDays} business days
                </span>
              }
            />
          )}
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary">{corridor.safeguard}</p>

        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-2 text-[13px] font-medium text-ink-secondary">
            Specialties · {corridor.specialties.filter(isReferable).length} referable
          </p>
          {corridor.specialties.length === 0 ? (
            <p className="text-[13px] text-ink-muted">
              None configured — this corridor can&rsquo;t be referred into yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {corridor.specialties.map((s) => (
                <Chip
                  key={s.name}
                  size="sm"
                  className={isReferable(s) ? undefined : "text-ink-muted line-through"}
                >
                  {!isReferable(s) && <Lock aria-hidden className="size-3" />}
                  {s.name}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardTitle
        action={
          <button onClick={() => setEditing(false)} aria-label="Cancel" className="text-ink-secondary hover:text-ink">
            <X aria-hidden className="size-4" />
          </button>
        }
      >
        Edit {corridor.label}
      </CardTitle>
      <form action={updateCorridorAction} className="flex flex-col gap-4">
        <input type="hidden" name="corridorId" value={corridor.id} />
        <input type="hidden" name="locale" value={locale} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Label" htmlFor={`c-label-${corridor.id}`}>
            <Input id={`c-label-${corridor.id}`} name="label" defaultValue={corridor.label} required />
          </Field>
          <Field label="Country" htmlFor={`c-country-${corridor.id}`}>
            <Input id={`c-country-${corridor.id}`} name="country" defaultValue={corridor.country} />
          </Field>
        </div>
        <Field label="Data residency" htmlFor={`c-res-${corridor.id}`}>
          <Input id={`c-res-${corridor.id}`} name="residency" defaultValue={corridor.residency} />
        </Field>
        <Field
          label="Safeguard wording"
          htmlFor={`c-safe-${corridor.id}`}
          hint="Shown to the GP at intake and to the patient at consent."
        >
          <Textarea id={`c-safe-${corridor.id}`} name="safeguard" rows={4} defaultValue={corridor.safeguard} />
        </Field>
        <div className="border-t border-line pt-2">
          <Toggle
            name="published"
            defaultChecked={corridor.published}
            label="Published — show on the public site"
            description="When off, this corridor is hidden from the marketing pages."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
          <SubmitButton size="sm" pendingLabel="Saving…">
            Save corridor
          </SubmitButton>
        </div>
      </form>

      {/* Specialties save separately — they're a list, not a field. */}
      <form
        action={updateCorridorSpecialtiesAction}
        className="mt-5 flex flex-col gap-3 border-t border-line pt-4"
      >
        <input type="hidden" name="corridorId" value={corridor.id} />
        <input type="hidden" name="locale" value={locale} />
        <SpecialtyEditor initial={corridor.specialties} />
        <div className="flex justify-end">
          <SubmitButton variant="secondary" size="sm" pendingLabel="Saving…">
            Save specialties
          </SubmitButton>
        </div>
      </form>

      {/* Delete — refused server-side while referrals still use the corridor. */}
      <form
        action={deleteCorridorAction}
        className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4"
      >
        <input type="hidden" name="corridorId" value={corridor.id} />
        <input type="hidden" name="locale" value={locale} />
        <p className="text-[13px] text-ink-muted">
          Deleting is blocked while any referral still uses this corridor — hide it instead.
        </p>
        <SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">
          <Trash2 aria-hidden className="size-4" />
          Delete
        </SubmitButton>
      </form>
    </Card>
  );
}
