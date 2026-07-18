// i18n scaffold — EN / FR / TR / HE.
// Placeholder only: no real translations yet. Hebrew (he) is RTL and is wired
// as a genuine layout variant via `dir()` so RTL is structurally supported from
// day one (see PROJECT_CONTEXT.md §8.4 / §13).

export const LOCALES = ["en", "fr", "tr", "he"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that render right-to-left. */
export const RTL_LOCALES: readonly Locale[] = ["he"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  tr: "Türkçe",
  he: "עברית",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** Text direction for a locale. `he` → "rtl", everything else → "ltr". */
export function dir(locale: string): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale as Locale) ? "rtl" : "ltr";
}
