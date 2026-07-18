// Role → sidebar navigation (Vol III Part 2). Single source consumed by both
// the desktop icon rail and the mobile tab bar, so nav and access never drift.
// hrefs point at existing routes (no /dashboard or /queue duplicates).

import {
  AlertTriangle,
  Archive,
  Building2,
  FileCheck,
  FilePlus,
  FileText,
  Folder,
  FolderOpen,
  Globe,
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
  icon: LucideIcon;
  /** Unread/new count badge. */
  badge?: number;
  /** Group heading for the admin rail separators. */
  group?: string;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  referring: [
    { href: "/referring", label: "Dashboard", icon: LayoutDashboard },
    { href: "/referring/intake/patient", label: "New referral", icon: FilePlus },
    { href: "/referring/cases", label: "My cases", icon: Folder },
    { href: "/referring/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/referring/consent", label: "Consent", icon: ShieldCheck },
  ],
  receiving: [
    { href: "/receiving", label: "My queue", icon: Inbox, badge: 2 },
    { href: "/receiving/cases", label: "Active cases", icon: FolderOpen },
    { href: "/receiving/messages", label: "Messages", icon: MessageSquare, badge: 1 },
    { href: "/receiving/responses", label: "Responses", icon: FileCheck },
  ],
  coordinator: [
    { href: "/receiving/coordinator", label: "Overview", icon: LayoutDashboard },
    { href: "/receiving", label: "Hospital queue", icon: Inbox },
    { href: "/receiving/specialists", label: "Specialists", icon: Users },
    { href: "/receiving/overdue", label: "Overdue", icon: AlertTriangle, badge: 1 },
  ],
  caseManager: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/cases", label: "All cases", icon: Folder },
    { href: "/admin/corridors", label: "Corridors", icon: Globe },
    { href: "/admin/hospitals", label: "Hospitals", icon: Building2 },
    { href: "/admin/attention", label: "Attention", icon: AlertTriangle, badge: 3 },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, group: "Operate" },
    { href: "/admin/cases", label: "Cases", icon: Folder, group: "Operate" },
    { href: "/admin/hospitals", label: "Hospitals", icon: Building2, group: "Configure" },
    { href: "/admin/clinicians", label: "Clinicians", icon: Stethoscope, group: "Configure" },
    { href: "/admin/corridors", label: "Corridors", icon: Globe, group: "Configure" },
    { href: "/admin/users", label: "Users & roles", icon: Users, group: "Govern" },
    { href: "/admin/audit", label: "Audit log", icon: ScrollText, group: "Govern" },
    { href: "/admin/consent", label: "Consent", icon: FileCheck, group: "Govern" },
    { href: "/admin/retention", label: "Retention & DSAR", icon: Archive, group: "Govern" },
  ],
  // Public shell isn't used inside the app; fall back to referring nav.
  public: [
    { href: "/referring", label: "Dashboard", icon: LayoutDashboard },
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
