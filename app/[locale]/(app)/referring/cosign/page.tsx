import Link from "next/link";
import { PenLine, TriangleAlert } from "lucide-react";
import { Card } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { getSessionUser } from "@/lib/auth";
import { cosignReady, getCosignQueue } from "@/lib/db/cosign";

export const metadata = { title: "Co-sign · LibaMed" };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await getSessionUser();
  const ready = await cosignReady();
  const queue = ready ? await getCosignQueue(user) : [];

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Awaiting co-sign</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          Cases an introducer has raised. Nothing here has reached a hospital — a
          UK-registered clinician has to sign first, and signing makes you the referring
          clinician of record.
        </p>
      </div>

      {!ready && (
        <p className="flex items-start gap-2 rounded-inner bg-warning-bg px-3.5 py-2.5 text-[13px] text-warning-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Migration 006 hasn&rsquo;t been applied, so this queue can&rsquo;t be read yet.
        </p>
      )}

      {ready && queue.length === 0 ? (
        <Card>
          <EmptyState
            icon={PenLine}
            title="Nothing waiting"
            description="When an introducer submits a case it appears here for any verified UK referring clinician to review."
          />
        </Card>
      ) : (
        ready && (
          <Card className="p-0">
            <ul className="divide-y divide-line">
              {queue.map((c) => (
                <li key={c.ref}>
                  <Link
                    href={`/${locale}/referring/cosign/${c.ref}`}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 transition-colors hover:bg-subtle"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-ink">{c.ref}</span>
                      <span className="block truncate text-[13px] text-ink-secondary">
                        {[c.specialty, c.corridorLabel, c.hospital].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    {c.introducer && (
                      <span className="text-[13px] text-ink-secondary">
                        Raised by {c.introducer}
                      </span>
                    )}
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
