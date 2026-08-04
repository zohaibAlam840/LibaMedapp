import ConsentStep from "@/components/intake/ConsentStep";
import { getHospitals } from "@/lib/db/hospitals";
import { getReferableCorridors } from "@/lib/db/corridors";

// 9C · Intake step 6 — SEPARATE patient consent (NHS-safeguard item 6).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Hospital names come from the DB so admin edits show in the wizard.
  const [hospitals, corridors] = await Promise.all([getHospitals(), getReferableCorridors()]);
  const hospitalNames = Object.fromEntries(hospitals.map((h) => [h.id, h.name]));
  return <ConsentStep locale={locale} hospitalNames={hospitalNames} corridors={corridors} />;
}
