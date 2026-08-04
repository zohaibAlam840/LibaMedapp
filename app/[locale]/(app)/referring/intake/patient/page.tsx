import PatientStep from "@/components/intake/PatientStep";

// 9C · Intake step 1 — patient details (acceptance §14.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PatientStep locale={locale} />;
}
