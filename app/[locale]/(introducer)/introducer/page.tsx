import Link from "next/link";
import { FilePlus, FolderOpen, Hourglass, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import StatusChip from "@/components/ui/StatusChip";
import { getSessionUser } from "@/lib/auth";
import { cosignReady, getOriginatedCases } from "@/lib/db/cosign";

export const metadata = { title: "Your cases · LibaMed" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();
  const ready = await cosignReady();
  const cases = ready ? await getOriginatedCases(user) : [];
  const pending = user?.accountStatus !== "verified";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Your cases</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            Every case you raise is co-signed by a UK-registered clinician before it reaches a
            hospital. They become the referring clinician of record.
          </p>
        </div>
        {ready && (
          <Button href={`/${locale}/introducer/new`} size="sm">
            <FilePlus aria-hidden className="size-4" />
            Start a case
          </Button>
        )}
      </div>

      {!ready && (
        <p className="flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          This workspace needs migration 006, which hasn&rsquo;t been applied to the database yet.
          Nothing you write would be saved, so writing is switched off rather than lost.
        </p>
      )}

      {ready && pending && (
        <p className="flex items-start gap-2 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
          <Hourglass aria-hidden className="mt-0.5 size-4 shrink-0" />
          Your registration is still being checked. You can write cases now — you&rsquo;ll be able
          to submit them for co-sign once the check clears.
        </p>
      )}

      {ready && cases.length === 0 ? (
        <Card>
          <EmptyState
            icon={FolderOpen}
            title="No cases yet"
            description="Start one and it stays a private draft until you submit it for co-sign."
          >
            <Button href={`/${locale}/introducer/new`} size="sm">
              Start a case
            </Button>
          </EmptyState>
        </Card>
      ) : (
        ready && (
          <Card className="p-0">
            <ul className="divide-y divide-line">
              {cases.map((c) => (
                <li key={c.ref}>
                  <Link
                    href={`/${locale}/introducer/cases/${c.ref}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-subtle"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{c.ref}</span>
                      <span className="block truncate text-[13px] text-ink-secondary">
                        {[c.patientRef, c.corridorLabel, c.hospital].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <StatusChip status={c.status} />
                    <span className="text-[13px] text-ink-muted">{c.updated}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )
      )}
    </div>
  );
}
