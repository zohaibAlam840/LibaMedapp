# What to check after this release

Latest release — 19 Sep 2026 (previous: `0c1bf83`, same day; `f31cb0d`, 19 Aug).
Deployed to libamed.com from `main`.

> **Run migrations 005, 006 and 007 first,** in that order. Paste
> `supabase/migrations/005_contact_prefs_content.sql`,
> `supabase/migrations/006_introducer_cosign.sql` and
> `supabase/migrations/007_regulatory_access.sql` into the Supabase SQL editor. Until you do, the contact form tells senders to email instead,
> editing help content is disabled, and notification preferences cannot save —
> each screen says so rather than failing quietly. Without 006 the introducer
> workspace and the co-sign queue say so too, and refuse to take a case rather
> than discarding what someone typed about a patient. Without 007, Attention
> falls back to flagging the same regulatory duty on every load, exactly as it
> did before.

The August release removed invented data from the admin area and closed several
access-control holes. **This September release wires the screens that looked
finished but did nothing**: the contact form, notification preferences, help
content editing, and sessions (Part 7) — and builds the one part of the
product that was missing rather than broken: the introducer workspace and
UK-clinician co-sign (Part 8).

Because both releases largely replaced fixed numbers with live queries, **most
of these checks are "does it show the truth", not "does it render"**.

Work through Part 1 first.

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

## Part 7 — This release: the screens that now work

### 7.1 Contact form → admin inbox

1. Open `/en/contact` signed out and send a message.
2. You should see **"Thanks — we have your message"**, not a silent reset.
3. Sign in as admin → **Enquiries** (under Operate) → it is there.
4. Add a note, press **Mark answered** → it moves to Answered & archived.
5. Check it also arrived by email. If the email fails the enquiry is still in
   the inbox — it is stored before any mail is attempted.

### 7.2 Notification preferences → real emails

1. `/en/account/notifications` — the three toggles save and survive a reload.
2. Turn **New secure message** off for one clinician.
3. Message that clinician from the other side of a case — no email.
4. Turn it back on and message again — an email arrives naming the case.

Emails deliberately contain **no patient detail**, only the case reference and
what changed. Clinical content in one of these emails would be a bug worth
reporting immediately.

### 7.3 Help & glossary editing

1. `/en/admin/content` → **Add question** → save.
2. Open `/en/faq` — the new question is live.
3. Edit an existing answer, reload the public page — the change is there.
4. Delete the test question.

An amber "migration 005" notice means the migration has not been run yet.

### 7.4 Sessions

`/en/account/sessions` no longer lists invented devices. **Sign out on all
devices** should end this session and every other one — check a second browser
is signed out too.

### 7.5 Password reset

`/en/admin/users` → **Reset password** on any account but your own. A new
password is shown once and emailed. This is how to make `a.chen@nhs.net` and
the other unknown-password accounts usable instead of deleting them.

---

## Part 8 — Introducer origination & UK co-sign (new — migration 006)

This is the part of the product that previously did not exist: an introducer
could register and then had nowhere to go.

**The rule it enforces:** an introducer can WRITE a case but never SEND one. A
referral only reaches a hospital when a UK-registered clinician co-signs it, and
signing makes that clinician the referring clinician of record.

1. **Sign in as an introducer** (`/en/admin/verification` has two pending
   registrations you can approve, or invite one). You land on
   `/en/introducer` — not on the "nowhere to go" page.
2. **Start a case** → patient reference, corridor, background → Create draft.
3. Confirm the draft is invisible to everyone else: sign in as an admin and
   check `/en/admin/cases`; as a receiving clinician, check your queue. The
   hospital you chose must **not** see it.
4. **Submit for co-sign**. A pending (unverified) introducer should find the
   button disabled with a reason — drafting is allowed while the FCA or employer
   check runs; submitting is not.
5. **Sign in as a referring clinician** → **Co-sign** in the sidebar, with a
   count badge → open the case.
6. **Send back** with a note → the introducer sees the note and the case is a
   draft again. They should also get an email.
7. Revise, resubmit, then **Co-sign and send**: choose the NHS non-substitution
   reason, write the justification, tick the responsibility statement.
8. The case now behaves like any other referral: it appears in **My cases** for
   the clinician who signed, in the receiving hospital's queue, and in the audit
   log with both names — who raised it and who signed it.

Two clinicians opening the same case cannot both sign it; the second gets
"another clinician may have taken it".

---

## Part 9 — Regulatory filings & access windows (new — migration 007)

Two things the admin area flagged but never recorded. Both are now records, so
a completed task looks different from an outstanding one.

### 9.1 Regulatory filings

Only the **Turkey corridor** owes a notice today (KVKK, within 5 business days
of the first transfer) — every other corridor transfers under an adequacy
decision and owes nothing.

1. `/en/admin/attention` → **Regulatory tasks** shows the KVKK notice as
   **Not filed**.
2. **Regulatory** (under Govern) → record the filing: date, the regulator's
   reference, and a review date if it needs renewing.
3. Reload Attention — the item is **gone**. That is the point: before this it
   was flagged on every load whether or not anything had been done, which is
   how an admin learns to ignore a governance page.
4. Set a review date in the past and it comes back as **Due for review**, not
   as "never filed".

### 9.2 Access windows

The `access-expired` status existed from the first schema with nothing able to
set it. The window now starts when a hospital **accepts** a case — not when it
is submitted, because a case waiting in a queue is not being worked on.

1. As a receiving clinician, **Accept for review** on any case.
2. `/en/admin/cases/<ref>` → **Receiving access** shows a date about 90 days
   out (the per-corridor default).
3. Cases inside 14 days, or past their date, appear on Attention.
4. To check enforcement, set one case's date into the past in the SQL editor:
   `update referrals set access_expires_at = current_date - 1 where ref = '<ref>';`
   The receiving clinician should still **see** the case — with a banner saying
   why — and every write on it should be refused. The referring clinician and
   admins are unaffected: it is the hospital's window that closes.
5. **Extend window** on the admin case page, with a reason. The extension is
   written to that case's audit trail with the old and new dates.

Migration 007 backfills a window onto cases that have already been accepted,
measured from their last activity, so existing cases do not all expire at once.

---

## Part 10 — Known gaps (do not report these as bugs)

These are not built yet, and the screens say so where they can:

| Area | State |
|---|---|
| **Introducer case documents** | An introducer writes background text; attaching scans stays the co-signing clinician's job |
| **GMC / FCA** | Numbers stored, checked by a person — there is no public API |
| **Per-user RLS** | Scoping is enforced in application code, not database policies |
| **DICOM viewing** | Attach and download only — agreed out of scope for v1 |

---

## If something looks wrong

Note the **case reference**, the **account you were signed in as**, and the
**URL**. Nearly every action is written to the audit log, so `/admin/audit`
usually shows exactly what happened and when.
