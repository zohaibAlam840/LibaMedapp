import { redirect } from "next/navigation";
import { getSessionUser, landingPath } from "@/lib/auth";

// Referring-side guard.
//
// The (app) layout only establishes that the visitor is a verified clinician,
// which is how the receiving side ended up being able to open this one. The
// data underneath is scoped either way, so nothing leaked — but serving a
// clinician the other side's controls invites exactly the mistake the audit log
// then records for ever.
//
// Receiving staff are sent to their own home rather than shown a refusal;
// there is nothing here they can act on. Admins pass through, because oversight
// sometimes means looking at the screen the clinician is describing.
export default async function ReferringLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  if (user.role !== "referring" && user.role !== "admin" && user.role !== "caseManager") {
    redirect(landingPath(locale, user));
  }
  return <>{children}</>;
}
