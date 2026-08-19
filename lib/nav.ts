// Role → sidebar navigation (Vol III Part 2). Single source consumed by both
// the desktop icon rail and the mobile tab bar, so nav and access never drift.
// hrefs point at existing routes (no /dashboard or /queue duplicates).

import {
  AlertTriangle,
  BadgeCheck,
  Archive,
  Building2,
  FileCheck,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  Globe,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  ShieldCheck,
  Stethoscope,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/rbac";

export interface NavItem {
  href: string;
  label: string;
  /** Shorter label for the mobile tab bar (falls back to `label`). */
  short?: string;
  icon: LucideIcon;
  /**
   * Unread/new count. NOT set in this table — the counts are per user, so they
   * are computed in the app layout and passed in as an overrides map. Fixed
   * numbers here showed every clinician the same "2" regardless of their queue.
   */
  badge?: number;
  /** Group heading for the admin rail separators. */
  group?: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  referring: [
    { href: "/referring", label: "Dashboard", short: "Home", icon: LayoutDashboard },
    { href: "/referring/intake/patient", label: "New referral", short: "New", icon: FilePlus },
    { href: "/referring/cases", label: "My cases", short: "Cases", icon: Folder },
    { href: "/referring/messages", label: "Messages", short: "Messages", icon: MessageSquare },
    { href: "/referring/consent", label: "Consent", short: "Consent", icon: ShieldCheck },
  ],
  receiving: [
    { href: "/receiving", label: "My queue", short: "Queue", icon: Inbox },
    { href: "/receiving/cases", label: "Active cases", short: "Cases", icon: FolderOpen },
    { href: "/receiving/messages", label: "Messages", short: "Messages", icon: MessageSquare },
    { href: "/receiving/responses", label: "Responses", short: "Replies", icon: FileCheck },
  ],
  coordinator: [
    { href: "/receiving/coordinator", label: "Overview", short: "Overview", icon: LayoutDashboard },
    { href: "/receiving", label: "Hospital queue", short: "Queue", icon: Inbox },
    { href: "/receiving/specialists", label: "Specialists", short: "Staff", icon: Users },
    { href: "/receiving/overdue", label: "Overdue", short: "Overdue", icon: AlertTriangle },
  ],
  caseManager: [
    { href: "/admin", label: "Dashboard", short: "Home", icon: LayoutDashboard },
    { href: "/admin/cases", label: "All cases", short: "Cases", icon: Folder },
    { href: "/admin/corridors", label: "Corridors", short: "Corridors", icon: Globe },
    { href: "/admin/hospitals", label: "Hospitals", short: "Hospitals", icon: Building2 },
    { href: "/admin/attention", label: "Attention", short: "Alerts", icon: AlertTriangle },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", short: "Home", icon: LayoutDashboard, group: "Operate" },
    { href: "/admin/cases", label: "Cases", short: "Cases", icon: Folder, group: "Operate" },
    { href: "/admin/hospitals", label: "Hospitals", short: "Hospitals", icon: Building2, group: "Configure" },
    { href: "/admin/clinicians", label: "Clinicians", short: "Staff", icon: Stethoscope, group: "Configure" },
    { href: "/admin/corridors", label: "Corridors", short: "Corridors", icon: Globe, group: "Configure" },
    { href: "/admin/content", label: "Help & glossary", short: "Help", icon: HelpCircle, group: "Configure" },
    { href: "/admin/verification", label: "Verification", short: "Verify", icon: BadgeCheck, group: "Govern" },
    { href: "/admin/users", label: "Users & roles", short: "Users", icon: Users, group: "Govern" },
    { href: "/admin/audit", label: "Audit log", short: "Audit", icon: ScrollText, group: "Govern" },
    { href: "/admin/consent", label: "Consent", short: "Consent", icon: FileCheck, group: "Govern" },
    { href: "/admin/retention", label: "Retention & DSAR", short: "Data", icon: Archive, group: "Govern" },
  ],
  // Public shell isn't used inside the app; fall back to referring nav.
  public: [
    { href: "/referring", label: "Dashboard", short: "Home", icon: LayoutDashboard },
    { href: "/hospitals", label: "Hospitals", icon: Building2 },
    { href: "/faq", label: "Help", icon: FileText },
  ],
};

export function navForRole(role: Role): NavItem[] {
  return NAV_BY_ROLE[role] ?? NAV_BY_ROLE.referring;
}

/**
 * Mobile tab bar respects a hard 5-item cap (Vol III Part 4). More than five
 * items → first four tabs plus a "More" entry holding the remainder.
 */
export function mobileTabs(items: NavItem[]): {
  tabs: NavItem[];
  overflow: NavItem[];
} {
  if (items.length <= 5) return { tabs: items, overflow: [] };
  return { tabs: items.slice(0, 4), overflow: items.slice(4) };
}

/**
 * Per-user counts for the sidebar badges, keyed by nav href.
 *
 * Computed from the caller's own scoped cases, so a badge always matches what
 * that person will actually find when they click it. Only counts we can state
 * exactly are returned — a role with nothing countable gets no badge rather
 * than a decorative number.
 */
export function navBadgesFor(
  role: Role,
  cases: { status: string; unread?: number }[],
): Record<string, number> {
  const unread = cases.reduce((n, c) => n + (c.unread ?? 0), 0);
  const awaiting = cases.filter((c) => c.status === "submitted").length;

  switch (role) {
    case "referring":
      return unread > 0 ? { "/referring/messages": unread } : {};
    case "receiving":
      return {
        ...(awaiting > 0 ? { "/receiving": awaiting } : {}),
        ...(unread > 0 ? { "/receiving/messages": unread } : {}),
      };
    case "coordinator":
      return awaiting > 0 ? { "/receiving": awaiting } : {};
    default:
      return {};
  }
}
