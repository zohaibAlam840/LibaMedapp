"use client";

import { useActionState } from "react";
import { CheckCircle2, FileQuestion, Send, TriangleAlert } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { answerInfoRequestAction, type ClinicalState } from "@/lib/clinicalActions";
import type { InfoRequest } from "@/lib/db/clinical";

/**
 * Outstanding requests from the receiving team, shown to the referring
 * clinician with a reply box. Answered ones stay visible so the exchange is
 * legible later — this is clinical correspondence, not a task list to clear.
 */
export default function InfoRequestList({
  locale,
  caseRef,
  requests,
  canAnswer,
}: {
  locale: string;
  caseRef: string;
  requests: InfoRequest[];
  /** Referring side can answer; receiving side sees the thread read-only. */
  canAnswer: boolean;
}) {
  if (requests.length === 0) return null;

  const open = requests.filter((r) => r.status === "open");

  return (
    <Card>
      <CardTitle className="mb-1 flex items-center gap-2">
        <FileQuestion aria-hidden className="size-5 text-accent" />
        Information requests
        {open.length > 0 && (
          <span className="rounded-full bg-warning-bg px-2 py-0.5 text-[11px] font-semibold text-warning-text">
            {open.length} open
          </span>
        )}
      </CardTitle>
      <p className="mb-4 text-[13px] text-ink-secondary">
        Raised by the receiving team when records are missing.
      </p>

      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <RequestRow
            key={r.id}
            request={r}
            locale={locale}
            caseRef={caseRef}
            canAnswer={canAnswer}
          />
        ))}
      </div>
    </Card>
  );
}

function RequestRow({
  request,
  locale,
  caseRef,
  canAnswer,
}: {
  request: InfoRequest;
  locale: string;
  caseRef: string;
  canAnswer: boolean;
}) {
  const [state, action, pending] = useActionState<ClinicalState, FormData>(
    answerInfoRequestAction,
    {},
  );
  const answered = request.status === "answered";

  return (
    <div className="rounded-inner border border-line p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {request.items.length > 0 && (
            <div className="mb-1.5 flex flex-wrap gap-1.5">
              {request.items.map((it) => (
                <span
                  key={it}
                  className="rounded-full bg-subtle px-2 py-0.5 text-[11px] font-medium text-ink-secondary"
                >
                  {it}
                </span>
              ))}
            </div>
          )}
          {request.note && (
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink">{request.note}</p>
          )}
          <p className="mt-1 text-xs text-ink-muted">Requested {request.createdAt}</p>
        </div>
        {answered && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-text">
            <CheckCircle2 aria-hidden className="size-3" />
            Answered
          </span>
        )}
      </div>

      {answered ? (
        <div className="mt-3 border-t border-line pt-3">
          <p className="text-[13px] font-medium text-ink-secondary">Your response</p>
          <p className="mt-1 whitespace-pre-line text-[15px] leading-relaxed text-ink">{request.answer}</p>
          {request.answeredAt && (
            <p className="mt-1 text-xs text-ink-muted">Sent {request.answeredAt}</p>
          )}
        </div>
      ) : canAnswer ? (
        <form action={action} className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
          <input type="hidden" name="requestId" value={request.id} />
          <input type="hidden" name="ref" value={caseRef} />
          <input type="hidden" name="locale" value={locale} />
          <Textarea name="answer" rows={3} placeholder="Reply, or say when you'll send it…" aria-label="Your response" />
          {state.error && (
            <p className="flex items-start gap-2 text-[13px] text-danger-text">
              <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
              {state.error}
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={pending} disabled={pending}>
              <Send aria-hidden className="size-4" />
              Send response
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink-muted">
          Awaiting the referring clinician&rsquo;s response.
        </p>
      )}
    </div>
  );
}
