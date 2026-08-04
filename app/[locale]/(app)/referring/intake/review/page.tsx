import ReviewStep from "@/components/intake/ReviewStep";
import { getHospitals } from "@/lib/db/hospitals";
import { getReferableCorridors } from "@/lib/db/corridors";

// 9C · Intake step 7 — review & submit (acceptance §14.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Hospital names come from the DB so admin edits show in the wizard.
  const [hospitals, corridors] = await Promise.all([getHospitals(), getReferableCorridors()]);
  const hospitalNames = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));
  return <ReviewStep locale={locale} hospitalNames={hospitalNames} corridors={corridors} />;
}
