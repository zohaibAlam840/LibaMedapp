// Create a real login account (auth user + profiles row) via the Supabase admin
// API. Use this to bootstrap the first admin (sign-up only creates referring /
// introducer accounts). Reads .env.local; never prints secrets.
//
// Usage:
//   node scripts/create-account.mjs <email> <password> <role> "<Full Name>"
//   role ∈ referring | receiving | coordinator | caseManager | admin | patient | introducer
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const [email, password, role, name] = process.argv.slice(2);
if (!email || !password || !role || !name) {
  console.error('Usage: node scripts/create-account.mjs <email> <password> <role> "<Full Name>"');
  process.exit(1);
}

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

const CLINICIAN_ROLES = ["referring", "receiving", "coordinator", "caseManager", "admin"];

// 1 · create the auth user (email pre-confirmed so login works immediately)
const { data: created, error: authErr } = await sb.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});
if (authErr) {
  console.error("auth.createUser failed:", authErr.message);
  process.exit(1);
}
const authUserId = created.user.id;

// 2 · build the profile
const profile = {
  auth_user_id: authUserId,
  name,
  email,
  account_status: "verified",
  account_type: CLINICIAN_ROLES.includes(role) ? "clinician" : role, // patient | introducer
  clinician_role: CLINICIAN_ROLES.includes(role) ? role : null,
};
if (role === "admin") {
  profile.can_manage_users = true;
  profile.can_export_audit = true;
  profile.can_edit_corridors = true;
}

const { error: profErr } = await sb.from("profiles").insert(profile);
if (profErr) {
  console.error("profiles insert failed:", profErr.message);
  // roll back the orphaned auth user
  await sb.auth.admin.deleteUser(authUserId);
  process.exit(1);
}

console.log(`✓ Created ${role} account: ${email}`);
