import { redirect } from "next/navigation";
import { getSessionUser, landingPath } from "@/lib/auth";

// Admin-area guard.
//
// The (app) layout above this one only establishes that the visitor is a
// VERIFIED CLINICIAN — it says nothing about which clinician. Every page under
// /admin was relying on that, and on nothing else, so any signed-in clinician
// could open the whole governance area: a referring clinician with no cases of
// their own could read /admin/audit, which is deliberately unscoped (an admin
// is meant to see the entire hash-chained log) and therefore exposed every
// case reference, actor and event on the platform. /admin/verification
// similarly listed registrants' emails and GMC numbers.
//
// Oversight roles only. `caseManager` is included because the nav gives that
// role /admin routes as its home; everyone else is sent back to their own
// landing page rather than shown a refusal, since there is nothing here they
// can act on.
//
// Per-page permission checks still matter and are NOT replaced by this — user
// management additionally requires `canManageUsers`, and audit export requires
// `canExportAudit`. This is the floor, not the whole policy.
export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);

  if (user.accountType !== "clinician" || (user.role !== "admin" && user.role !== "caseManager")) {
    redirect(landingPath(locale, user));
  }

  return <>{children}</>;
}
