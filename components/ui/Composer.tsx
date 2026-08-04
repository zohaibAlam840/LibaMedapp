"use client";

import { useActionState, useEffect, useRef } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { sendMessageAction, type ActionState } from "@/lib/referralActions";

/**
 * Message composer: attach + textarea + send. Deliberately no mic/voice-note
 * control (clinical adaptation, design spec §3.3). Wired to sendMessageAction —
 * the message is inserted, audited, and the thread revalidated on submit.
 * When `ref` is absent (design preview) it renders inert.
 */
export default function Composer({
  ref,
  locale,
  side,
  placeholder = "Write a message…",
}: {
  ref?: string;
  locale?: string;
  side?: "referring" | "receiving";
  placeholder?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendMessageAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea once a send succeeds.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="border-t border-line">
      {state.error && (
        <p className="px-4 pt-2 text-[13px] text-danger-text">{state.error}</p>
      )}
      <div className="flex items-end gap-2 p-3">
        <input type="hidden" name="ref" value={ref ?? ""} />
        <input type="hidden" name="locale" value={locale ?? "en"} />
        <input type="hidden" name="side" value={side ?? "referring"} />
        <IconButton type="button" aria-label="Attach document" variant="soft" size="sm">
          <Paperclip aria-hidden className="size-4" />
        </IconButton>
        <textarea
          name="body"
          rows={1}
          placeholder={placeholder}
          aria-label={placeholder}
          disabled={!ref || pending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className="max-h-32 min-h-11 flex-1 resize-none rounded-inner border border-transparent bg-subtle px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-muted focus:border-accent focus:bg-card focus:outline-none disabled:opacity-60"
        />
        <IconButton
          type="submit"
          aria-label="Send message"
          variant="active"
          size="sm"
          disabled={!ref || pending}
          className="rtl:-scale-x-100"
        >
          <SendHorizontal aria-hidden className="size-4" />
        </IconButton>
      </div>
    </form>
  );
}
