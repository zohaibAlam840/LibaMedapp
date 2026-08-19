import Link from "next/link";
import { notFound } from "next/navigation";
import {
  FileText,
  FolderLock,
  Globe2,
  ScrollText,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import SearchInput from "@/components/ui/SearchInput";
import ListRow from "@/components/ui/ListRow";
import StatusChip from "@/components/ui/StatusChip";
import MessageThread from "@/components/messaging/MessageThread";
import QueryProvider from "@/components/messaging/QueryProvider";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import { getCase, getCases, getDocuments, getMessages } from "@/lib/db/referrals";
import { getConsentRecords } from "@/lib/db/governance";

/**
 * Secure messaging 3-panel workspace (design spec §3.3): case list | thread |
 * case-meta panel. Shared by the referring (#38) and receiving (#47) sides.
 *
 * Clinical adaptations: left list = CASES (patient reference only, never
 * patient names/avatars); right panel = case metadata + audit link, NOT a
 * patient contact card. No voice notes, no calls.
 */
export default async function MessagingWorkspace({
  locale,
  side,
  caseId,
}: {
  locale: string;
  side: "referring" | "receiving";
  caseId: string;
}) {
  const activeCase = await getCase(caseId);
  if (!activeCase) notFound();
  // Read from the consent record rather than a fixed "Active · v2 wording":
  // this panel sits beside a live clinical thread, where a withdrawn consent
  // still showing "Active" would be read as permission to keep going.
  const consent = (await getConsentRecords()).find((r) => r.caseRef === activeCase.ref);
  const cases = await getCases();
  const messages = await getMessages(caseId);
  const documents = await getDocuments(caseId);
  // Who you're talking to depends on which side of the referral you're on.
  const counterpart =
    side === "referring"
      ? { name: activeCase.specialist || "Receiving specialist", role: activeCase.hospital }
      : { name: activeCase.referrer || "Referring clinician", role: "Referring clinician" };
  const basePath = `/${locale}/${side}/cases`;

  return (
    <div className="grid min-h-[70dvh] gap-4 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[300px_minmax(0,1fr)_300px]">
      {/* Case list */}
      <Card className="hidden flex-col gap-3 p-4 lg:flex">
        <CardTitle className="mb-0">Messages</CardTitle>
        <SearchInput placeholder="Search cases" />
        <div className="-mx-2 flex flex-col">
          {cases.slice(0, 4).map((c) => (
            <ListRow
              key={c.id}
              href={`${basePath}/${c.id}/messages`}
              selected={c.id === activeCase.id}
              leading={
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
                  <FolderLock aria-hidden className="size-4.5" />
                </span>
              }
              title={c.ref}
              subtitle={`${c.specialty} · ${c.hospital}`}
              meta={c.updated}
              badge={
                c.unread ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-medium text-white">
                    {c.unread}
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      </Card>

      {/* Thread */}
      <Card className="flex min-h-[60dvh] flex-col p-0">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Avatar name={counterpart.name} size="md" dot />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-ink">
              {counterpart.name}
            </p>
            <p className="truncate text-[13px] text-ink-secondary">
              {counterpart.role} · case {activeCase.ref}
            </p>
          </div>
          <StatusChip status={activeCase.status} className="hidden sm:inline-flex" />
        </div>

        {/* Thread + composer are a client island: the messages poll so the
            other clinician's replies arrive without either side reloading.
            Everything around them stays server-rendered. */}
        <QueryProvider>
          <MessageThread
            caseRef={activeCase.ref}
            locale={locale}
            side={side}
            initialMessages={messages}
          />
        </QueryProvider>
      </Card>

      {/* Case meta panel */}
      <Card className="hidden flex-col p-4 xl:flex">
        <CardTitle className="mb-2">Case details</CardTitle>
        <div className="divide-y divide-line">
          <DetailPanelRow icon={FolderLock} label="Case reference" value={activeCase.ref} />
          <DetailPanelRow icon={ShieldCheck} label="Patient reference" value={activeCase.patientRef} />
          <DetailPanelRow icon={Stethoscope} label="Specialty" value={activeCase.specialty} />
          <DetailPanelRow icon={Globe2} label="Corridor" value={activeCase.corridorLabel} />
          <DetailPanelRow icon={FolderLock} label="Data residency" value={activeCase.residency} />
          <DetailPanelRow
            icon={ScrollText}
            label="Consent"
            value={
              consent
                ? `${consent.status === "withdrawn" ? "Withdrawn" : "Active"}${consent.version ? ` · ${consent.version}` : ""}`
                : "Not captured"
            }
            trailing={
              <Link
                href={`/${locale}/referring/cases/${activeCase.id}/consent`}
                className="text-[13px] font-medium text-accent hover:underline"
              >
                View
              </Link>
            }
          />
        </div>

        <p className="mb-2 mt-4 text-[13px] font-medium text-ink-secondary">
          Documents
        </p>
        <div className="flex flex-col gap-2">
          {documents.map((doc) => (
            <div
              key={doc.name}
              className="flex items-center gap-2.5 rounded-inner bg-subtle px-3 py-2"
            >
              <FileText aria-hidden className="size-4 shrink-0 text-ink-secondary" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                {doc.name}
              </span>
              <span className="text-[11px] text-ink-muted">{doc.size}</span>
            </div>
          ))}
        </div>

        <Link
          href={`/${locale}/admin/audit`}
          className="mt-4 text-[13px] font-medium text-accent hover:underline"
        >
          View audit trail
        </Link>
      </Card>
    </div>
  );
}
