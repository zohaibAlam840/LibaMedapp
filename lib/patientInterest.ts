// Patient enquiry vocabulary — the option lists, and nothing server-only, so
// the public form can import them.
//
// These live in code rather than as database check constraints on purpose.
// They are marketing categories and will be retuned as campaigns run; as
// constraints, every retune would be a migration and would reject rows already
// captured under the old wording. Changing a list here is safe: existing
// enquiries keep the label they were captured with, and OPTION_LABEL falls
// back to the stored value for anything no longer offered.
//
// PLACEHOLDER VALUES: the bands below are a reasonable starting set, pending
// the client's own lists. Swapping them is this file and nothing else.

export const AGE_RANGES = ["18–29", "30–44", "45–59", "60–74", "75+"] as const;

export const SPECIALTY_AREAS = [
  "Orthopaedics",
  "Cardiology",
  "Oncology",
  "Neurology",
  "Fertility",
  "Ophthalmology",
  "Other / not sure",
] as const;

export const DESTINATIONS = [
  { value: "none", label: "No preference" },
  { value: "switzerland", label: "Switzerland" },
  { value: "turkiye", label: "Türkiye" },
  { value: "other", label: "Somewhere else" },
] as const;

export const FUNDING_TYPES = [
  { value: "self-pay", label: "Paying myself" },
  { value: "insurance", label: "Through insurance" },
  { value: "unknown", label: "Not sure yet" },
] as const;

export const BUDGET_BANDS = [
  "Under £5,000",
  "£5,000 – £15,000",
  "£15,000 – £30,000",
  "£30,000 – £50,000",
  "Over £50,000",
  "Not sure yet",
] as const;

export const TIMEFRAMES = [
  "As soon as possible",
  "Within 3 months",
  "3–6 months",
  "6–12 months",
  "Just exploring",
] as const;

export const INTEREST_STATUSES = ["new", "qualified", "contacted", "not-suitable"] as const;
export type InterestStatus = (typeof INTEREST_STATUSES)[number];

export const STATUS_LABEL: Record<InterestStatus, string> = {
  new: "New",
  qualified: "Qualified",
  contacted: "Contacted",
  "not-suitable": "Not suitable",
};

/** Lists that are plain strings, keyed by the form field they belong to. */
const PLAIN: Record<string, readonly string[]> = {
  ageRange: AGE_RANGES,
  specialtyArea: SPECIALTY_AREAS,
  budgetBand: BUDGET_BANDS,
  timeframe: TIMEFRAMES,
};

/** Lists that are value/label pairs. */
const CODED: Record<string, readonly { value: string; label: string }[]> = {
  destinationPreference: DESTINATIONS,
  fundingType: FUNDING_TYPES,
};

/**
 * Accept a submitted value only if it is one we offered.
 *
 * A dropdown is not a guarantee: the form posts to a public endpoint, so the
 * value has to be checked against the list rather than trusted. Anything
 * unrecognised becomes null instead of being stored, so the admin list can
 * never show a category that was never on the form.
 */
export function validOption(field: string, raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  if (PLAIN[field]) return PLAIN[field].includes(value) ? value : null;
  if (CODED[field]) return CODED[field].some((o) => o.value === value) ? value : null;
  return null;
}

/** Display a stored value, falling back to itself if the list has moved on. */
export function optionLabel(field: string, value: string): string {
  const coded = CODED[field]?.find((o) => o.value === value);
  return coded?.label ?? value;
}
