"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { INTEREST_STATUSES, STATUS_LABEL, ENQUIRY_FOR } from "@/lib/patientInterest";

/**
 * Filters for the patient enquiry list.
 *
 * Dropdowns rather than a row of chips. The chips wrapped onto three lines on a
 * phone and pushed the list itself below the fold, and campaign ids are long
 * enough that one of them could fill a row on its own — a set that grows every
 * time a campaign runs cannot be laid out as a row of buttons.
 *
 * Each change is a real navigation, so the list stays server-rendered and a
 * filtered view can be linked or bookmarked. React keeps the previous list on
 * screen while the next one loads, which is right — but with nothing moving it
 * reads as a dead click, which is what it looked like. Hence `isPending`: the
 * control that was changed says it is working, and the list dims and is marked
 * aria-busy so it is visibly stale rather than silently wrong.
 */
export default function EnquiryFilters({
  basePath,
  status,
  enquiryFor,
  campaign,
  campaigns,
  counts,
  total,
}: {
  basePath: string;
  status: string;
  enquiryFor?: string;
  campaign?: string;
  campaigns: string[];
  counts: Record<string, number>;
  total: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function go(patch: { status?: string; for?: string; campaign?: string }) {
    const q = new URLSearchParams();
    const s = patch.status ?? (status === "all" ? "" : status);
    const w = patch.for ?? enquiryFor ?? "";
    const c = patch.campaign ?? campaign ?? "";
    if (s) q.set("status", s);
    if (w) q.set("for", w);
    if (c) q.set("campaign", c);
    const qs = q.toString();
    startTransition(() => router.push(`${basePath}${qs ? `?${qs}` : ""}`));
  }

  const filtered = status !== "all" || Boolean(enquiryFor) || Boolean(campaign);

  return (
    <div
      className="rounded-panel border border-line bg-card p-3 md:p-4"
      aria-busy={isPending}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Group label="Status">
          <select
            aria-label="Filter by status"
            className={FIELD}
            value={status}
            onChange={(e) => go({ status: e.target.value === "all" ? "" : e.target.value })}
          >
            <option value="all">All{total > 0 ? ` · ${total}` : ""}</option>
            {INTEREST_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
                {counts[s] ? ` · ${counts[s]}` : ""}
              </option>
            ))}
          </select>
        </Group>

        <Group label="For">
          <select
            aria-label="Filter by who the enquiry is for"
            className={FIELD}
            value={enquiryFor ?? ""}
            onChange={(e) => go({ for: e.target.value })}
          >
            <option value="">Anyone</option>
            {ENQUIRY_FOR.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Group>

        {/* Hidden entirely rather than shown empty: before any campaign has run
            there is nothing to choose, and an enabled control with one option
            invites a click that does nothing. */}
        {campaigns.length > 0 && (
          <Group label="Campaign">
            <select
              aria-label="Filter by campaign"
              className={FIELD}
              value={campaign ?? ""}
              onChange={(e) => go({ campaign: e.target.value })}
            >
              <option value="">Any campaign</option>
              {campaigns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Group>
        )}
      </div>

      {(filtered || isPending) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3">
          {isPending ? (
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-accent">
              <Loader2 aria-hidden className="size-3.5 animate-spin" />
              Updating&hellip;
            </span>
          ) : (
            <span className="text-[13px] text-ink-secondary">
              Showing a filtered view.
            </span>
          )}
          {filtered && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push(basePath))}
              className="flex items-center gap-1.5 rounded-inner px-2 py-1 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
            >
              <RotateCcw aria-hidden className="size-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Explicit text and background colours. The previous chips inherited theirs and
// went near-invisible against the card in light mode.
const FIELD =
  "h-10 w-full rounded-inner border border-line bg-card px-3 text-[14px] text-ink " +
  "transition-colors hover:border-line-strong focus:border-accent focus:outline-none " +
  "focus:ring-2 focus:ring-accent/20";

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </span>
      {children}
    </label>
  );
}
