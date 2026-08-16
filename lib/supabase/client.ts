"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/env";

// Browser Supabase client for client components (login/signup forms). Uses the
// publishable key and acts as the signed-in user (subject to RLS).
export function supabaseBrowser() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}
