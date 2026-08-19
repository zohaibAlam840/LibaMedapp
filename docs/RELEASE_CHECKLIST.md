# What to check after this release

Release `f31cb0d` — 19 Aug 2026. Deployed to libamed.com from `main`.

This release removed invented data from the admin area, closed several
access-control holes, and made partner hospitals and user postings editable.
Because so much of it replaced fixed numbers with live queries, **most of these
checks are "does it show the truth", not "does it render"**.

Work through Part 1 first. Two of the housekeeping steps use controls that only
exist in this build.

---

## Part 1 — Do these first (about 10 minutes)

### 1.1 Confirm the deploy landed

Open `/en/admin/users`. The table should now have a **Hospital** column and a
**Role & posting** column with dropdowns. If it still shows *Organisation /
Status / Created* only, the build has not finished — wait and hard-refresh.

### 1.2 Post a receiving clinician to Anadolu

**Why:** case **LM-2026-0101** was referred to Anadolu Medical Center and no
account is attached to that hospital, so nobody can open it. A receiving
clinician only sees cases at their own hospital.

- `/en/admin/users` → find or invite a receiving clinician
- Set **Role & posting** → Receiving clinician → Anadolu Medical Center → Save
- Sign in as that clinician → **My queue** → LM-2026-0101 should be listed

### 1.3 Fix Dr. Noa Peretz

Her row shows **"Not posted — sees no cases"** in red. She is a receiving
clinician with no hospital, so her queue is empty no matter how many cases
exist. Either post her to Sheba Medical Center, or delete the account if she is
seed data you do not want.

### 1.4 Clear the two pending registrations

`/en/admin/verification` — *Test Doctor* (`itshaiderkiani@gmail.com`) and *Test
Introducer* (`haiderkiani93@gmail.com`) are both waiting. Until a registration
is verified, that person cannot reach any case.

### 1.5 Purge the test data

Paste `supabase/purge_test_data.sql` into the Supabase SQL editor and run it.

It removes the test case **LM-2026-9001**, the `Zzz Referring` account, and the
test audit rows. It has to run there, not in the app, because the audit log is
append-only: the trigger blocks the delete, which is the compliance spine
working as designed.

Then remove the auth users (Authentication → Users) for anything `zzz.*`.

### 1.6 Decide on the seeded demo accounts

`a.chen@nhs.net`, `n.peretz@sheba.health.il`, `patient@example.com` are seed
data, not real people. They are what makes the audit log read like a demo.
Delete them when you are ready.

---

## Part 2 — Check the invented data is gone

Each of these screens used to show numbers that were written into the code. The
check is that what you see now matches what is actually in the database.

| Screen | What it used to say | What it must say now |
|---|---|---|
| `/admin/audit` | 6 fixed events, "12,480 events · hash-chain verified ✓" | Your real entries, and a chain status naming the links it verified |
| `/admin` | Corridor counts 8 / 5 / 4 / 3 | Real counts per corridor (0 where there are no cases) |
| `/admin/attention` | 5 invented tasks | Only items with a record behind them, or "Nothing needs attention" |
| `/admin/consent` | "v2 · 5/5 · 12 Jul 2026" on every row | The stored version, item count and capture date |
| `/admin/hospitals` | "Contracted" / "LOI — in discussion" | Column gone — nothing recorded it |
| `/admin/hospitals` | Accreditation colour by row position | Amber only when the stored expiry is within 3 months |
| `/admin/cases/[ref]` | A 4-row document access log, "9 messages", "74 days" | This case's real audit trail and counts |
| Sidebar badges | Everyone saw "2" and "1" | Your own queue and unread counts, or no badge |

**Audit log specifically:**

- Filters should only offer events and corridors that exist in your log
- **Export CSV** downloads a real file (admins with audit-export permission)
- The footer count should match reality, e.g. "Showing all 35 events in the log"

---

## Part 3 — The referral flow, end to end

Use two browsers (or one normal, one private) so you can be two people at once.

1. **Referring doctor** → New referral → choose a hospital that has a receiving
   clinician posted to it → complete the NHS declaration → tick all five consent
   statements → submit. Note the case reference.
2. **Receiving clinician** → sign in → **My queue** → the case is there →
   open it → **Accept for review**.
3. **Messages** (both sides) → type in one window and watch it appear in the
   other **without refreshing**. Your own message should appear instantly; the
   other side within about 5 seconds.
4. **Admin → Audit log** → every step above is recorded, with the right actor.

Expected timings, measured on this build: own message ~0.3s, other clinician
~3.4s.

---

## Part 4 — Patient portal access

**The rule:** only the referring clinician on a case can issue portal access,
and the account is bound to that one referral. Admins cannot create patient
accounts — they have no case in front of them to bind one to.

1. As the referring doctor, open the case → **Patient access** → enter an email
   → an invitation link is generated and emailed
2. Open the link in a private window → set a password → you land in the portal
3. Confirm the portal shows **that case only**, with a "Read-only" badge
4. Confirm `/en/admin` and `/en/referring/...` both bounce you back to `/portal`

Check the admin invite form no longer offers "Patient (read-only)" as a role.

---

## Part 5 — Partner hospitals

1. `/admin/hospitals` → toggle a partner **live** → open `/en/hospitals` in
   another tab → it appears there (this used to change nothing)
2. Toggle it back → it disappears
3. **Add hospital** → fill in name, city, corridor, accreditation rows and named
   clinicians → Create → you land on its edit page with everything saved
4. Edit an accreditation expiry → Save → reload → the change persisted
5. **Delete** a hospital with no cases → removed. Try one *with* a case → refused

---

## Part 6 — Retention & DSAR (new — migration 004)

1. `/admin/retention` → **Retention schedule** shows your cases with deletion
   dates; France should be 20 years and everything else 10
2. **Log a request** → fill in a subject → it appears under Open requests with a
   one-month deadline counting down
3. **Build export** produces a file of everything held about that person
4. Mark it fulfilled → it moves out of Open

Delete any test request afterwards.

---

## Part 7 — Known gaps (do not report these as bugs)

These are not built yet, and the screens say so where they can:

| Area | State |
|---|---|
| Public **contact form** | Sends nowhere — the enquiry is discarded. Highest-priority fix. |
| Account → **Sessions** | Three hardcoded devices; revoke does nothing. Supabase exposes no session list, so this needs rewriting to "sign out everywhere". |
| Account → **Notifications** | Toggles do not persist |
| Account → **profile** | Displays details, does not save |
| **FAQ & glossary** admin | Lists real content; Add/Edit buttons do nothing until the content moves to a table |
| **Introducer workspace** | They can register, then have nowhere to go. UK-clinician co-sign not built. |
| **Regulatory task tracking** | Attention flags cases needing a KVKK notice; nothing records whether one was filed |
| **Access expiry** | Nothing records when receiving access lapses |
| **GMC / FCA** | Numbers stored, checked by a person — there is no public API |
| **Per-user RLS** | Scoping is enforced in application code, not database policies |
| **DICOM viewing** | Attach and download only — agreed out of scope for v1 |

---

## If something looks wrong

Note the **case reference**, the **account you were signed in as**, and the
**URL**. Nearly every action is written to the audit log, so `/admin/audit`
usually shows exactly what happened and when.
