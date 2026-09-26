import { chromium } from "file:///C:/fawad/my-app/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3000";
const results = [];
const ok = (n, pass, d = "") => { results.push({ n, pass, d }); console.log(`${pass ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); };
const browser = await chromium.launch();
const page = await (await browser.newContext()).newPage();
await page.goto(`${BASE}/en/for-patients`, { waitUntil: "domcontentloaded" });

const opts = async (sel) => (await page.$$eval(`${sel} option`, (os) => os.map((o) => o.textContent.trim()))).filter(Boolean);

const age = await opts('select[name="ageRange"]');
ok("age ranges are hers", ["Under 18","18–40","41–60","61–75","76+"].every((v) => age.includes(v)), age.join(" | "));

const spec = await opts('select[name="specialtyArea"]');
ok("specialty areas are hers",
  ["Oncology & second opinions","Orthopaedics (non-routine/complex)","Cardiology","Neurology/neurosurgery","Fertility","Other specialist care"].every((v) => spec.includes(v)),
  spec.join(" | "));

const budget = await opts('select[name="budgetBand"]');
ok("budget bands are hers",
  ["Under £10k","£10k–£25k","£25k–£50k","£50k+","Prefer not to say / insurance-funded"].every((v) => budget.includes(v)),
  budget.join(" | "));
ok("no duplicate 'prefer not to say' in budget",
  budget.filter((o) => /prefer not to say/i.test(o)).length === 1);
ok("no duplicate catch-all in specialty",
  spec.filter((o) => /not sure|other/i.test(o)).length === 1, spec.filter((o) => /not sure|other/i.test(o)).join(" + "));

const body = await page.innerText("body");
ok("age field says whose age it wants", /asking on behalf of someone else/i.test(body));
ok("apostrophes render as characters, not entities", !/&rsquo;|&amp;/.test(body));
ok("still names no procedure", !/hip replacement|knee replacement/i.test(body));

console.log("\n=== SUMMARY ===");
console.log(`${results.filter(x => x.pass).length}/${results.length} passed`);
for (const x of results.filter(r => !r.pass)) console.log(`FAIL ${x.n} — ${x.d}`);
await browser.close();
