"use client";

import { useState } from "react";
import { Mail, Building2 } from "lucide-react";
import Chip from "@/components/ui/Chip";
import SubmitButton from "@/components/ui/SubmitButton";
import { Textarea } from "@/components/ui/Field";
import { updateContactMessageAction } from "@/lib/contactActions";
import type { ContactMessage } from "@/lib/db/contact";

const STATUS_TONE: Record<string, string> = {
  new: "bg-accent-soft text-accent",
  read: "bg-subtle text-ink-secondary",
  answered: "bg-success-bg text-success-text",
  archived: "bg-subtle text-ink-muted",
};

/**
 * One enquiry, with the actions an admin actually takes on it: reply by mail
 * (the address is a mailto so it opens their own client), record what was done,
 * and move it out of the inbox.
 */
export default function EnquiryRow({
  locale,
  message,
}: {
  locale: string;
  message: ContactMessage;
}) {
  const [open, setOpen] = useState(message.status === "new");

  return (
    <div className="rounded-card border border-line p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="min-w-0 flex-1 text-start"
        >
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium text-ink">
            {message.name}
            {message.subject && (
              <Chip size="sm" variant="outline">
                {message.subject}
              </Chip>
            )}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-secondary">
            <span className="inline-flex items-center gap-1.5">
              <Mail aria-hidden className="size-3.5" />
              {message.email}
            </span>
            {message.organisation && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 aria-hidden className="size-3.5" />
                {message.organisation}
              </span>
            )}
            <span className="text-ink-muted">{message.receivedAt}</span>
          </p>
        </button>
        <Chip size="sm" className={STATUS_TONE[message.status]}>
          {message.status}
        </Chip>
      </div>

      {open && (
        <>
          <p className="mt-3 whitespace-pre-wrap rounded-inner bg-subtle px-3.5 py-3 text-[14px] leading-relaxed text-ink">
            {message.body}
          </p>

          <form action={updateContactMessageAction} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="messageId" value={message.id} />
            <input type="hidden" name="locale" value={locale} />
            <Textarea
              name="note"
              rows={2}
              defaultValue={message.note}
              placeholder="What you did, for the record — e.g. 'Replied 12 Sep, sent partnership pack.'"
            />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <a
                href={`mailto:${message.email}?subject=${encodeURIComponent(
                  `Re: ${message.subject || "Your enquiry"} — LibaMed`,
                )}`}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                Reply by email
              </a>
              <div className="flex flex-wrap gap-2">
                <SubmitButton variant="secondary" size="sm" name="status" value="read">
                  Mark read
                </SubmitButton>
                <SubmitButton size="sm" name="status" value="answered" pendingLabel="Saving…">
                  Mark answered
                </SubmitButton>
                <SubmitButton variant="secondary" size="sm" name="status" value="archived">
                  Archive
                </SubmitButton>
              </div>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
