"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import MessageBubble from "@/components/ui/MessageBubble";
import Composer from "@/components/ui/Composer";
import type { DemoMessage } from "@/lib/demo";

/**
 * The live half of the messaging workspace.
 *
 * The server renders the thread it already fetched and hands it over as
 * `initialMessages`, so the first paint carries real content and this only ever
 * takes over the updating. Polling is a deliberate choice (see the API route):
 * the other clinician may be in a different country and hours ahead, and the
 * thread has to move without either of them reloading.
 *
 * `POLL_MS` is a compromise. Shorter feels live but every open tab costs a
 * request; a clinical back-and-forth is not a chat app, so a few seconds of
 * lag is not a clinical risk.
 */
const POLL_MS = 5_000;

export function messagesKey(caseRef: string) {
  return ["case-messages", caseRef] as const;
}

export default function MessageThread({
  caseRef,
  locale,
  side,
  initialMessages,
}: {
  caseRef: string;
  locale: string;
  side: "referring" | "receiving";
  initialMessages: DemoMessage[];
}) {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: messagesKey(caseRef),
    queryFn: async ({ signal }) => {
      const res = await fetch(`/api/cases/${encodeURIComponent(caseRef)}/messages`, {
        signal,
        headers: { accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Thread unavailable (${res.status})`);
      const body = (await res.json()) as { messages: DemoMessage[] };
      return body.messages;
    },
    initialData: initialMessages,
    refetchInterval: POLL_MS,
  });

  const messages = data ?? initialMessages;
  const bottom = useRef<HTMLDivElement>(null);
  const count = messages.length;

  // Follow the conversation as it grows. Keyed on the count so re-renders that
  // change nothing don't yank the view away from someone reading back.
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "end" });
  }, [count]);

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
        <p className="self-center rounded-full bg-subtle px-3 py-1 text-[11px] text-ink-muted">
          Messages are encrypted and logged to the case audit trail
        </p>
        {messages.map((m, i) => (
          <MessageBubble
            key={i}
            // Stored direction is from the referring perspective; flip it for
            // the receiving side so each clinician sees their own sends
            // right-aligned.
            direction={
              side === "referring"
                ? m.direction
                : m.direction === "outgoing"
                  ? "incoming"
                  : "outgoing"
            }
            attachment={m.attachment}
            time={m.time}
            read={m.read}
          >
            {m.text}
          </MessageBubble>
        ))}
        <div ref={bottom} />
      </div>

      <Composer
        caseRef={caseRef}
        locale={locale}
        side={side}
        // Show the message the instant it is submitted. Without this the sender
        // waits on the whole server-action round-trip (measured at ~3.4s here)
        // before their own words appear, which reads as a dropped send and
        // invites them to type it again.
        onSubmitText={(text) =>
          queryClient.setQueryData<DemoMessage[]>(messagesKey(caseRef), (prev) => [
            ...(prev ?? messages),
            {
              // Stored direction is written from the referring perspective; the
              // bubble flips it for the receiving side.
              direction: side === "referring" ? "outgoing" : "incoming",
              text,
              time: "Sending…",
              read: false,
            },
          ])
        }
        // Reconcile against the server once it lands: the optimistic entry is
        // replaced by the stored row, with its real timestamp.
        onSent={() => queryClient.invalidateQueries({ queryKey: messagesKey(caseRef) })}
      />
    </>
  );
}
