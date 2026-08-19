import {
  Building2,
  Download,
  FileText,
  Globe2,
  MessageSquare,
  Paperclip,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import DetailPanelRow from "@/components/ui/DetailPanelRow";
import StatusChip from "@/components/ui/StatusChip";
import StatusTracker from "@/components/case/StatusTracker";
import HandbackBadge from "@/components/ui/HandbackBadge";
import EmptyState from "@/components/ui/EmptyState";
import { cn } from "@/lib/cn";
import { isPatientVisible } from "@/lib/demo";
import { getCorridorRecord } from "@/lib/db/corridors";
import { getSessionUser } from "@/lib/auth";
import {
  getDocuments,
  getMessages,
  getPatientCase,
  getReferralCompliance,
} from "@/lib/db/referrals";

// Patient portal — read-only view of the patient's single referral. Sees the
// full timeline including messages, honouring each message's `patientVisible`
// flag (clinician-only notes are withheld, with a count shown). The layout has
// already established that this is a signed-in patient; every read below is
// scoped by the session to that patient's own referral.
export default async function Page() {
  const user = await getSessionUser();
  const c = await getPatientCase(user);

  if (!c) {
    return (
      <EmptyState
        icon={FileText}
        title="No referral linked yet"
        description="Your clinician hasn't linked a referral to this account. Please contact your GP's practice."
      />
    );
  }

  const corridor = await getCorridorRecord(c.corridor);
  const record = await getReferralCompliance(c.id, user);
  const messages = await getMessages(c.id, user);
  const documents = await getDocuments(c.id, user);
  const gpName = record?.nonSubstitution.declaredBy || "your GP";
  const specialistName = c.specialist || "the receiving specialist";

  const visibleMessages = messages.filter(isPatientVisible);
  const hiddenCount = messages.length - visibleMessages.length;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">
          Your referral · {c.ref}
        </p>
        <h1 className="mt-0.5 text-[26px] font-semibold text-ink">
          {c.specialty} care at {c.hospital}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusChip status={c.status} />
          {record && <HandbackBadge handback={record.handback} />}
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardTitle className="mb-3">Where things stand</CardTitle>
        <StatusTracker status={c.status} />
      </Card>

      {/* Where care happens + safeguard */}
      <Card>
        <CardTitle className="mb-2">Your care abroad</CardTitle>
        <div className="divide-y divide-line">
          <DetailPanelRow icon={Building2} label="Hospital" value={`${c.hospital}${corridor?.country ? ` · ${corridor.country}` : ""}`} />
          <DetailPanelRow icon={Stethoscope} label="Your specialist" value={c.specialist} />
          <DetailPanelRow icon={Globe2} label="Where your records are held" value={corridor?.residency ?? c.residency} />
        </div>
        <div className="mt-3 flex items-start gap-2.5 rounded-inner bg-accent-soft/60 p-3.5 text-[13px] text-ink">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          <span>
            Your records are shared with clinicians in {corridor?.country ?? "the destination country"}. {corridor?.safeguard}
          </span>
        </div>
      </Card>

      {/* Consent */}
      {record && (
        <Card>
          <CardTitle className="mb-2">What you agreed to</CardTitle>
          <p className="mb-3 text-[13px] text-ink-secondary">
            {/* No "v" prefix here: the stored version already carries one
                (lib/intake.ts → "v2026-07"), which rendered as "vv2026-07". */}
            Consent {record.patientConsent.version} · captured {record.patientConsent.capturedAt}
          </p>
          <ul className="flex flex-col gap-2">
            {record.patientConsent.items.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
                <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-success-text" />
                {item.label}
              </li>
            ))}
          </ul>
          <p className="mt-3 border-t border-line pt-3 text-[13px] text-ink-muted">
            You can withdraw your consent at any time — contact your referring GP,
            {" "}{gpName}. Withdrawal stops further processing.
          </p>
        </Card>
      )}

      {/* Documents */}
      <Card>
        <CardTitle className="mb-2">Your documents</CardTitle>
        <ul className="flex flex-col gap-2">
          {documents.map((doc) => (
            <li
              key={doc.name}
              className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <FileText aria-hidden className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink">{doc.name}</span>
                <span className="block text-[13px] text-ink-secondary">{doc.type} · {doc.size}</span>
              </span>
              <Download aria-hidden className="size-4 text-ink-muted" />
            </li>
          ))}
        </ul>
      </Card>

      {/* Message timeline */}
      <Card>
        <CardTitle className="mb-1">Messages about your care</CardTitle>
        <p className="mb-4 flex items-center gap-1.5 text-[13px] text-ink-secondary">
          <MessageSquare aria-hidden className="size-3.5" />
          Between {gpName} (your GP) and {specialistName}.
        </p>
        <ol className="flex flex-col gap-3">
          {visibleMessages.map((m, i) => {
            const fromGp = m.direction === "outgoing";
            return (
              <li
                key={i}
                className={cn(
                  "rounded-card border border-line p-3.5",
                  fromGp ? "bg-card" : "bg-subtle",
                )}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ink">
                    {fromGp ? `${gpName} · your GP` : `${specialistName} · specialist`}
                  </span>
                  <span className="text-xs text-ink-muted">{m.time}</span>
                </div>
                {m.text && <p className="text-sm leading-relaxed text-ink-secondary">{m.text}</p>}
                {m.attachment && (
                  <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent">
                    <Paperclip aria-hidden className="size-3.5" />
                    {m.attachment.name}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {hiddenCount > 0 && (
          <p className="mt-3 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-muted">
            {hiddenCount} clinical note{hiddenCount > 1 ? "s are" : " is"} between your
            clinicians only and not shown here.
          </p>
        )}
      </Card>

      {!record && (
        <Card>
          <EmptyState
            icon={FileText}
            title="Referral details are being prepared"
            description="Your clinicians are setting up this referral. Check back shortly."
          />
        </Card>
      )}
    </div>
  );
}
