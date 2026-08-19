"use client";

import { useRef } from "react";
import Toggle from "@/components/ui/Toggle";
import { setHospitalPublishedAction } from "@/lib/adminActions";

/**
 * Publish switch in the partner-hospital list.
 *
 * A form, not a bare checkbox: flipping it submits `setHospitalPublishedAction`,
 * which writes the row, records an audit entry, and revalidates the public
 * directory. The previous version was a styled checkbox with `defaultChecked`
 * and nothing behind it — the row looked live, the public site never changed,
 * and a reload silently put it back.
 *
 * The hidden field carries the value being moved TO, read at submit time, so
 * the server never has to infer intent from a missing checkbox.
 */
export default function HospitalPublishToggle({
  hospitalId,
  name,
  locale,
  published,
}: {
  hospitalId: string;
  name: string;
  locale: string;
  published: boolean;
}) {
  const form = useRef<HTMLFormElement>(null);
  const next = useRef<HTMLInputElement>(null);

  return (
    <form ref={form} action={setHospitalPublishedAction}>
      <input type="hidden" name="hospitalId" value={hospitalId} />
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="locale" value={locale} />
      <input ref={next} type="hidden" name="published" value={String(!published)} />
      <Toggle
        label={
          <span className="sr-only">
            {published ? `Hide ${name} from the public site` : `Show ${name} on the public site`}
          </span>
        }
        checked={published}
        onChange={(e) => {
          if (next.current) next.current.value = String(e.target.checked);
          form.current?.requestSubmit();
        }}
      />
    </form>
  );
}
