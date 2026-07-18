import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

// i18n routing scaffold (Next 16 "proxy" — formerly middleware).
// Ensures every request carries a locale prefix. A locale-less path such as
// `/referring` is redirected to `/{DEFAULT_LOCALE}/referring`.
//
// NOTE: locale detection here is intentionally minimal (always DEFAULT_LOCALE).
// Accept-Language negotiation is deferred — this is a structure-only scaffold.

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip Next internals, the service worker, manifest, and any file with an
  // extension (static assets). Everything else gets a locale prefix.
  matcher: ["/((?!_next|api|sw.js|manifest.webmanifest|.*\\.[\\w]+$).*)"],
};
