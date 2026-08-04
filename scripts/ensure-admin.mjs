// Idempotently ensure the bootstrap admin login exists and works. Safe to run
// any time (e.g. after re-running seed.sql, which truncates profiles). Reads
// .env.local; never prints the secret key.
//
//   node scripts/ensure-admin.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const EMAIL = "admin@libamed.test";
const PASSWORD = "Admin!2026demo";
const NAME = "Sam Okafor";

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

// 1 · auth user (create, or reset the password if it already exists)
let userId;
const { data: list } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
const existing = list?.users?.find((u) => u.email === EMAIL);
if (existing) {
  userId = existing.id;
  await sb.auth.admin.updateUserById(userId, { password: PASSWORD, email_confirm: true });
  console.log("· auth user exists — password reset to known value");
} else {
  const { data, error } = await sb.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) {
    console.error("createUser failed:", error.message);
    process.exit(1);
  }
  userId = data.user.id;
  console.log("· auth user created");
}

// 2 · profiles row (create if missing)
const { data: prof } = await sb
  .from("profiles")
  .select("id")
  .eq("auth_user_id", userId)
  .maybeSingle();
if (prof) {
  console.log("· profile exists");
} else {
  const { error } = await sb.from("profiles").insert({
    auth_user_id: userId,
    name: NAME,
    email: EMAIL,
    account_status: "verified",
    account_type: "clinician",
    clinician_role: "admin",
    can_manage_users: true,
    can_export_audit: true,
    can_edit_corridors: true,
  });
  if (error) {
    console.error("profile insert failed:", error.message);
    process.exit(1);
  }
  console.log("· profile created (admin)");
}

console.log(`\n✓ Admin login ready:\n   ${EMAIL}\n   ${PASSWORD}`);
