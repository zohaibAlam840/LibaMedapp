import { Check, Star, StarOff, Trash2, X } from "lucide-react";
import IconSubmit from "@/components/ui/IconSubmit";
import { updateDoctorAction } from "@/lib/adminActions";
import type { Doctor } from "@/lib/db/doctors";

// Per-row admin controls for a named clinician: approve/reject, feature on the
// public home page, or remove. Each is its own server-action form so the whole
// row works without client JS.
function Op({
  id,
  op,
  locale,
  label,
  danger,
  children,
}: {
  id: string;
  op: string;
  locale: string;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <form action={updateDoctorAction} className="inline">
      <input type="hidden" name="doctorId" value={id} />
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="locale" value={locale} />
      <IconSubmit label={label} danger={danger}>
        {children}
      </IconSubmit>
    </form>
  );
}

export default function DoctorRowActions({ d, locale }: { d: Doctor; locale: string }) {
  return (
    <span className="flex items-center gap-0.5">
      {d.status !== "approved" && (
        <Op id={d.id} op="approve" locale={locale} label={`Approve ${d.name}`}>
          <Check aria-hidden className="size-4" />
        </Op>
      )}
      {d.status === "approved" &&
        (d.featured ? (
          <Op id={d.id} op="unfeature" locale={locale} label={`Unfeature ${d.name}`}>
            <StarOff aria-hidden className="size-4" />
          </Op>
        ) : (
          <Op id={d.id} op="feature" locale={locale} label={`Feature ${d.name}`}>
            <Star aria-hidden className="size-4" />
          </Op>
        ))}
      {d.status !== "rejected" && (
        <Op id={d.id} op="reject" locale={locale} label={`Reject ${d.name}`}>
          <X aria-hidden className="size-4" />
        </Op>
      )}
      <Op id={d.id} op="remove" locale={locale} label={`Remove ${d.name}`} danger>
        <Trash2 aria-hidden className="size-4" />
      </Op>
    </span>
  );
}
