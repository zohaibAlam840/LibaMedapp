import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

// Next 16 "proxy" (formerly middleware). Two jobs:
//  1. i18n — ensure every request carries a locale prefix.
//  2. Supabase session refresh — keep the auth cookies fresh so Server
//     Components see a valid session. Route protection itself lives in the
//     (app) layout + each server action (per the proxy docs' security note:
//     never rely on the proxy matcher alone for auth).

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1 · i18n redirect for locale-less paths.
  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (!hasLocale) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // 2 · Supabase session refresh (skip if not configured yet).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the user to trigger a token refresh when needed. Do not remove.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip Next internals, the service worker, manifest, and any file with an
  // extension (static assets). Everything else gets locale + session handling.
  matcher: ["/((?!_next|api|sw.js|manifest.webmanifest|.*\\.[\\w]+$).*)"],
};
