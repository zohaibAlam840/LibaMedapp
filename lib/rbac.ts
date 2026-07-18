// RBAC — single source of truth (Vol III Part 4/§0). Every page and data fetch
// should call `can()`; never scatter role checks through components. There is
// ONE login for all roles; the app redirects to the role's home after auth.

import type { Role } from "@/lib/routes";

export type { Role };

export const ROLE_LABEL: Record<Role, string> = {
  public: "Public",
  referring: "Referring clinician",
  receiving: "Receiving clinician",
  coordinator: "Hospital coordinator",
  caseManager: "LibaMed case manager",
  admin: "Compliance / admin",
};

/**
 * Post-login landing route by role (Vol III §0.3). Uses the existing routes —
 * `/referring`, `/receiving`, `/admin` — rather than inventing /dashboard or
 * /queue duplicates.
 */
export const ROLE_HOME: Record<Role, string> = {
  public: "/",
  referring: "/referring",
  receiving: "/receiving",
  coordinator: "/receiving/coordinator",
  caseManager: "/admin",
  admin: "/admin",
};

export function roleHome(role: Role): string {
  return ROLE_HOME[role] ?? "/";
}

/**
 * A user is a role plus scoping ATTRIBUTES (Vol III §0.4) — not extra roles:
 * `hospitalId` (org scope), `corridorIds` (scoped manager), and elevated-admin
 * flags. Never invent more roles; these fields cover the real-world cases.
 */
export interface DemoUser {
  role: Role;
  name: string;
  /** Shown in the role indicator (role + scope). */
  scopeLabel: string;
  hospitalId?: string;
  corridorIds?: string[];
  canManageUsers?: boolean;
  canExportAudit?: boolean;
  canEditCorridors?: boolean;
}

// Action permissions (Vol III Part 4).
export type Permission =
  | "case.create"
  | "document.upload"
  | "document.download"
  | "consent.capture"
  | "consent.withdraw"
  | "message.send"
  | "plan.submit"
  | "info.request"
  | "summary.submit"
  | "plan.confirm"
  | "case.reassign"
  | "access.extend"
  | "hospital.edit"
  | "clinician.edit"
  | "corridor.config"
  | "user.manage"
  | "audit.export"
  | "dsar.run"
  | "session.revokeOthers";

const MATRIX: Record<Role, Permission[]> = {
  public: [],
  referring: [
    "case.create",
    "document.upload",
    "document.download",
    "consent.capture",
    "consent.withdraw",
    "message.send",
    "plan.confirm",
  ],
  receiving: [
    "document.upload",
    "document.download",
    "message.send",
    "plan.submit",
    "info.request",
    "summary.submit",
  ],
  coordinator: [],
  caseManager: ["case.reassign", "access.extend"],
  admin: [
    // admin document/consent actions are permitted but audited + reason-gated
    "document.download",
    "consent.withdraw",
    "case.reassign",
    "access.extend",
    "hospital.edit",
    "clinician.edit",
    "corridor.config",
    "user.manage",
    "audit.export",
    "dsar.run",
    "session.revokeOthers",
  ],
};

/** Whether a role (with its elevated-admin flags) may perform an action. */
export function can(user: DemoUser, permission: Permission): boolean {
  if (!MATRIX[user.role]?.includes(permission)) return false;
  if (user.role === "admin") {
    if (permission === "user.manage" && user.canManageUsers === false) return false;
    if (permission === "audit.export" && user.canExportAudit === false) return false;
    if (permission === "corridor.config" && user.canEditCorridors === false) return false;
  }
  return true;
}
