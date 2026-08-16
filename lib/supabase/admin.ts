import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/supabase/env";

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

  const url = SUPABASE_URL;
  // Same rename story as the publishable key: "service_role" is what the Vercel
  // Supabase integration writes, "secret" is the current name.
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secret || secret.startsWith("REPLACE_WITH")) {
    const missing = [!url && "NEXT_PUBLIC_SUPABASE_URL", !secret && "SUPABASE_SECRET_KEY"]
      .filter(Boolean)
      .join(", ");
    throw new Error(
      `Supabase is not configured: ${missing || "SUPABASE_SECRET_KEY is a placeholder"}. ` +
        "Set it in .env.local (dev) or the Vercel project's Environment Variables, then redeploy.",
    );
  }

  cached = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
