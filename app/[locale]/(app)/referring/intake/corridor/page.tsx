import CorridorStep from "@/components/intake/CorridorStep";
import { getHospitals } from "@/lib/db/hospitals";
import { getReferableCorridors } from "@/lib/db/corridors";

// 9C · Intake step 3 — corridor + specialty (acceptance §14.2/§14.4).
// Choosing the corridor sets data residency automatically and surfaces the
// data-transfer basis (item 5); NHS-routine specialties are gated out (item 7).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Hospital names come from the DB so admin edits show in the wizard.
  const [hospitals, corridors] = await Promise.all([getHospitals(), getReferableCorridors()]);
  const hospitalNames = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));
  return <CorridorStep locale={locale} hospitalNames={hospitalNames} corridors={corridors} />;
}
