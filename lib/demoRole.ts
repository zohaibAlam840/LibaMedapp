// Demo-mode role model. A cookie holds the active demo role so the whole shell
// (nav, dashboard, role indicator) re-renders for whichever of the five roles
// the owner picks — no need for five real accounts (Vol III §6.5).
//
// NOT an auth system: real access control is enforced server-side per route.

import type { Role, DemoUser } from "@/lib/rbac";

export const DEMO_ROLE_COOKIE = "libamed_demo_role";
export const DEMO_ROLE_SIDEBAR_COOKIE = "libamed_sidebar";

/** Roles the demo switcher can assume (excludes "public"). */
export const SWITCHABLE_ROLES: Role[] = [
  "referring",
  "receiving",
  "coordinator",
  "caseManager",
  "admin",
];

export const DEMO_USERS: Record<Role, DemoUser> = {
  public: { role: "public", name: "Guest", scopeLabel: "Not signed in" },
  referring: {
    role: "referring",
    name: "Dr. Amara Chen",
    scopeLabel: "Referring clinician · GMC 7654321",
  },
  receiving: {
    role: "receiving",
    name: "Dr. Noa Peretz",
    scopeLabel: "Receiving clinician · Sheba Medical Center",
    hospitalId: "sheba",
  },
  coordinator: {
    role: "coordinator",
    name: "Yael Adler",
    scopeLabel: "Coordinator · Sheba Medical Center",
    hospitalId: "sheba",
  },
  caseManager: {
    role: "caseManager",
    name: "Jordan Ellis",
    scopeLabel: "Case manager · all corridors",
  },
  admin: {
    role: "admin",
    name: "Sam Okafor",
    scopeLabel: "Compliance / admin",
    canManageUsers: true,
    canExportAudit: true,
    canEditCorridors: true,
  },
};

export function parseRole(value: string | undefined): Role {
  if (value && (SWITCHABLE_ROLES as string[]).includes(value)) return value as Role;
  return "referring";
}
