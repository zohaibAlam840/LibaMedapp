"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  LogOut,
  MoreHorizontal,
  Settings,
  X,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import type { Role } from "@/lib/rbac";
import { ROLE_LABEL } from "@/lib/rbac";
import { DEMO_USERS, DEMO_ROLE_SIDEBAR_COOKIE } from "@/lib/demoRole";
import { navForRole, mobileTabs, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/cn";

// App-shell navigation (Vol III Part 2 + expandable sidebar). Generated from
// lib/nav.ts, filtered by the active demo role. Desktop = a labelled sidebar
// that collapses to an icon rail (choice persisted in a cookie); mobile = a
// bottom tab bar capped at 5 with a "More" sheet.

function useActive(locale: string) {
  const pathname = usePathname() ?? "";
  return (href: string) =>
    pathname === `/${locale}${href}` || pathname.startsWith(`/${locale}${href}/`);
}

function CountBadge({ count, floating }: { count: number; floating?: boolean }) {
  return (
    <span
      className={cn(
        "flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white",
        floating && "absolute -end-0.5 -top-0.5 min-w-4 px-1 ring-2 ring-card",
      )}
    >
      {count}
    </span>
  );
}

/** Desktop sidebar: collapses between a 256px labelled panel and a 72px rail. */
export function Sidebar({
  locale,
  role,
  defaultCollapsed,
}: {
  locale: string;
  role: Role;
  defaultCollapsed: boolean;
}) {
  const items = navForRole(role);
  const isActive = useActive(locale);
  const user = DEMO_USERS[role];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${DEMO_ROLE_SIDEBAR_COOKIE}=${next ? "collapsed" : "expanded"}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-e border-line bg-card transition-[width] duration-200 md:flex",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      {/* Brand + collapse toggle */}
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-4",
          collapsed ? "flex-col" : "justify-between",
        )}
      >
        <Link
          href={`/${locale}`}
          aria-label="LibaMed home"
          className="flex items-center gap-2.5"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-semibold text-white">
            L
          </span>
          {!collapsed && <span className="text-lg font-semibold text-ink">LibaMed</span>}
        </Link>
        <button
          type="button"
          onClick={toggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
          className="flex size-8 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
        >
          {collapsed ? (
            <ChevronRight aria-hidden className="size-4 rtl:-scale-x-100" />
          ) : (
            <ChevronLeft aria-hidden className="size-4 rtl:-scale-x-100" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav
        aria-label="Main"
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-2"
      >
        {items.map((item, i) => {
          const prev = items[i - 1];
          const newGroup = item.group && (!prev || prev.group !== item.group);
          return (
            <div key={item.href}>
              {newGroup && !collapsed && (
                <p className="px-3 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                  {item.group}
                </p>
              )}
              {newGroup && collapsed && i > 0 && (
                <span aria-hidden className="mx-auto my-2 block h-px w-6 bg-line" />
              )}
              <SidebarLink
                locale={locale}
                item={item}
                active={isActive(item.href)}
                collapsed={collapsed}
              />
            </div>
          );
        })}
      </nav>

      {/* Role indicator */}
      {!collapsed && (
        <div className="mx-2.5 mb-1 flex items-center gap-2.5 rounded-inner bg-subtle px-2.5 py-2">
          <Avatar name={user.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-ink">
              {ROLE_LABEL[role]}
            </span>
            <span className="block truncate text-[11px] text-ink-secondary">
              {user.name}
            </span>
          </span>
        </div>
      )}

      {/* Utilities */}
      <div className="flex flex-col gap-0.5 border-t border-line px-2.5 py-2">
        <UtilLink locale={locale} href="/faq" label="Help & glossary" icon={HelpCircle} collapsed={collapsed} />
        <UtilLink locale={locale} href="/account" label="Settings" icon={Settings} collapsed={collapsed} />
        <UtilLink locale={locale} href="/login" label="Sign out" icon={LogOut} collapsed={collapsed} danger />
      </div>
    </aside>
  );
}

function SidebarLink({
  locale,
  item,
  active,
  collapsed,
}: {
  locale: string;
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  if (collapsed) {
    return (
      <Link
        href={`/${locale}${item.href}`}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative mx-auto flex size-11 items-center justify-center rounded-full transition-colors",
          active ? "bg-navy text-white" : "text-ink-secondary hover:bg-subtle hover:text-ink",
        )}
      >
        <Icon aria-hidden className="size-5" />
        {item.badge ? <CountBadge count={item.badge} floating /> : null}
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}${item.href}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-inner px-3 py-2.5 text-[15px] transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-ink-secondary hover:bg-subtle hover:text-ink",
      )}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? <CountBadge count={item.badge} /> : null}
    </Link>
  );
}

function UtilLink({
  locale,
  href,
  label,
  icon: Icon,
  collapsed,
  danger,
}: {
  locale: string;
  href: string;
  label: string;
  icon: typeof HelpCircle;
  collapsed: boolean;
  danger?: boolean;
}) {
  return (
    <Link
      href={`/${locale}${href}`}
      title={collapsed ? label : undefined}
      aria-label={label}
      className={cn(
        "flex items-center gap-3 rounded-inner px-3 py-2.5 text-[15px] transition-colors",
        collapsed && "mx-auto size-11 justify-center px-0",
        danger
          ? "text-danger-text hover:bg-danger-bg"
          : "text-ink-secondary hover:bg-subtle hover:text-ink",
      )}
    >
      <Icon aria-hidden className="size-5 shrink-0" />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
    </Link>
  );
}

/** Mobile bottom tab bar — 5-cap with a More sheet for the remainder. */
export function BottomTabs({ locale, role }: { locale: string; role: Role }) {
  const items = navForRole(role);
  const { tabs, overflow } = mobileTabs(items);
  const isActive = useActive(locale);
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {tabs.map((item) => (
          <TabLink key={item.href} locale={locale} item={item} active={isActive(item.href)} />
        ))}
        {overflow.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-label="More"
            aria-expanded={moreOpen}
            className="flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[11px] text-ink-secondary"
          >
            <MoreHorizontal aria-hidden className="size-5" />
            <span className="w-full truncate text-center">More</span>
          </button>
        )}
      </nav>

      {moreOpen && overflow.length > 0 && (
        <div
          className="fixed inset-0 z-30 flex flex-col justify-end bg-black/30 md:hidden"
          onClick={() => setMoreOpen(false)}
        >
          <div
            role="dialog"
            aria-label="More navigation"
            className="rounded-t-panel bg-card p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[15px] font-semibold text-ink">More</span>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="flex size-9 items-center justify-center rounded-full text-ink-secondary hover:bg-subtle"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="flex flex-col">
              {overflow.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-inner px-3 py-3 text-[15px]",
                      isActive(item.href)
                        ? "bg-accent-soft font-medium text-accent"
                        : "text-ink hover:bg-subtle",
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                    {item.label}
                    {item.badge ? (
                      <span className="ms-auto">
                        <CountBadge count={item.badge} />
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TabLink({
  locale,
  item,
  active,
}: {
  locale: string;
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={`/${locale}${item.href}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-14 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-0.5 text-[11px]",
        active ? "font-medium text-accent" : "text-ink-secondary",
      )}
    >
      <span className="relative">
        <Icon aria-hidden className="size-5" />
        {item.badge ? <CountBadge count={item.badge} floating /> : null}
      </span>
      <span className="w-full truncate text-center">{item.short ?? item.label}</span>
    </Link>
  );
}
