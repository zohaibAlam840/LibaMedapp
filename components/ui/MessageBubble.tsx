import { Check, FileText } from "lucide-react";
import { cn } from "@/lib/cn";

interface MessageBubbleProps {
  direction: "incoming" | "outgoing";
  children?: React.ReactNode;
  /** Document attachment (no images-of-people / voice notes — design spec §3.3). */
  attachment?: { name: string; size: string };
  time: string;
  /** Read tick on outgoing messages. */
  read?: boolean;
  className?: string;
}

/** Chat bubble: incoming = subtle grey (start-aligned), outgoing = accent-soft (end-aligned). */
export default function MessageBubble({
  direction,
  children,
  attachment,
  time,
  read = false,
  className,
}: MessageBubbleProps) {
  const incoming = direction === "incoming";
  return (
    <div
      className={cn(
        "flex max-w-[85%] flex-col gap-1 sm:max-w-[70%]",
        incoming ? "items-start self-start" : "items-end self-end",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-card px-4 py-2.5 text-[15px]",
          incoming
            ? "rounded-ss-sm bg-subtle text-ink"
            : "rounded-se-sm bg-accent-soft text-ink",
        )}
      >
        {children}
        {attachment && (
          <span
            className={cn(
              "flex items-center gap-2.5 rounded-inner bg-card/70 px-3 py-2",
              children ? "mt-2" : "",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
              <FileText aria-hidden className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">
                {attachment.name}
              </span>
              <span className="block text-xs text-ink-muted">
                {attachment.size}
              </span>
            </span>
          </span>
        )}
      </div>
      <span className="flex items-center gap-1 px-1 text-[11px] text-ink-muted">
        {time}
        {!incoming && read && (
          <Check aria-label="Read" className="size-3 text-accent" />
        )}
      </span>
    </div>
  );
}
