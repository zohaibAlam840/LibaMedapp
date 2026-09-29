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
// The specialty areas, age ranges and budget bands below are the client's own
// wording, supplied 27 Sep 2026, and are used verbatim — they are the
// categories her campaign reporting is built around. Destination preferences
// and timeframes were not specified and remain ours.

export const AGE_RANGES = ["Under 18", "18–40", "41–60", "61–75", "76+"] as const;

export const SPECIALTY_AREAS = [
  "Oncology & second opinions",
  "Orthopaedics (non-routine/complex)",
  "Cardiology",
  "Neurology/neurosurgery",
  "Fertility",
  // Added 2026-09-30 (change scope item B2) as a SEVENTH option — the six
  // above are unchanged, because campaign reporting is built on them and
  // rewording one would split its history across two labels.
  "Second opinion — digestive or liver cancer",
  "Other specialist care",
] as const;

/**
 * The area the /en/second-opinion page preselects on the form.
 *
 * Named here rather than written out at the call site so the page and the
 * option cannot drift apart — if this string is edited, the preset follows it.
 */
export const SECOND_OPINION_AREA = "Second opinion — digestive or liver cancer";

/** Who the enquiry is about. Constrained in the database — see migration 009. */
export const ENQUIRY_FOR = [
  { value: "self", label: "Me" },
  { value: "other", label: "Someone else" },
] as const;

export type EnquiryFor = (typeof ENQUIRY_FOR)[number]["value"];

export interface DestinationOption {
  value: string;
  label: string;
}

/**
 * The two destination answers that are NOT a corridor, and so are always
 * offered whatever is published.
 *
 * The countries in between are no longer listed here. A hardcoded list put
 * Türkiye on the public form for anyone to see, while the corridor and the
 * hospital pages were correctly hidden — the corridor was unpublished
 * precisely because its commercial terms were still open, and the form
 * advertised it anyway. A second list of the same thing will always drift away
 * from the first, so there is only one now: `getDestinationOptions()` in
 * lib/db/destinations.ts builds the middle of this list from the corridors
 * that are actually published.
 */
export const FIXED_DESTINATIONS: DestinationOption[] = [
  { value: "none", label: "No preference" },
  { value: "other", label: "Somewhere else" },
];

export const FUNDING_TYPES = [
  { value: "self-pay", label: "Paying myself" },
  { value: "insurance", label: "Through insurance" },
  { value: "unknown", label: "Not sure yet" },
] as const;

export const BUDGET_BANDS = [
  "Under £10k",
  "£10k–£25k",
  "£25k–£50k",
  "£50k+",
  "Prefer not to say / insurance-funded",
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

/**
 * Lists that are value/label pairs.
 *
 * `destinationPreference` is deliberately absent: what counts as a valid
 * destination depends on what is published right now, which this module cannot
 * know without a database. It is validated in the server action against the
 * same list the form was rendered from — see validDestination().
 */
const CODED: Record<string, readonly { value: string; label: string }[]> = {
  fundingType: FUNDING_TYPES,
  enquiryFor: ENQUIRY_FOR,
};

/**
 * Check a submitted destination against the options actually offered.
 *
 * Takes the list rather than reading it, so the caller passes the same one the
 * form was built from and there is no second source to drift.
 */
export function validDestination(raw: string, offered: DestinationOption[]): string | null {
  const value = raw.trim();
  if (!value) return null;
  return offered.some((o) => o.value === value) ? value : null;
}

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
