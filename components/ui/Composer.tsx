"use client";

import { useActionState, useEffect, useRef } from "react";
import { Paperclip, SendHorizontal } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import { sendMessageAction, type ActionState } from "@/lib/referralActions";

/**
 * Message composer: attach + textarea + send. Deliberately no mic/voice-note
 * control (clinical adaptation, design spec §3.3). Wired to sendMessageAction —
 * the message is inserted, audited, and the thread revalidated on submit.
 * The case is passed as `caseRef`, NOT `ref`: React treats a prop literally
 * named `ref` as an element ref, and this component is rendered by a server
 * component, so the value is not guaranteed to survive as an ordinary prop.
 * When `caseRef` is absent (design preview) it renders inert.
 */
export default function Composer({
  caseRef,
  locale,
  side,
  placeholder = "Write a message…",
  onSent,
  onSubmitText,
}: {
  caseRef?: string;
  locale?: string;
  side?: "referring" | "receiving";
  placeholder?: string;
  /** Called after a successful send, so a live thread can refetch at once. */
  onSent?: () => void;
  /**
   * Called with the text the moment it is submitted, BEFORE the server
   * responds — lets the thread show the message straight away instead of
   * after the action round-trip.
   */
  onSubmitText?: (text: string) => void;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(sendMessageAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea once a send succeeds, and tell the thread to refetch.
  useEffect(() => {
    if (!state.ok) return;
    formRef.current?.reset();
    onSent?.();
  }, [state.ok, onSent]);

  return (
    <form
      ref={formRef}
      action={action}
      onSubmit={(e) => {
        const field = e.currentTarget.elements.namedItem("body");
        const text = field instanceof HTMLTextAreaElement ? field.value.trim() : "";
        if (text) onSubmitText?.(text);
      }}
      className="border-t border-line"
    >
      {state.error && (
        <p className="px-4 pt-2 text-[13px] text-danger-text">{state.error}</p>
      )}
      <div className="flex items-end gap-2 p-3">
        <input type="hidden" name="ref" value={caseRef ?? ""} />
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
          disabled={!caseRef || pending}
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
          disabled={!caseRef || pending}
          className="rtl:-scale-x-100"
        >
          <SendHorizontal aria-hidden className="size-4" />
        </IconButton>
      </div>
    </form>
  );
}
