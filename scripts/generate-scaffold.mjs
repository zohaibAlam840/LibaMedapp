// LibaMed V1 scaffold generator.
//
// Authoritative source for the 67-page V1 route table (PROJECT_CONTEXT.md §9).
// Running this script emits:
//   1. lib/routes.ts        — the runtime route manifest (source of truth for nav + coverage)
//   2. app/[locale]/**/page.tsx — one placeholder page per route
//
// Special files (not-found.tsx, error.tsx) are hand-written and only listed in
// the manifest here (special: true) — this script does not overwrite them.
//
// Re-run:  node scripts/generate-scaffold.mjs

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const LOCALE_DIR = join(ROOT, "app", "[locale]");

// r(id, title, section, group, path, file, tier, roles, tests, extra)
const r = (id, title, section, group, path, file, tier, roles, tests = [], extra = {}) => ({
  id, title, section, group, path, file, tier, roles,
  ...(tests.length ? { tests } : {}),
  ...extra,
});

const ANY_AUTH = ["referring", "receiving", "coordinator", "caseManager", "admin"];

const ROUTES = [
  // ── A. Public site + legal/policy (16) — §9A ──────────────────────────────
  r("public.home", "Home / landing", "9A", "public", "/", "(public)/page.tsx", "must", ["public"]),
  r("public.how-it-works", "How it works", "9A", "public", "/how-it-works", "(public)/how-it-works/page.tsx", "must", ["public"]),
  r("public.pledge", "The LibaMed Pledge", "9A", "public", "/pledge", "(public)/pledge/page.tsx", "must", ["public"]),
  r("public.specialties", "Specialties directory", "9A", "public", "/specialties", "(public)/specialties/page.tsx", "must", ["public"]),
  r("public.hospitals", "Partner hospitals list", "9A", "public", "/hospitals", "(public)/hospitals/page.tsx", "must", ["public"]),
  r("public.hospital-profile", "Hospital profile (data-driven template)", "9A", "public", "/hospitals/[hospitalId]", "(public)/hospitals/[hospitalId]/page.tsx", "must", ["public"]),
  r("public.for-clinicians", "For clinicians (info + register entry)", "9A", "public", "/for-clinicians", "(public)/for-clinicians/page.tsx", "must", ["public"]),
  r("public.contact", "Contact", "9A", "public", "/contact", "(public)/contact/page.tsx", "must", ["public"]),
  r("public.faq", "FAQ + glossary", "9A", "public", "/faq", "(public)/faq/page.tsx", "must", ["public"]),
  r("public.privacy", "Privacy policy", "9A", "public", "/legal/privacy", "(public)/legal/privacy/page.tsx", "must", ["public"]),
  r("public.cookies", "Cookie policy (+ consent banner)", "9A", "public", "/legal/cookies", "(public)/legal/cookies/page.tsx", "must", ["public"]),
  r("public.terms", "Terms of service", "9A", "public", "/legal/terms", "(public)/legal/terms/page.tsx", "must", ["public"]),
  r("public.acceptable-use", "Acceptable use policy", "9A", "public", "/legal/acceptable-use", "(public)/legal/acceptable-use/page.tsx", "must", ["public"]),
  r("public.accessibility", "Accessibility statement", "9A", "public", "/legal/accessibility", "(public)/legal/accessibility/page.tsx", "must", ["public"], [], { note: "WCAG 2.2 AA is the floor (§8.4)." }),
  r("public.security", "Security / trust page", "9A", "public", "/security", "(public)/security/page.tsx", "must", ["public"]),
  r("public.sub-processors", "Data processing / sub-processors", "9A", "public", "/legal/sub-processors", "(public)/legal/sub-processors/page.tsx", "must", ["public"]),

  // ── B. Auth & account (9 here; account 3 live under the app shell) — §9B ───
  r("auth.register", "Register", "9B", "auth", "/register", "(auth)/register/page.tsx", "must", ["public"], [1]),
  r("auth.gmc-verification", "GMC verification step", "9B", "auth", "/register/gmc-verification", "(auth)/register/gmc-verification/page.tsx", "must", ["public"], [1], { note: "OPEN QUESTION (§6.1): confirm GMC verification method — no obvious public GMC API. Gates the entire referring-clinician flow." }),
  r("auth.login", "Login", "9B", "auth", "/login", "(auth)/login/page.tsx", "must", ["public"]),
  r("auth.mfa-enrolment", "MFA enrolment", "9B", "auth", "/mfa/enrolment", "(auth)/mfa/enrolment/page.tsx", "must", ["public"], [], { note: "MFA required for all clinician + admin accounts (§7.4)." }),
  r("auth.mfa-challenge", "MFA challenge", "9B", "auth", "/mfa/challenge", "(auth)/mfa/challenge/page.tsx", "must", ["public"]),
  r("auth.forgot-password", "Forgot password", "9B", "auth", "/forgot-password", "(auth)/forgot-password/page.tsx", "must", ["public"]),
  r("auth.reset-password", "Reset password", "9B", "auth", "/reset-password", "(auth)/reset-password/page.tsx", "must", ["public"]),
  r("auth.verify-email", "Email verification", "9B", "auth", "/verify-email", "(auth)/verify-email/page.tsx", "must", ["public"]),
  r("auth.account-pending", "Account pending / under review", "9B", "auth", "/account-pending", "(auth)/account-pending/page.tsx", "must", ["public"]),

  // account pages (still §9B) — live inside the authenticated app shell
  r("account.profile", "Profile & settings", "9B", "account", "/account", "(app)/account/page.tsx", "must", ANY_AUTH),
  r("account.sessions", "Session & device management (view + revoke)", "9B", "account", "/account/sessions", "(app)/account/sessions/page.tsx", "must", ANY_AUTH, [], { note: "Users can see and revoke active sessions (§7.4)." }),
  r("account.notifications", "Notification preferences", "9B", "account", "/account/notifications", "(app)/account/notifications/page.tsx", "should", ANY_AUTH, [], { note: "Notifications are Should-Have / V1.5 (§8.5). Shell scaffolded now; preferences only." }),

  // ── C. Referring clinician portal (13) — §9C ──────────────────────────────
  r("referring.dashboard", "Dashboard (all cases, filterable)", "9C", "referring", "/referring", "(app)/referring/page.tsx", "must", ["referring"], [2]),
  r("referring.intake.patient", "Intake wizard — step 1: patient details", "9C", "referring", "/referring/intake/patient", "(app)/referring/intake/patient/page.tsx", "must", ["referring"], [2]),
  r("referring.intake.clinical", "Intake wizard — step 2: clinical summary", "9C", "referring", "/referring/intake/clinical", "(app)/referring/intake/clinical/page.tsx", "must", ["referring"], [2]),
  r("referring.intake.corridor", "Intake wizard — step 3: corridor + specialty", "9C", "referring", "/referring/intake/corridor", "(app)/referring/intake/corridor/page.tsx", "must", ["referring"], [2, 4], { note: "Selecting the corridor sets the case data-residency region automatically (§2.1/§7.1)." }),
  r("referring.intake.documents", "Intake wizard — step 4: document / DICOM upload", "9C", "referring", "/referring/intake/documents", "(app)/referring/intake/documents/page.tsx", "must", ["referring"], [3], { note: "Large/DICOM uploads go direct to object storage via presigned, resumable URLs (§2.5). No DICOM viewer in V1." }),
  r("referring.intake.consent", "Intake wizard — step 5: itemised consent", "9C", "referring", "/referring/intake/consent", "(app)/referring/intake/consent/page.tsx", "must", ["referring"], [2, 7], { note: "Itemised, versioned, immutable consent — not a checkbox (§7.3)." }),
  r("referring.intake.review", "Intake wizard — step 6: review & submit", "9C", "referring", "/referring/intake/review", "(app)/referring/intake/review/page.tsx", "must", ["referring"], [2]),
  r("referring.case-created", "Case created confirmation", "9C", "referring", "/referring/intake/confirmation", "(app)/referring/intake/confirmation/page.tsx", "must", ["referring"], [2]),
  r("referring.case-detail", "Case detail (status tracker + documents)", "9C", "referring", "/referring/cases/[caseId]", "(app)/referring/cases/[caseId]/page.tsx", "must", ["referring"], [3, 4]),
  r("referring.messages", "Secure messaging thread", "9C", "referring", "/referring/cases/[caseId]/messages", "(app)/referring/cases/[caseId]/messages/page.tsx", "must", ["referring"], [6]),
  r("referring.treatment-plan", "Treatment plan received view", "9C", "referring", "/referring/cases/[caseId]/treatment-plan", "(app)/referring/cases/[caseId]/treatment-plan/page.tsx", "must", ["referring"], [5]),
  r("referring.consent", "Consent view + withdrawal flow", "9C", "referring", "/referring/cases/[caseId]/consent", "(app)/referring/cases/[caseId]/consent/page.tsx", "must", ["referring"], [7], { note: "Withdrawal triggers the defined stop-processing workflow, logged immutably (§7.3)." }),
  r("referring.summary", "Clinical summary handback view", "9C", "referring", "/referring/cases/[caseId]/summary", "(app)/referring/cases/[caseId]/summary/page.tsx", "must", ["referring"], [8]),

  // ── D. Receiving clinician / hospital portal (8) — §9D ─────────────────────
  r("receiving.queue", "Incoming case queue (named specialist, never shared inbox)", "9D", "receiving", "/receiving", "(app)/receiving/page.tsx", "must", ["receiving"], [4], { note: "Cases route to a NAMED specialist queue — never a shared inbox (§8.2)." }),
  r("receiving.case-detail", "Case detail + document access", "9D", "receiving", "/receiving/cases/[caseId]", "(app)/receiving/cases/[caseId]/page.tsx", "must", ["receiving"], [3]),
  r("receiving.dicom", "DICOM download view", "9D", "receiving", "/receiving/cases/[caseId]/dicom", "(app)/receiving/cases/[caseId]/dicom/page.tsx", "must", ["receiving"], [3], { note: "V1 = secure DICOM download/upload only; viewer deferred to V2 (§2.5)." }),
  r("receiving.treatment-plan", "Treatment plan response template", "9D", "receiving", "/receiving/cases/[caseId]/treatment-plan", "(app)/receiving/cases/[caseId]/treatment-plan/page.tsx", "must", ["receiving"], [5]),
  r("receiving.request-info", "Request additional information", "9D", "receiving", "/receiving/cases/[caseId]/request-info", "(app)/receiving/cases/[caseId]/request-info/page.tsx", "must", ["receiving"]),
  r("receiving.messages", "Messaging thread (receiving side)", "9D", "receiving", "/receiving/cases/[caseId]/messages", "(app)/receiving/cases/[caseId]/messages/page.tsx", "must", ["receiving"], [6]),
  r("receiving.summary", "Submit clinical summary form", "9D", "receiving", "/receiving/cases/[caseId]/summary", "(app)/receiving/cases/[caseId]/summary/page.tsx", "must", ["receiving"], [8]),
  r("receiving.coordinator", "Hospital coordinator dashboard", "9D", "receiving", "/receiving/coordinator", "(app)/receiving/coordinator/page.tsx", "must", ["coordinator"]),

  // ── E. LibaMed admin / governance (10) — §9E ──────────────────────────────
  r("admin.dashboard", "Admin dashboard (case flow across corridors)", "9E", "admin", "/admin", "(app)/admin/page.tsx", "must", ["admin", "caseManager"]),
  r("admin.case-detail", "Case oversight detail", "9E", "admin", "/admin/cases/[caseId]", "(app)/admin/cases/[caseId]/page.tsx", "must", ["admin", "caseManager"]),
  r("admin.hospitals", "Partner hospital list", "9E", "admin", "/admin/hospitals", "(app)/admin/hospitals/page.tsx", "must", ["admin"]),
  r("admin.hospital-edit", "Partner hospital add/edit", "9E", "admin", "/admin/hospitals/[hospitalId]/edit", "(app)/admin/hospitals/[hospitalId]/edit/page.tsx", "must", ["admin"], [], { note: "Add + edit share this shell. Partner-hospital data must be admin-editable without a developer (§8.3)." }),
  r("admin.clinicians", "Named clinician management", "9E", "admin", "/admin/clinicians", "(app)/admin/clinicians/page.tsx", "must", ["admin"]),
  r("admin.corridors", "Corridor configuration", "9E", "admin", "/admin/corridors", "(app)/admin/corridors/page.tsx", "must", ["admin"], [], { note: "Corridor is a first-class config object (§4/§10): residency, transfer mechanism, consent wording, retention, language pack, partner directory." }),
  r("admin.users", "User & role management (RBAC)", "9E", "admin", "/admin/users", "(app)/admin/users/page.tsx", "must", ["admin"]),
  r("admin.audit", "Audit log viewer + export", "9E", "admin", "/admin/audit", "(app)/admin/audit/page.tsx", "must", ["admin", "caseManager"], [9], { note: "Immutable, append-only, tamper-evident; every view/download/export (§7.2)." }),
  r("admin.consent", "Consent records viewer", "9E", "admin", "/admin/consent", "(app)/admin/consent/page.tsx", "must", ["admin", "caseManager"], [7, 9]),
  r("admin.retention", "Retention / erasure / DSAR management", "9E", "admin", "/admin/retention", "(app)/admin/retention/page.tsx", "must", ["admin"]),

  // ── F. System / utility / states (8) — §9F ────────────────────────────────
  r("system.not-found", "404 not found", "9F", "system", "*", "not-found.tsx", "must", ["public"], [], { special: true, note: "Next special file (not-found.tsx)." }),
  r("system.forbidden", "403 access denied", "9F", "system", "/403", "(system)/403/page.tsx", "must", ["public"]),
  r("system.error", "500 / error", "9F", "system", "*", "error.tsx", "must", ["public"], [], { special: true, note: "Next special file (error.tsx, client component)." }),
  r("system.maintenance", "Maintenance", "9F", "system", "/maintenance", "(system)/maintenance/page.tsx", "must", ["public"]),
  r("system.session-expired", "Session expired", "9F", "system", "/session-expired", "(system)/session-expired/page.tsx", "must", ["public"]),
  r("system.case-access-expired", "Case access expired (90-day inactivity)", "9F", "system", "/case-access-expired", "(system)/case-access-expired/page.tsx", "must", ["public"], [], { note: "90-day receiving-clinician inactivity expiry (§5/§7.2)." }),
  r("system.offline", "Offline (PWA shell)", "9F", "system", "/offline", "(system)/offline/page.tsx", "must", ["public"], [], { note: "Static offline fallback also served from public/offline.html by the service worker." }),
  r("system.consent-expired", "Consent expired notice", "9F", "system", "/consent-expired", "(system)/consent-expired/page.tsx", "must", ["public"]),
];

