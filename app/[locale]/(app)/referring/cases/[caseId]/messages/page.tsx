import MessagingWorkspace from "@/components/messaging/MessagingWorkspace";

// 9C · Secure messaging thread (#38) — acceptance §14.6.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { locale, caseId } = await params;
  return <MessagingWorkspace locale={locale} side="referring" caseId={caseId} />;
}
