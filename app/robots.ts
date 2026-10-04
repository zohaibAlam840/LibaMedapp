import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { LOCALES } from "@/lib/i18n";

const SITE_URL = siteUrl();

// Keep crawlers off the signed-in app and auth flows.
const PRIVATE = ["account", "admin", "receiving", "referring", "introducer", "portal", "login", "register", "mfa"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", ...LOCALES.flatMap((l) => PRIVATE.map((p) => `/${l}/${p}`))],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
