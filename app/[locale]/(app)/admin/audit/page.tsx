import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/Card";
import AuditBrowser from "@/components/admin/AuditBrowser";
import { getSessionUser } from "@/lib/auth";
import { auditCsv, getAuditEvents, verifyAuditChain } from "@/lib/db/audit";

// 9E · Audit log viewer (#57) — acceptance §14.9.
//
// Everything on this page is read from the `audit_log` table, which is written
// by triggers and blocked from UPDATE/DELETE at the database. Nothing here is
// illustrative: if the log is empty the page says so, and the chain status
// reports what was actually verified rather than a decorative tick.
//
// Export is gated on `canExportAudit` (Vol III §0.4).

// Newest slice loaded per visit; the browser filters within it.
const LIMIT = 200;

export default async function Page() {
  const [user, page, chain] = await Promise.all([
    getSessionUser(),
    getAuditEvents({ limit: LIMIT }),
    verifyAuditChain(),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Audit log</h1>
        <p className="mt-1 flex items-center gap-1.5 text-[15px] text-ink-secondary">
          <Lock aria-hidden className="size-4" />
          Append-only and tamper-evident — every case is reconstructable from
          this alone.
        </p>
      </div>

      {/* Chain status. Stated as what was checked ("N links verified"), because
          a bare "verified ✓" on a log with nothing in it is a claim about
          evidence that does not exist. */}
      {chain.rows > 0 && (
        <div
          className={`flex items-start gap-2.5 rounded-card border p-3.5 text-[13px] ${
            chain.intact
              ? "border-line bg-subtle text-ink-secondary"
              : "border-danger-text/30 bg-danger-bg text-danger-text"
          }`}
        >
          {chain.intact ? (
            <ShieldCheck aria-hidden className="mt-px size-4 shrink-0" />
          ) : (
            <ShieldAlert aria-hidden className="mt-px size-4 shrink-0" />
          )}
          <span>
            {chain.unhashed ? (
              <>
                {chain.rows} entries recorded. Hash chaining is not active on this
                database — apply the schema triggers to make the log
                tamper-evident.
              </>
            ) : chain.intact ? (
              <>
                Hash chain intact — {chain.links} {chain.links === 1 ? "link" : "links"} verified
                across {chain.rows} {chain.rows === 1 ? "entry" : "entries"}. Each entry carries the
                hash of the one before it, so a removed or altered row breaks the chain.
              </>
            ) : (
              <>
                Hash chain broken across {chain.rows} entries. An entry has been
                altered or removed at the database level — investigate before
                relying on this log as evidence.
              </>
            )}
          </span>
        </div>
      )}

      <Card>
        <AuditBrowser
          events={page.events}
          total={page.total}
          canExport={Boolean(user?.canExportAudit)}
          csv={auditCsv(page.events)}
        />
      </Card>
    </div>
  );
}
