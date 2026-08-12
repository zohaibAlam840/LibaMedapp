import { BadgeCheck, Building2, ExternalLink, ShieldX, Undo2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import SubmitButton from "@/components/ui/SubmitButton";
import { decideRegistrationAction } from "@/lib/adminActions";
import { formatDate } from "@/lib/db/format";
import type { PendingAccount } from "@/lib/db/users";

// Public registers an admin checks the number against by hand. There is no free
// API for either, so we link straight to the search page instead of pretending
// to verify automatically.
const GMC_REGISTER = "https://www.gmc-uk.org/registration-and-licensing/the-medical-register";
const FCA_REGISTER = "https://register.fca.org.uk/s/";

/** One registration awaiting (or holding) a verification decision. */
export default function RegistrationRow({
  account,
  locale,
}: {
  account: PendingAccount;
  locale: string;
}) {
  const isIntroducer = account.accountType === "introducer";
  const number = isIntroducer ? account.fcaNumber : account.gmcNumber;
  const registerUrl = isIntroducer ? FCA_REGISTER : GMC_REGISTER;
  const numberLabel = isIntroducer ? "FCA" : "GMC";

  return (
    <li className="flex flex-col gap-3 rounded-inner border border-line p-4">
      <div className="flex items-start gap-3">
        <Avatar name={account.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-ink">{account.name}</p>
          <p className="truncate text-[13px] text-ink-secondary">{account.email}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-secondary">
            <span className="font-medium text-ink">
              {isIntroducer ? "Introducer" : "Referring clinician"}
            </span>
            {account.company && (
              <span className="inline-flex items-center gap-1">
                <Building2 aria-hidden className="size-3.5" />
                {account.company}
              </span>
            )}
            {account.jobTitle && <span>{account.jobTitle}</span>}
            <span>Applied {formatDate(account.createdAt)}</span>
          </div>
        </div>
        {account.status !== "pending" && (
          <span
            className={
              account.status === "verified"
                ? "shrink-0 rounded-full bg-success-bg px-2.5 py-1 text-[11px] font-semibold text-success-text"
                : "shrink-0 rounded-full bg-danger-bg px-2.5 py-1 text-[11px] font-semibold text-danger-text"
            }
          >
            {account.status === "verified" ? "Verified" : "Declined"}
          </span>
        )}
      </div>

      {/* The number to check, and where to check it */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-inner bg-subtle px-3.5 py-2.5">
        <p className="text-[13px] text-ink-secondary">
          {numberLabel} number:{" "}
          {number ? (
            <b className="font-mono text-[14px] text-ink">{number}</b>
          ) : isIntroducer && account.regStatus === "employer" ? (
            <b className="text-ink">Not FCA-regulated — employer-verified</b>
          ) : (
            <b className="text-warning-text">Not supplied</b>
          )}
        </p>
        <a
          href={registerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
        >
          Open the {numberLabel} register
          <ExternalLink aria-hidden className="size-3.5" />
        </a>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        {account.status === "pending" ? (
          <>
            <form action={decideRegistrationAction}>
              <input type="hidden" name="profileId" value={account.id} />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="decision" value="declined" />
              <SubmitButton variant="danger" size="sm" pendingLabel="Declining…">
                <ShieldX aria-hidden className="size-4" />
                Decline
              </SubmitButton>
            </form>
            <form action={decideRegistrationAction}>
              <input type="hidden" name="profileId" value={account.id} />
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="decision" value="verified" />
              <SubmitButton size="sm" pendingLabel="Approving…">
                <BadgeCheck aria-hidden className="size-4" />
                Approve
              </SubmitButton>
            </form>
          </>
        ) : (
          <form action={decideRegistrationAction}>
            <input type="hidden" name="profileId" value={account.id} />
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="decision" value="pending" />
            <SubmitButton variant="secondary" size="sm" pendingLabel="Reopening…">
              <Undo2 aria-hidden className="size-4" />
              Reopen
            </SubmitButton>
          </form>
        )}
      </div>
    </li>
  );
}
