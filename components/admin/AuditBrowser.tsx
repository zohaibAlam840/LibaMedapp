"use client";

import { useMemo, useState } from "react";
import { Download, ScrollText } from "lucide-react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import EmptyState from "@/components/ui/EmptyState";
import SearchInput from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Field";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import type { AuditEvent } from "@/lib/db/audit";

/**
 * Audit-log browser.
 *
 * Same division of labour as the case list: the SERVER decides which events
 * exist and hands over the newest slice; this only decides which of them you
 * are looking at. Every filter option is derived from the rows actually loaded,
 * so a filter can never promise a category the log does not contain.
 *
 * Export is rendered only when the signed-in admin holds `canExportAudit`, and
 * writes exactly the rows currently in view — it does not claim to export more
 * of the log than was loaded.
 */

const RANGES: { value: string; label: string; days: number | null }[] = [
  { value: "", label: "All time", days: null },
  { value: "1", label: "Last 24 hours", days: 1 },
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
];

export default function AuditBrowser({
  events,
  total,
  canExport,
  csv,
}: {
  events: AuditEvent[];
  /** Rows in the log overall — may exceed `events.length`. */
  total: number;
  canExport: boolean;
  /** CSV of `events`, built on the server so both sides agree on the shape. */
  csv: string;
}) {
  const [query, setQuery] = useState("");
  const [event, setEvent] = useState("");
  const [corridor, setCorridor] = useState("");
  // The date filter stores the cutoff itself, computed in the change handler.
  // Reading the clock during render would make the filter re-evaluate to a
  // different answer on every re-render.
  const [range, setRange] = useState("");
  const [cutoff, setCutoff] = useState<number | null>(null);

  const onRangeChange = (value: string) => {
    setRange(value);
    const days = RANGES.find((r) => r.value === value)?.days ?? null;
    setCutoff(days ? Date.now() - days * 86_400_000 : null);
  };

  const eventNames = useMemo(
    () => [...new Set(events.map((e) => e.event))].sort((a, b) => a.localeCompare(b)),
    [events],
  );
  const corridors = useMemo(() => {
    const seen = new Map<string, string>();
    for (const e of events) if (e.corridorId) seen.set(e.corridorId, e.corridorLabel || e.corridorId);
    return [...seen].sort((a, b) => a[1].localeCompare(b[1]));
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter((e) => {
      if (event && e.event !== event) return false;
      if (corridor && e.corridorId !== corridor) return false;
      if (cutoff && new Date(e.atIso).getTime() < cutoff) return false;
      if (!q) return true;
      return [e.actor, e.event, e.detail, e.caseRef, e.corridorLabel]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [events, query, event, corridor, cutoff]);

  const download = () => {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `libamed-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          placeholder="Search actor, event, case ref"
          className="max-w-xs flex-1"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* Each select is boxed rather than sized directly: Field's control
            class carries `w-full`, and `cn` only concatenates, so a `w-auto`
            on the select loses and every filter stretches to a full row. */}
        {/* Only offered when there is more than one value to choose between —
            a one-option filter is decoration. */}
        {eventNames.length > 1 && (
          <div className="w-52">
            <Select
              aria-label="Filter by event"
              value={event}
              onChange={(e) => setEvent(e.target.value)}
              className="h-11"
            >
              <option value="">All events</option>
              {eventNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </Select>
          </div>
        )}
        {corridors.length > 1 && (
          <div className="w-48">
            <Select
              aria-label="Filter by corridor"
              value={corridor}
              onChange={(e) => setCorridor(e.target.value)}
              className="h-11"
            >
              <option value="">All corridors</option>
              {corridors.map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="w-44">
          <Select
            aria-label="Filter by date"
            value={range}
            onChange={(e) => onRangeChange(e.target.value)}
            className="h-11"
          >
            {RANGES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </Select>
        </div>
        {canExport && (
          <Button variant="secondary" size="sm" onClick={download} className="ms-auto">
            <Download aria-hidden className="size-4" /> Export CSV
          </Button>
        )}
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Nothing recorded yet"
          description="Every referral step, document access, consent capture, and configuration change is written here as it happens. The log fills itself — entries cannot be added by hand."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No events match"
          description="Try a wider date range or clear the filters."
        />
      ) : (
        <ResponsiveTable
          columns={[
            { key: "at", label: "Timestamp" },
            { key: "actor", label: "Actor" },
            { key: "event", label: "Event" },
            { key: "detail", label: "Detail" },
            { key: "object", label: "Case" },
          ]}
          rows={filtered.map((e) => ({
            id: e.id,
            cells: {
              at: <span className="font-mono text-xs">{e.at}</span>,
              actor: e.actor,
              event: e.event,
              detail: <span className="text-ink-secondary">{e.detail || "—"}</span>,
              object: e.caseRef ? (
                <span>
                  {e.caseRef}
                  {e.corridorLabel && (
                    <span className="block text-xs text-ink-muted">{e.corridorLabel}</span>
                  )}
                </span>
              ) : (
                <Chip size="sm">Platform</Chip>
              ),
            },
          }))}
        />
      )}

      {events.length > 0 && (
        <p className="mt-4 text-xs text-ink-muted">
          {filtered.length === events.length
            ? events.length < total
              ? `Showing the newest ${events.length} of ${total} events in the log.`
              : `Showing all ${total} ${total === 1 ? "event" : "events"} in the log.`
            : events.length < total
              ? `Showing ${filtered.length} of the newest ${events.length} events — ${total} in the log.`
              : `Showing ${filtered.length} of ${total} ${total === 1 ? "event" : "events"} in the log.`}
        </p>
      )}
    </>
  );
}
