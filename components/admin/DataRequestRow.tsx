"use client";

import { useActionState, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  ShieldX,
  TriangleAlert,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import SubmitButton from "@/components/ui/SubmitButton";
import { Textarea } from "@/components/ui/Field";
import {
  eraseSubjectDataAction,
  exportSubjectDataAction,
  updateDataRequestAction,
  type DsarState,
} from "@/lib/dsarActions";
import {
  REQUEST_KIND_LABELS,
  REQUEST_STATUS_LABELS,
  type DataRequest,
} from "@/lib/dsarTypes";
import { cn } from "@/lib/cn";

/** One request, with the deadline clock and the actions that fulfil it. */
export default function DataRequestRow({
  request,
  locale,
}: {
  request: DataRequest;
  locale: string;
}) {
  const [exportState, exportAction, exporting] = useActionState<DsarState, FormData>(
    exportSubjectDataAction,
    {},
  );
  const [confirmErase, setConfirmErase] = useState(false);

  const closed = request.status === "fulfilled" || request.status === "refused";
  const isErasure = request.kind === "erasure";

  function downloadExport() {
    if (!exportState.payload) return;
    const blob = new Blob([exportState.payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subject-data-${request.caseRef || request.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-inner border p-4",
        request.overdue ? "border-danger-text/40 bg-danger-bg/25" : "border-line",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium text-ink">{request.subjectName}</p>
          <p className="text-[13px] text-ink-secondary">
            {REQUEST_KIND_LABELS[request.kind]}
            {request.subjectEmail ? ` · ${request.subjectEmail}` : ""}
            {request.caseRef ? ` · case ${request.caseRef}` : " · not linked to a case"}
          </p>
          <p className="mt-0.5 text-[13px] text-ink-muted">Received {request.receivedAt}</p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-semibold",
              closed
                ? "bg-success-bg text-success-text"
                : request.overdue
                  ? "bg-danger-bg text-danger-text"
                  : "bg-warning-bg text-warning-text",
            )}
          >
            {REQUEST_STATUS_LABELS[request.status]}
          </span>
          {!closed && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[12px]",
                request.overdue ? "font-semibold text-danger-text" : "text-ink-secondary",
              )}
            >
              {request.overdue && <AlertTriangle aria-hidden className="size-3.5" />}
              {request.overdue
                ? `${Math.abs(request.daysLeft)} days overdue`
                : `${request.daysLeft} days left · due ${request.dueAt}`}
            </span>
          )}
        </div>
      </div>

      {request.detail && (
        <p className="rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
          &ldquo;{request.detail}&rdquo;
        </p>
      )}

      {closed ? (
        request.outcome && (
          <p className="border-t border-line pt-3 text-[13px] text-ink-secondary">
            <b className="text-ink">Outcome:</b> {request.outcome}
            {request.closedAt ? ` · ${request.closedAt}` : ""}
          </p>
        )
      ) : (
        <div className="flex flex-col gap-3 border-t border-line pt-3">
          {/* Fulfil: export, or erase */}
          {request.referralId ? (
            isErasure ? (
              <div className="flex flex-col gap-2">
                <p className="flex items-start gap-2 text-[13px] text-ink-secondary">
                  <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-warning-text" />
                  Erasure removes the patient&rsquo;s personal data and their documents. The
                  audit trail is kept but no longer identifies them — it is the evidence
                  that this erasure happened, so it cannot be deleted.
                </p>
                <div className="rounded-inner border border-line px-4">
                  <Checkbox
                    label="I confirm this person's identity has been verified and erasure is appropriate."
                    checked={confirmErase}
                    onChange={(e) => setConfirmErase(e.target.checked)}
                  />
                </div>
                <form action={eraseSubjectDataAction} className="flex justify-end">
                  <input type="hidden" name="referralId" value={request.referralId} />
                  <input type="hidden" name="caseRef" value={request.caseRef} />
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="confirm" value={confirmErase ? "on" : ""} />
                  <SubmitButton
                    variant="danger"
                    size="sm"
                    disabled={!confirmErase}
                    pendingLabel="Erasing…"
                  >
                    <ShieldX aria-hidden className="size-4" />
                    Erase personal data
                  </SubmitButton>
                </form>
              </div>
            ) : (
              <form action={exportAction} className="flex flex-wrap items-center justify-between gap-2">
                <input type="hidden" name="referralId" value={request.referralId} />
                <input type="hidden" name="caseRef" value={request.caseRef} />
                <p className="text-[13px] text-ink-secondary">
                  Builds a file containing everything held about them.
                </p>
                <div className="flex gap-2">
                  {exportState.payload && (
                    <Button type="button" variant="secondary" size="sm" onClick={downloadExport}>
                      <Download aria-hidden className="size-4" />
                      Download
                    </Button>
                  )}
                  <Button type="submit" size="sm" loading={exporting} disabled={exporting}>
                    {exportState.payload ? "Rebuild export" : "Build export"}
                  </Button>
                </div>
              </form>
            )
          ) : (
            <p className="text-[13px] text-ink-muted">
              Link this request to a case reference to export or erase their data.
            </p>
          )}

          {exportState.error && (
            <p className="text-[13px] text-danger-text">{exportState.error}</p>
          )}

          {/* Close it out */}
          <form action={updateDataRequestAction} className="flex flex-col gap-2">
            <input type="hidden" name="requestId" value={request.id} />
            <input type="hidden" name="locale" value={locale} />
            <Textarea
              name="outcome"
              rows={2}
              placeholder="What you did, for the record — e.g. 'Copy sent by secure email on 14 Aug.'"
              aria-label="Outcome"
            />
            <div className="flex flex-wrap justify-end gap-2">
              <SubmitButton
                name="status"
                value="in-progress"
                variant="secondary"
                size="sm"
                pendingLabel="Saving…"
              >
                Save note
              </SubmitButton>
              <SubmitButton
                name="status"
                value="refused"
                variant="danger"
                size="sm"
                pendingLabel="Closing…"
              >
                Refuse
              </SubmitButton>
              <SubmitButton name="status" value="fulfilled" size="sm" pendingLabel="Closing…">
                <CheckCircle2 aria-hidden className="size-4" />
                Mark fulfilled
              </SubmitButton>
            </div>
          </form>
        </div>
      )}
    </li>
  );
}
