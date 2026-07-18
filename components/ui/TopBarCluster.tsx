"use client";

import { Bell, Check, ChevronRight, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import IconButton from "@/components/ui/IconButton";
import type { Role } from "@/lib/rbac";
import { ROLE_LABEL, roleHome } from "@/lib/rbac";
import { DEMO_ROLE_COOKIE, DEMO_USERS, SWITCHABLE_ROLES } from "@/lib/demoRole";

const ROLE_COLORS: Record<Role, string> = {
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

/**
 * Top-right cluster (Vol III §2.6): notifications · settings · avatar menu with
 * the demo role switcher (all five roles) and the active-role indicator.
 * Switching writes the role cookie and lands on that role's home route.
 */
export default function TopBarCluster({
  locale,
  role,
}: {
  locale: string;
  role: Role;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const user = DEMO_USERS[role];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  function switchRole(next: Role) {
    document.cookie = `${DEMO_ROLE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.push(`/${locale}${roleHome(next)}`);
    router.refresh();
  }

  return (
    <div
      className="relative flex items-center gap-1 rounded-full bg-card p-1.5 shadow-card"
      ref={menuRef}
    >
      <IconButton aria-label="Notifications" size="sm" dot>
        <Bell aria-hidden className="size-4.5" />
      </IconButton>
      <Link
        href={`/${locale}/account`}
        aria-label="Settings"
        className="flex size-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
      >
        <Settings aria-hidden className="size-4.5" />
      </Link>

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Account and role switcher"
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Avatar name={user.name} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-72 rounded-card bg-card shadow-elevated ring-1 ring-line"
        >
          {/* Current user + role indicator */}
          <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
            <Avatar name={user.name} size="md" dot />
            <div className="min-w-0">
              <p className="truncate text-[14px] font-semibold text-ink">{user.name}</p>
              <p className="truncate text-[12px] text-ink-secondary">{user.scopeLabel}</p>
            </div>
          </div>

          {/* Demo role switcher — all five roles */}
          <div className="border-b border-line px-3 py-2">
            <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
              Demo — switch role
            </p>
            {SWITCHABLE_ROLES.map((r) => {
              const active = r === role;
              return (
                <button
                  key={r}
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => switchRole(r)}
                  className="flex w-full items-center gap-3 rounded-inner px-2 py-2.5 text-start transition-colors hover:bg-subtle"
                >
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${ROLE_COLORS[r]}`}
                  >
                    {initials(r)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{ROLE_LABEL[r]}</p>
                    <p className="truncate text-[11px] text-ink-secondary">
                      {DEMO_USERS[r].name}
                    </p>
                  </div>
                  {active ? (
                    <Check aria-hidden className="size-4 shrink-0 text-accent" />
                  ) : (
                    <ChevronRight
                      aria-hidden
                      className="size-3.5 shrink-0 text-ink-muted rtl:-scale-x-100"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Standard links */}
          <div className="px-3 py-2">
            <Link
              href={`/${locale}/account`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-inner px-2 py-2 text-[13px] text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
            >
              <UserRound aria-hidden className="size-4 shrink-0" />
              Profile &amp; settings
            </Link>
            <Link
              href={`/${locale}/account/sessions`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-inner px-2 py-2 text-[13px] text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
            >
              <Settings aria-hidden className="size-4 shrink-0" />
              Sessions &amp; devices
            </Link>
          </div>

          <div className="border-t border-line px-3 py-2">
            <Link
              href={`/${locale}/login`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-inner px-2 py-2 text-[13px] text-danger-text transition-colors hover:bg-danger-bg"
            >
              <LogOut aria-hidden className="size-4 shrink-0" />
              Sign out
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
