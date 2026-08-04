"use client";

import { createBrowserClient } from "@supabase/ssr";

// Browser Supabase client for client components (login/signup forms). Uses the
// publishable key and acts as the signed-in user (subject to RLS).
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
