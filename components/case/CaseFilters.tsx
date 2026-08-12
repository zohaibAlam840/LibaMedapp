"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FolderLock, Search } from "lucide-react";
import { Card, CardTitle, SectionLabel } from "@/components/ui/Card";
import Checkbox from "@/components/ui/Checkbox";
import ListRow from "@/components/ui/ListRow";
import StatusChip from "@/components/ui/StatusChip";
import EmptyState from "@/components/ui/EmptyState";
import { CASE_PIPELINE, CASE_STATUS_LABELS, type CaseStatus } from "@/lib/caseStatus";
import type { DemoCase } from "@/lib/demo";

/**
 * Case list with working search and status/specialty filters. Filtering happens
 * on the client over the already-scoped set the server returned — the server
 * decides what you may see, this only decides what you're looking at.
 */
export default function CaseFilters({
  cases,
  basePath,
  emptyTitle = "No cases yet",
  emptyDescription = "Cases appear here once they are created.",
}: {
  cases: DemoCase[];
  /** e.g. `/en/referring/cases` */
  basePath: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const [query, setQuery] = useState("");
  const [statuses, setStatuses] = useState<Set<string>>(new Set());
  const [specialties, setSpecialties] = useState<Set<string>>(new Set());

  // Only offer filters that actually occur in this user's cases.
  const availableStatuses = useMemo(
    () => CASE_PIPELINE.filter((s) => cases.some((c) => c.status === s)) as CaseStatus[],
    [cases],
  );
  const availableSpecialties = useMemo(
    () => [...new Set(cases.map((c) => c.specialty).filter(Boolean))].sort(),
    [cases],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cases.filter((c) => {
      if (statuses.size && !statuses.has(c.status)) return false;
      if (specialties.size && !specialties.has(c.specialty)) return false;
      if (!q) return true;
      return [c.ref, c.patientRef, c.specialty, c.hospital, c.specialist, c.corridorLabel]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [cases, query, statuses, specialties]);

  const toggle = (set: Set<string>, apply: (s: Set<string>) => void, value: string) => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    apply(next);
  };

  const activeFilters = statuses.size + specialties.size;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <Card>
        <CardTitle>
          {filtered.length === cases.length
            ? `${cases.length} case${cases.length === 1 ? "" : "s"}`
            : `${filtered.length} of ${cases.length} cases`}
        </CardTitle>

        <div className="relative mb-3">
          <Search
            aria-hidden
            className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by reference, patient, specialty or hospital"
            aria-label="Search cases"
            className="h-11 w-full rounded-inner border border-transparent bg-subtle ps-10 pe-4 text-[15px] text-ink placeholder:text-ink-muted focus:border-accent focus:bg-card focus:outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={FolderLock}
            title={cases.length === 0 ? emptyTitle : "No cases match"}
            description={
              cases.length === 0
                ? emptyDescription
                : "Try a different search, or clear the filters."
            }
          />
        ) : (
          <div className="-mx-2 flex flex-col">
            {filtered.map((c) => (
              <ListRow
                key={c.id}
                href={`${basePath}/${c.id}`}
                chevron
                unread={!!c.unread}
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialty}`}
                subtitle={`Patient ${c.patientRef}${c.hospital ? ` · ${c.hospital}` : ""}`}
                meta={c.updated}
                badge={<StatusChip status={c.status} />}
              />
            ))}
          </div>
        )}
      </Card>

      <Card className="h-fit">
        <CardTitle className="mb-0 flex items-center justify-between gap-2">
          Filter
          {activeFilters > 0 && (
            <button
              type="button"
              onClick={() => {
                setStatuses(new Set());
                setSpecialties(new Set());
              }}
              className="text-[13px] font-medium text-accent hover:underline"
            >
              Clear
            </button>
          )}
        </CardTitle>

        {availableStatuses.length > 0 && (
          <>
            <SectionLabel className="mb-1 mt-3">Status</SectionLabel>
            <div className="flex flex-col">
              {availableStatuses.map((s) => (
                <Checkbox
                  key={s}
                  label={CASE_STATUS_LABELS[s]}
                  checked={statuses.has(s)}
                  onChange={() => toggle(statuses, setStatuses, s)}
                />
              ))}
            </div>
          </>
        )}

        {availableSpecialties.length > 0 && (
          <>
            <SectionLabel className="mb-1 mt-4">Specialty</SectionLabel>
            <div className="flex flex-col">
              {availableSpecialties.map((s) => (
                <Checkbox
                  key={s}
                  label={s}
                  checked={specialties.has(s)}
                  onChange={() => toggle(specialties, setSpecialties, s)}
                />
              ))}
            </div>
          </>
        )}

        {availableStatuses.length === 0 && availableSpecialties.length === 0 && (
          <p className="mt-3 text-[13px] text-ink-muted">
            Filters appear once you have cases.
          </p>
        )}
      </Card>
    </div>
  );
}
