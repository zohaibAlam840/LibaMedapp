// The PUBLIC Supabase connection values, resolved in one place.
//
// Two things this exists for:
//
//  1. Key naming. Supabase renamed the browser key from "anon" to
//     "publishable", and the two spellings are still both in the wild —
//     .env.local here uses PUBLISHABLE, while Vercel's Supabase integration
//     writes ANON. Reading both means a deployment doesn't fall over just
//     because the host has the other name.
//
//  2. Failing legibly. `createServerClient` throws a generic "URL and Key are
//     required" the moment either value is blank, which surfaces as a bare 500
//     on every page that asks who is signed in. `missingSupabaseEnv()` names
//     the variable that is actually absent.
//
// These must stay literal `process.env.NEXT_PUBLIC_*` expressions: Next inlines
// them at BUILD time. A value added in the Vercel dashboard therefore does
// nothing until the project is redeployed.

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

/** The names of the public variables that are missing, for error messages. */
export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_PUBLISHABLE_KEY) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return missing;
}

export function supabaseEnvError(): Error {
  return new Error(
    `Supabase is not configured: ${missingSupabaseEnv().join(", ")} is missing. ` +
      "Set it in .env.local (dev) or the Vercel project's Environment Variables, " +
      "then rebuild — NEXT_PUBLIC_* values are baked in at build time.",
  );
}
