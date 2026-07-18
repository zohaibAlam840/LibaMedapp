import { Paperclip, SendHorizontal } from "lucide-react";
import IconButton from "@/components/ui/IconButton";

/**
 * Message composer: attach + textarea + send. Deliberately no mic/voice-note
 * control (clinical adaptation, design spec §3.3). Design-only stub — no send
 * logic yet.
 */
export default function Composer({ placeholder = "Write a message…" }: { placeholder?: string }) {
  return (
    <div className="flex items-end gap-2 border-t border-line p-3">
      <IconButton aria-label="Attach document" variant="soft" size="sm">
        <Paperclip aria-hidden className="size-4" />
      </IconButton>
      <textarea
        rows={1}
        placeholder={placeholder}
        aria-label={placeholder}
        className="max-h-32 min-h-11 flex-1 resize-none rounded-inner border border-transparent bg-subtle px-4 py-2.5 text-[15px] text-ink placeholder:text-ink-muted focus:border-accent focus:bg-card focus:outline-none"
      />
      <IconButton aria-label="Send message" variant="active" size="sm" className="rtl:-scale-x-100">
        <SendHorizontal aria-hidden className="size-4" />
      </IconButton>
    </div>
  );
}
