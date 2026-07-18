import { BadgeCheck, Globe2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * CorridorBadge (design spec V2 §2.21): neutral pill — 2-letter code chip +
 * corridor name + optional muted residency note. Corridors are not statuses.
 */
export function CorridorBadge({
  code,
  label,
  residency,
  className,
}: {
  /** 2-letter destination code, e.g. "IL". */
  code: string;
  label: string;
  /** e.g. "EEA · HDS" */
  residency?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border border-line bg-card px-3 text-[13px] text-ink",
        className,
      )}
    >
      <span className="flex size-5 items-center justify-center rounded-full bg-accent-soft text-[10px] font-semibold text-accent">
        {code}
      </span>
      {label}
      {residency && <span className="text-xs text-ink-muted">{residency}</span>}
    </span>
  );
}

type AccreditationState = "valid" | "expiring" | "expired";

const ACCREDITATION_STYLES: Record<AccreditationState, string> = {
  valid: "border-line bg-card text-ink",
  expiring: "border-warning-bg bg-warning-bg text-warning-text",
  expired: "border-danger-bg bg-danger-bg text-danger-text",
};

/**
 * AccreditationBadge (design spec V2 §2.22): outline chip — body + expiry.
 * Expiring within 90 days = warning; expired = danger.
 */
export function AccreditationBadge({
  body,
  expires,
  state = "valid",
  className,
}: {
  body: string;
  expires: string;
  state?: AccreditationState;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium",
        ACCREDITATION_STYLES[state],
        className,
      )}
    >
      <BadgeCheck aria-hidden className="size-3.5" />
      {body}
      <span className={cn("font-normal", state === "valid" && "text-ink-muted")}>
        · {state === "expired" ? "expired" : "to"} {expires}
      </span>
    </span>
  );
}

/** Icon-flavoured neutral pill for security/data facts (AES-256, TLS 1.3…). */
export function FactPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full bg-subtle px-3.5 text-[13px] font-medium text-ink",
        className,
      )}
    >
      <Globe2 aria-hidden className="size-4 text-accent" />
      {children}
    </span>
  );
}
