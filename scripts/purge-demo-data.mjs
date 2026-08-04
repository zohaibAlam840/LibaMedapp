// Remove the SEEDED SAMPLE referrals (and everything hanging off them) so the
// app starts from a clean slate for real use. Partner reference data —
// corridors, hospitals, specialties, doctors — is KEPT, as are user accounts.
//
// Destructive and not reversible except by re-running supabase/seed.sql.
// Requires an explicit confirmation flag:
//
//   node scripts/purge-demo-data.mjs            # dry run — shows what WOULD go
//   node scripts/purge-demo-data.mjs --yes      # actually delete
//
// The seeded cases are the five LM-2026-01xx references created by seed.sql.
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const SEEDED_REFS = [
  "LM-2026-0142",
  "LM-2026-0139",
  "LM-2026-0133",
  "LM-2026-0127",
  "LM-2026-0118",
];

const confirmed = process.argv.includes("--yes");

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

async function main() {
const { data: rows, error } = await sb
  .from("referrals")
  .select("id, ref, patient_ref, status")
  .in("ref", SEEDED_REFS);

if (error) {
  console.error("lookup failed:", error.message);
  return 1;
}

if (!rows?.length) {
  console.log("✓ No seeded demo referrals found — the database is already clean.");
  return 0;
}

console.log(`Found ${rows.length} seeded demo referral(s):`);
for (const r of rows) console.log(`  · ${r.ref}  (patient ${r.patient_ref}, ${r.status})`);

if (!confirmed) {
  console.log(
    "\nDRY RUN — nothing deleted. Re-run with --yes to remove these referrals\n" +
      "and their consent, documents, messages, and audit entries.\n" +
      "Corridors, hospitals, doctors, and user accounts are NOT touched.",
  );
  return 0;
}

const ids = rows.map((r) => r.id);

// audit_log blocks UPDATE/DELETE at row level (append-only trigger) and its FK
// is ON DELETE SET NULL, so detach-then-delete is not possible: clear the audit
// rows for these referrals first via the same privileged path used to seed them.
const { error: auditErr } = await sb.from("audit_log").delete().in("referral_id", ids);
if (auditErr) {
  console.error(
    "\n✗ Blocked by the append-only audit log — this is correct behaviour.",
    "\n  Clearing real audit history is a privileged act and cannot be done with",
    "\n  a service key. Paste supabase/purge_demo_data.sql into the Supabase SQL",
    "\n  editor instead; it lifts the immutability trigger inside one transaction.",
  );
  return 1;
}

// consent / documents / messages cascade from referrals.
const { error: delErr } = await sb.from("referrals").delete().in("id", ids);
if (delErr) {
  console.error("delete failed:", delErr.message);
  return 1;
}

console.log(`\n✓ Removed ${ids.length} demo referral(s) and all related records.`);
console.log("  Corridors, hospitals, doctors, and user accounts were kept.");
  return 0;
}

process.exitCode = (await main()) ?? 0;
