import type { MetadataRoute } from "next";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { getPublishedCorridors } from "@/lib/db/corridors";
import { getHospitals } from "@/lib/db/hospitals";

// Public marketing pages only. English only for now: the other locales are
// placeholders with no translations yet, so listing them would just hand
// Google duplicate content. Signed-in app routes are excluded (see robots.ts).
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.libamed.com").replace(/\/$/, "");

const STATIC_PATHS = [
  "",
  "/how-it-works",
  "/for-clinicians",
  "/for-patients",
  "/second-opinion",
  "/specialties",
  "/corridors",
  "/hospitals",
  "/pledge",
  "/security",
  "/faq",
  "/contact",
  "/legal/terms",
  "/legal/privacy",
  "/legal/cookies",
  "/legal/acceptable-use",
  "/legal/accessibility",
  "/legal/sub-processors",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = `${SITE_URL}/${DEFAULT_LOCALE}`;
  const [corridors, hospitals] = await Promise.all([
    getPublishedCorridors().catch(() => []),
    getHospitals().catch(() => []),
  ]);

  return [
    ...STATIC_PATHS.map((p) => ({
      url: `${base}${p}`,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...corridors.map((c) => ({ url: `${base}/corridors/${c.id}`, priority: 0.6 })),
    // Unpublished hospitals 404 on their profile page, so leave them out.
    ...hospitals.filter((h) => h.published).map((h) => ({ url: `${base}/hospitals/${h.id}`, priority: 0.6 })),
  ];
}
