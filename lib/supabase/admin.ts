import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using the SECRET (service_role) key. All PHI data
// access goes through the server layer — never the browser — so this client
// bypasses RLS and OUR server code is responsible for authorization + writing
// the audit trail on every read/download. The `server-only` import makes the
// build fail if this is ever imported into a client component.
//
// (RLS is still enabled on every table as defense-in-depth — see schema.sql.)

let cached: SupabaseClient | null = null;

export function supabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret || secret.startsWith("REPLACE_WITH")) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local, then restart the dev server.",
    );
  }

  cached = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
