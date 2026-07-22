import CorridorStep from "@/components/intake/CorridorStep";

// 9C · Intake step 3 — corridor + specialty (acceptance §14.2/§14.4).
// Choosing the corridor sets data residency automatically and surfaces the
// data-transfer basis (item 5); NHS-routine specialties are gated out (item 7).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <CorridorStep locale={locale} />;
}
