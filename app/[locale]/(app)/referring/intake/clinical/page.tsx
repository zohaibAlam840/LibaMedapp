import ClinicalStep from "@/components/intake/ClinicalStep";

// 9C · Intake step 2 — clinical summary.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ClinicalStep locale={locale} />;
}
