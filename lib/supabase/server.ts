import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

// User-context Supabase client for Server Components / Server Actions / Route
// Handlers. Uses the PUBLISHABLE (anon) key + the request cookies, so it acts
// AS THE SIGNED-IN USER and is subject to RLS — unlike lib/supabase/admin.ts
// (service_role) which bypasses RLS for trusted server reads. Auth flows use
// this client.
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // In a Server Component the cookie store is read-only and this throws;
          // that's expected — proxy.ts refreshes the session cookies instead.
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* no-op: session refresh happens in proxy.ts */
          }
        },
      },
    },
  );
}