// ── Validation ──────────────────────────────────────────────────────────────
const ids = new Set();
const files = new Set();
for (const route of ROUTES) {
  if (ids.has(route.id)) throw new Error(`Duplicate route id: ${route.id}`);
  if (files.has(route.file)) throw new Error(`Duplicate file: ${route.file}`);
  ids.add(route.id);
  files.add(route.file);
}
if (ROUTES.length !== 67) {
  throw new Error(`Expected exactly 67 V1 routes, got ${ROUTES.length}`);
}

// ── Emit lib/routes.ts ───────────────────────────────────────────────────────
const routesTs = `// GENERATED by scripts/generate-scaffold.mjs — do not edit page mappings by hand.
// Runtime route manifest / sitemap: the single source of truth for navigation
// and V1 coverage tracking (PROJECT_CONTEXT.md §9). Re-run the generator after
// editing the route table there.

export type Role =
  | "public"
  | "referring"
  | "receiving"
  | "coordinator"
  | "caseManager"
  | "admin";

export type Tier = "must" | "should" | "nice";

export type RouteGroup =
  | "public"
  | "auth"
  | "account"
  | "referring"
  | "receiving"
  | "admin"
  | "system";

export interface RouteMeta {
  /** Stable identifier used by <PlaceholderPage routeId="..." />. */
  id: string;
  /** Page name from §9. */
  title: string;
  /** §9 sub-section, e.g. "9A". */
  section: string;
  group: RouteGroup;
  /** URL path relative to /[locale] ("*" for special files). */
  path: string;
  /** page file relative to app/[locale]. */
  file: string;
  tier: Tier;
  /** RBAC roles allowed to see this page. */
  roles: Role[];
  /** Section 14 acceptance-test scenario numbers this page maps to. */
  tests?: number[];
  /** Rendered via a Next special file (not-found.tsx / error.tsx). */
  special?: boolean;
  note?: string;
}

export const ROLE_LABELS: Record<Role, string> = {
  public: "Public / unauthenticated",
  referring: "Referring clinician",
  receiving: "Receiving clinician",
  coordinator: "Hospital coordinator",
  caseManager: "LibaMed case manager",
  admin: "Compliance / admin",
};

export const TIER_LABELS: Record<Tier, string> = {
  must: "Must Have (V1)",
  should: "Should Have (V1.5)",
  nice: "Nice to Have (V2+)",
};

export const GROUP_LABELS: Record<RouteGroup, string> = {
  public: "Public site",
  auth: "Auth & account",
  account: "Account",
  referring: "Referring clinician portal",
  receiving: "Receiving / hospital portal",
  admin: "LibaMed admin / governance",
  system: "System / state",
};

export const ROUTES: RouteMeta[] = ${JSON.stringify(ROUTES, null, 2)};

export const ROUTES_BY_ID: Record<string, RouteMeta> = Object.fromEntries(
  ROUTES.map((route) => [route.id, route]),
);

export function getRoute(id: string): RouteMeta | undefined {
  return ROUTES_BY_ID[id];
}

export function routesByGroup(group: RouteGroup): RouteMeta[] {
  return ROUTES.filter((route) => route.group === group);
}
`;

mkdirSync(join(ROOT, "lib"), { recursive: true });
writeFileSync(join(ROOT, "lib", "routes.ts"), routesTs);

// ── Emit page.tsx for every non-special route ────────────────────────────────
let pagesWritten = 0;
for (const route of ROUTES) {
  if (route.special) continue;
  const target = join(LOCALE_DIR, route.file);
  mkdirSync(dirname(target), { recursive: true });
  const body = `import PlaceholderPage from "@/components/PlaceholderPage";

// ${route.section} · ${route.title}
export default function Page() {
  return <PlaceholderPage routeId="${route.id}" />;
}
`;
  writeFileSync(target, body);
  pagesWritten += 1;
}

console.log(`✓ ${ROUTES.length} routes in manifest`);
console.log(`✓ ${pagesWritten} page.tsx generated (2 special files hand-written: not-found.tsx, error.tsx)`);
