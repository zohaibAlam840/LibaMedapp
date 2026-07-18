import type { Dictionary } from "./types";
import { en } from "./en";
import { fr } from "./fr";
import { tr } from "./tr";
import { he } from "./he";

export type { Dictionary } from "./types";

const DICTIONARIES: Record<string, Dictionary> = { en, fr, tr, he };

/** Returns the dictionary for a locale, falling back to English. */
export function getDictionary(locale: string): Dictionary {
  return DICTIONARIES[locale] ?? en;
}
