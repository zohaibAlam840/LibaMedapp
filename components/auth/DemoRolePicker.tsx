"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, ExternalLink, UserRound } from "lucide-react";
import type { Role } from "@/lib/rbac";
import { ROLE_LABEL, roleHome } from "@/lib/rbac";
import { DEMO_ROLE_COOKIE, DEMO_USERS, SWITCHABLE_ROLES } from "@/lib/demoRole";

// Demo launcher: pick a role to open the app as that person. Sets the role
// cookie and lands on the role's home. No real auth — one real /login for all
// roles is the production model (Vol III §0.1). Each row can also open in a new
// tab, so the different role experiences can be reviewed separately.

const BLURBS: Record<Role, string> = {
  public: "",
  referring: "UK doctor — create referrals, own your cases",
  receiving: "Named specialist — your queue at Sheba",
  coordinator: "Hospital ops — status & logistics only",
  caseManager: "LibaMed — oversee flow across corridors",
  admin: "Governance — audit, consent, configuration",
};

const COLORS: Record<Role, string> = {
  public: "bg-subtle text-ink-secondary",
  referring: "bg-accent-soft text-accent",
  receiving: "bg-warning-bg text-warning-text",
  coordinator: "bg-[#E0E7FF] text-[#4F46E5]",
  caseManager: "bg-[#CCFBF1] text-[#0F766E]",
  admin: "bg-success-bg text-success-text",
};

function initials(role: Role): string {
  return ROLE_LABEL[role]
    .split(/[\s/]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export default function DemoRolePicker({ locale }: { locale: string }) {
  const router = useRouter();

  function setRoleCookie(role: Role) {
    document.cookie = `${DEMO_ROLE_COOKIE}=${role}; path=/; max-age=31536000; samesite=lax`;
  }

  function enter(role: Role) {
    setRoleCookie(role);
    router.push(`/${locale}${roleHome(role)}`);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {SWITCHABLE_ROLES.map((role) => {
        const url = `/${locale}${roleHome(role)}`;
        return (
          <div
            key={role}
            className="group flex items-stretch overflow-hidden rounded-inner border border-line bg-card transition-colors hover:border-accent-border"
          >
            <button
              type="button"
              onClick={() => enter(role)}
              className="flex min-w-0 flex-1 items-center gap-3 p-3 text-start transition-colors hover:bg-accent-soft/40"
            >
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${COLORS[role]}`}
              >
                {initials(role)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink">
                  {ROLE_LABEL[role]}
                </span>
                <span className="block truncate text-[13px] text-ink-secondary">
                  {BLURBS[role]}
                </span>
              </span>
              <ArrowRight
                aria-hidden
                className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              />
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setRoleCookie(role)}
              aria-label={`Open ${ROLE_LABEL[role]} in a new tab`}
              title="Open in a new tab"
              className="flex shrink-0 items-center border-s border-line px-3 text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
            >
              <ExternalLink aria-hidden className="size-4" />
            </a>
          </div>
        );
      })}

      {/* Patient — a data subject, not a staff role. Read-only, one referral. */}
      <p className="mt-2 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
        Patient
      </p>
      <div className="group flex items-stretch overflow-hidden rounded-inner border border-line bg-card transition-colors hover:border-accent-border">
        <button
          type="button"
          onClick={() => {
            router.push(`/${locale}/portal`);
            router.refresh();
          }}
          className="flex min-w-0 flex-1 items-center gap-3 p-3 text-start transition-colors hover:bg-accent-soft/40"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-secondary">
            <UserRound aria-hidden className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium text-ink">
              Patient (read-only)
            </span>
            <span className="block truncate text-[13px] text-ink-secondary">
              View your own referral — status, consent & documents
            </span>
          </span>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </button>
        <a
          href={`/${locale}/portal`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the patient portal in a new tab"
          title="Open in a new tab"
          className="flex shrink-0 items-center border-s border-line px-3 text-ink-muted transition-colors hover:bg-subtle hover:text-ink"
        >
          <ExternalLink aria-hidden className="size-4" />
        </a>
      </div>
    </div>
  );
}
