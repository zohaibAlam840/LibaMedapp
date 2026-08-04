// Idempotently ensure the private case-documents Storage bucket exists.
// Safe to run any time. Reads .env.local; never prints the secret key.
//
//   node scripts/ensure-storage.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "case-documents";

const env = Object.fromEntries(
  readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

const { data: existing } = await sb.storage.getBucket(BUCKET);
if (existing) {
  console.log(`· bucket "${BUCKET}" already exists (public: ${existing.public})`);
} else {
  const { error } = await sb.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: "50MB",
  });
  if (error) {
    console.error("createBucket failed:", error.message);
    process.exit(1);
  }
  console.log(`· bucket "${BUCKET}" created (private)`);
}

console.log("\n✓ Storage ready for case documents.");
