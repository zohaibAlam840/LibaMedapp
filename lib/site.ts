// Canonical public origin, used for absolute links (sitemap, robots, emails).
//
// NEXT_PUBLIC_SITE_URL wins, except that a localhost value is ignored on a
// Vercel production deploy: a copied .env.local once shipped
// http://localhost:3000 to production and every sitemap URL and email link
// pointed at the reader's own machine.
const PRODUCTION_URL = "https://www.libamed.com";

export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  const isProd = process.env.VERCEL_ENV === "production";
  if (env && !(isProd && /localhost|127\.0\.0\.1/.test(env))) return env;
  return isProd ? PRODUCTION_URL : env || "http://localhost:3000";
}
