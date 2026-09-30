import "server-only";
import { getCorridors } from "@/lib/db/corridors";
import { FIXED_DESTINATIONS, type DestinationOption } from "@/lib/patientInterest";

/**
 * The destination choices offered on the public enquiry form.
 *
 * Built from the corridors that are PUBLISHED, so a corridor that is agreed in
 * the backend but not yet contracted to be shown can never be advertised by the
 * form. This replaced a hardcoded list that named Türkiye while the corridor
 * page and the hospital page for it were both correctly hidden.
 *
 * The country is used as the label, not the corridor's own label: a corridor
 * reads "UK → Switzerland", which is the right name for a referral route and
 * the wrong one for a patient answering "where would you prefer to be
 * treated?".
 *
 * getCorridors() already fails closed — a failed read returns no corridors
 * rather than the code registry — so the worst case here is a form offering
 * only "No preference" and "Somewhere else". That loses a little signal on an
 * enquiry. Naming a country we have not contracted is the failure that costs
 * something, and it cannot happen this way round.
 */
/**
 * value → label for DISPLAYING a stored destination, e.g. in the admin list.
 *
 * Built from EVERY corridor, not only the published ones, which is the
 * difference between this and getDestinationOptions(). An enquiry captured
 * while a corridor was public keeps that answer after it is unpublished, and
 * the person reading it still needs to know what the patient asked for.
 * Offering a destination and explaining one already given are different jobs.
 */
export async function getDestinationLabels(): Promise<Record<string, string>> {
  const labels: Record<string, string> = {};
  for (const f of FIXED_DESTINATIONS) labels[f.value] = f.label;
  for (const c of await getCorridors()) labels[c.id] = c.country;
  return labels;
}

export async function getDestinationOptions(): Promise<DestinationOption[]> {
  const corridors = await getCorridors();
  const live = corridors
    .filter((c) => c.published)
    .sort((a, b) => a.displayOrder - b.displayOrder || a.country.localeCompare(b.country))
    .map((c) => ({ value: c.id, label: c.country }));

  // "No preference" first and "Somewhere else" last, with the real places
  // between them — the shape people expect of this question.
  const [none, other] = FIXED_DESTINATIONS;
  return [none, ...live, other];
}
