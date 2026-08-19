"use client";

import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import HospitalFields from "@/components/admin/HospitalFields";
import { createHospitalAction } from "@/lib/adminActions";

/**
 * New partner hospital. Shares HospitalFields with the edit form, so anything
 * editable later is settable now. On success the action redirects to the edit
 * page for the record it just created.
 */
export default function HospitalCreateForm({
  locale,
  corridors,
}: {
  locale: string;
  corridors: { id: string; label: string }[];
}) {
  return (
    <form action={createHospitalAction} className="flex flex-col gap-5 pb-24">
      <input type="hidden" name="locale" value={locale} />

      <HospitalFields
        corridors={corridors}
        values={{
          name: "",
          city: "",
          country: "",
          intro: "",
          languages: [],
          published: false,
          specialties: [],
          accreditation: [],
          clinicians: [],
        }}
      />

      <div className="sticky bottom-[72px] z-10 flex flex-wrap items-center justify-between gap-3 rounded-card bg-card p-3 shadow-elevated md:bottom-4">
        <p className="text-[13px] text-ink-secondary">Creation is written to the audit log</p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" href={`/${locale}/admin/hospitals`}>
            Cancel
          </Button>
          <SubmitButton size="sm" pendingLabel="Creating…">
            Create hospital
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
