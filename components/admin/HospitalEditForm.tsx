"use client";

import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import HospitalFields, { type HospitalValues } from "@/components/admin/HospitalFields";
import { deleteHospitalAction, updateHospitalAction } from "@/lib/adminActions";

/**
 * Editable partner-hospital record, wired to updateHospitalAction. Publishing
 * controls whether the hospital appears in the public directory and the intake
 * wizard; the action revalidates both, so a save here shows there.
 */
export default function HospitalEditForm({
  locale,
  hospitalId,
  corridorLabel,
  values,
}: {
  locale: string;
  hospitalId: string;
  corridorLabel: string;
  values: HospitalValues;
}) {
  return (
    <form action={updateHospitalAction} className="flex flex-col gap-5 pb-24">
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <input type="hidden" name="locale" value={locale} />

      <HospitalFields values={values} corridorLabel={corridorLabel} />

      {/* Sticky save bar */}
      <div className="sticky bottom-[72px] z-10 flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-3 shadow-elevated md:bottom-4">
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

/**
 * Delete, in its own form so it is never submitted by the save button. Refused
 * server-side while any case still references the hospital — the record of
 * where a patient was sent outranks tidying the directory.
 */
export function HospitalDeleteForm({
  locale,
  hospitalId,
}: {
  locale: string;
  hospitalId: string;
}) {
  return (
    <form action={deleteHospitalAction} className="flex flex-wrap items-center justify-between gap-3">
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <input type="hidden" name="locale" value={locale} />
      <p className="text-[13px] text-ink-secondary">
        Deleting is refused while any case references this hospital. Unpublish it
        instead to take it off the public site.
      </p>
      <SubmitButton variant="danger" size="sm" pendingLabel="Deleting…">
        Delete hospital
      </SubmitButton>
    </form>
  );
}
