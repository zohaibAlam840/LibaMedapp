import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.libamed.com").replace(/\/$/, "");

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
