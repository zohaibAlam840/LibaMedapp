"use client";

import { useActionState } from "react";
import { CheckCircle2, TriangleAlert } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { sendContactMessageAction, type ContactState } from "@/lib/contactActions";

/**
 * Public contact form.
 *
 * This used to be inputs with a Send button and no action: an enquiry was typed
 * and discarded. It now stores the message and emails the team.
 *
 * The role/subject select is posted as `subject` so the admin inbox can be
 * filtered by what the enquiry is about.
 */
export default function ContactForm() {
  const [state, action] = useActionState<ContactState, FormData>(sendContactMessageAction, {});

  if (state.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-inner border border-success-bg bg-success-bg/40 p-5">
        <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
          <CheckCircle2 aria-hidden className="size-5 text-success-text" />
          Thanks — we have your message.
        </p>
        <p className="text-[13px] text-ink-secondary">
          It has been logged and sent to the team. We usually reply within two
          working days. If it is urgent, say so in a follow-up and we will
          prioritise it.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      {/* Honeypot: a field no person sees or fills. Off-screen rather than
          display:none, which some password managers and bots skip. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] size-0 opacity-0"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="c-name">
          <Input id="c-name" name="name" autoComplete="name" required />
        </Field>
        <Field label="Email" htmlFor="c-email">
          <Input id="c-email" name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="I am a…" htmlFor="c-subject">
          <Select id="c-subject" name="subject" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            <option>Clinician</option>
            <option>Hospital / provider</option>
            <option>Insurer / introducer</option>
            <option>Press</option>
            <option>Data protection question</option>
            <option>Other</option>
          </Select>
        </Field>
        <Field label="Organisation" htmlFor="c-org" hint="Optional">
          <Input id="c-org" name="organisation" autoComplete="organization" />
        </Field>
      </div>

      <Field
        label="Message"
        htmlFor="c-message"
        hint="No clinical details or patient-identifying information, please."
      >
        <Textarea id="c-message" name="body" rows={6} required />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div className="flex justify-end">
        <SubmitButton pendingLabel="Sending…">Send message</SubmitButton>
      </div>
    </form>
  );
}
