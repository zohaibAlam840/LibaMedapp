import { redirect } from "next/navigation";
import { getSessionUser, landingPath } from "@/lib/auth";

// Receiving-side guard. The mirror of the referring one — see that file for
// why this exists. Coordinators belong here (it is their hospital's area);
// referring clinicians do not, and were previously offered "Accept for review"
// on their own cases.
export default async function ReceivingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/${locale}/login`);
  const allowed = ["receiving", "coordinator", "admin", "caseManager"];
  if (!allowed.includes(user.role)) redirect(landingPath(locale, user));
  return <>{children}</>;
}
