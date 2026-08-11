# LibaMed — Client Testing Guide

Everything that has been built, where to find it, and a step-by-step script you
can follow to test it yourself. No technical knowledge needed — just a browser.

**This build:** 268 pages · 4 languages (EN / FR / TR / HE) · database live
(London) · sample data cleared.

---

## Contents

1. [Start here](#1-start-here)
2. [Reading this guide](#2-reading-this-guide)
3. [The public website](#3-the-public-website)
4. [What you control as admin](#4-what-you-control-as-admin)
5. [Full test script](#5-full-test-script)
6. [Who sees what](#6-who-sees-what)
7. [Privacy & safety built in](#7-privacy--safety-built-in)
8. [Not built yet](#8-not-built-yet)
9. [Before real patients](#9-before-real-patients)

---

## 1. Start here

The site runs on the developer's machine. Ask them to start it, then open the
address below in Chrome.

| | |
|---|---|
| **Website** | `localhost:3000/en` |
| **Login page** | `localhost:3000/en/login` |
| **Admin email** | `admin@libamed.test` |
| **Admin password** | `Admin!2026demo` |

> ⚠️ **The case list will look empty — that is correct.**
> The five sample referrals we used while building were deliberately deleted, so
> nothing on screen is fake any more. Follow the
> [test script](#5-full-test-script) to create a real one and watch it move
> through the system.

### Changing the language

The address controls the language. Swap `/en` for `/fr`, `/tr` or `/he` — for
example `localhost:3000/fr`. Hebrew flips the entire layout right-to-left
automatically. There is also a language button in the top bar of every page.

**Note on translation:** the public homepage and site navigation are fully
translated. Deeper pages still show English — the framework is in place, the
words simply need supplying.

---

## 2. Reading this guide

Every feature carries one of three labels, so you always know whether something
is finished or still a sketch.

| Label | Meaning |
|---|---|
| ✅ **Working** | Fully built and saving to the database. |
| 🟡 **Screen only** | The page looks right but the button does not save yet. |
| ⚪ **Not built** | Planned, not started. |

---

## 3. The public website

What anyone sees without logging in. Type the address after `localhost:3000`.

| Page | Address | What it shows | Status |
|---|---|---|---|
| **Home** | `/en` | The pitch, how referrals work, your live corridors, and any specialists you feature. | ✅ |
| **Corridors** | `/en/corridors` | Every country route you have published, as cards. | ✅ |
| **One corridor** | `/en/corridors/israel` | Where records are stored, the legal basis, referable specialties, named doctors, partner hospital. | ✅ |
| **Hospitals** | `/en/hospitals` | Partner hospitals you have published. Currently only Sheba. | ✅ |
| **One hospital** | `/en/hospitals/sheba` | Accreditation, specialties, languages, approved doctors. | ✅ |
| **How it works** | `/en/how-it-works` | The referral journey explained for clinicians. | ✅ |
| **For clinicians** | `/en/for-clinicians` | Why referring through LibaMed is safe, plus the data-transfer table per corridor. | ✅ |
| **The Pledge** | `/en/pledge` | Your eight public commitments. | ✅ |
| **Help & glossary** | `/en/faq` | Common questions and plain-English definitions. | ✅ |
| **Specialties** | `/en/specialties` | Placeholder — "coming soon", as agreed, since the list differs per hospital. | 🟡 |
| **Legal** | `/en/legal/privacy` | Privacy, cookies, terms, accessibility, sub-processors. | ✅ |

---

## 4. What you control as admin

Log in with the admin details above. These are the screens where you change what
the public sees — no developer required.

| Screen | Address | What you can do | Status |
|---|---|---|---|
| **Corridors** | `/en/admin/corridors` | Add a whole new country route. Edit its name, where records are stored, and the legal wording patients see. Set which specialties can be referred. Show or hide it publicly. Delete it. | ✅ |
| **Clinicians** | `/en/admin/clinicians` | Your named doctors. Approve, **feature** on the homepage, reject or remove. | ✅ |
| **Hospitals** | `/en/admin/hospitals` | Edit name, city and specialties; publish or hide from the public site. | ✅ |
| **Users & roles** | `/en/admin/users` | Invite staff and assign roles. Creates a real account and shows a one-time password. | ✅ |
| **All cases** | `/en/admin/cases` | Oversight of every referral. | ✅ |
| **Audit log** | `/en/admin/audit` | Permanent record of who did what, when. | ✅ |
| **Consent records** | `/en/admin/consent` | Which patients consented to what, and when. | ✅ |
| **Help & glossary** | `/en/admin/content` | Where FAQ and glossary wording will be edited. | 🟡 |
| **Retention & data requests** | `/en/admin/retention` | How long records are kept; patient data requests. | 🟡 |

### The two changes worth seeing immediately

These prove the admin screens really do drive the public website. Each takes
under a minute.

**1. Hide a corridor and watch it vanish**

Go to `/en/admin/corridors`, press **Edit** on *UK → France*, switch
**Published** off, press **Save corridor**. Now open `/en` in another tab —
France has gone from the homepage. Switch it back on and it returns.
*(France is currently switched off, which is why you may only see three
corridors.)*

**2. Feature a doctor on the homepage**

Go to `/en/admin/clinicians`. You will see eight real doctors. Press the **star**
next to Dr. Noa Peretz. Open `/en` — a new section called *"Specialists you can
be referred to"* now appears with her name, title and hospital. Press the star
again to remove her.

---

## 5. Full test script

About fifteen minutes. This exercises the entire product — from a doctor
creating a referral to the hospital abroad accepting it and replying. Follow it
in order.

> 💡 **Tip:** use two different browsers (or one normal window and one private
> window) so you can stay logged in as two people at once.

### Part A — set up the receiving hospital

1. **Log in as admin.** Go to `/en/login` and sign in with the details above.

2. **Invite a doctor at Sheba.** Go to `/en/admin/users` → **Invite user**. Enter
   any name and an email you will remember, choose role **Receiving clinician**,
   and — this matters — pick **Sheba Medical Center** as the hospital. Press
   **Create account**.

3. **Copy the one-time password.** It appears on screen. **Copy it now** — it is
   shown once and never again. This is deliberate: it is how you would hand
   credentials to a real member of staff.

> ⚠️ **Why the hospital matters.** A receiving doctor only sees referrals sent to
> their own hospital. If you skip that field they will log in to an empty queue —
> which is the system protecting patient data, not a fault.

### Part B — become a referring doctor and send a case

4. **Register as a UK clinician.** In your *second* browser, go to
   `/en/register`. Keep the tab on **Referring clinician**, fill in your details,
   put any 7 digits in the GMC box, choose a password of at least 8 characters,
   and press **Create account**. You land in the doctor's dashboard.

5. **Start a referral.** Press **New referral**. The wizard has seven steps, one
   question per screen.

6. **Patient details, then clinical summary.** Fill in a fictional patient and a
   short reason for referral. Everything is saved as you go — you can close the
   tab and come back.

7. **Choose the destination.** Pick **UK → Israel / Sheba** so your invited
   doctor receives it. Notice some specialties are **crossed out and locked** —
   those are routinely available on the NHS, so the platform refuses to let them
   be referred abroad. Choose **Oncology**.

8. **The NHS declaration.** You must state why NHS care is not the substitute,
   and write a short justification, before **Continue** unlocks. This is the
   safeguard that protects the referring GP.

9. **Documents.** Attach any file, or skip. You can also upload later from the
   case itself.

10. **Patient consent.** Five separate statements — not one blanket tick box.
    Each names the destination country and the legal safeguard. Tick all five.

11. **Review and submit.** Check the summary, then press **Submit referral**. You
    receive a real case reference such as `LM-2026-0101`. Write it down.

### Part C — receive the case abroad

12. **Log in as the Sheba doctor.** Back in your first browser, sign out of admin
    and log in with the invited email and one-time password. You land on
    **Incoming cases** — your new referral is waiting.

13. **Open it and accept it.** Click the case. Under **Next step**, press
    **Accept for review**. The status changes and the button becomes **Submit
    treatment plan** — pressing it moves the case forward, which the referring
    doctor sees immediately.

    > Note: the button moves the case, but the **plan document itself cannot be
    > written yet** — that form is not connected. See section 8.

14. **Send a message.** Open **Messages** from the left, type something and press
    Enter. It saves immediately.

### Part D — see it from the referring side

15. **Switch back to the UK doctor.** Refresh their dashboard. The case now reads
    **Under review**, and the message from Israel is in the thread with a reply
    box.

16. **Open the referral record.** On the case page choose **Referral record**.
    This is the GP's permanent copy: the NHS declaration, the consent wording
    exactly as shown to the patient, and a numbered, tamper-proof history of
    every action. **Print** saves it as a PDF.

17. **Try withdrawing consent.** Choose **Consent record** → tick the
    confirmation → **Withdraw consent now**. The case closes to further
    processing and the withdrawal is written permanently to the record. This
    cannot be undone, so use a test case only.

### Part E — prove the data is private

18. **Try to open someone else's case.** While logged in as the *receiving*
    doctor, paste a case address belonging to nobody, e.g.
    `/en/receiving/cases/LM-2026-9999`. You get a **page-not-found**, not an
    error — the system never reveals that a case exists if you are not entitled
    to see it.

---

## 6. Who sees what

Each person only ever sees the cases their job requires. This is enforced by the
system, not by policy.

| Role | Sees | How they get an account |
|---|---|---|
| **Referring clinician** (UK doctor) | Only the referrals they created. | Signs up themselves with a GMC number. |
| **Receiving clinician** (specialist abroad) | Cases at their own hospital addressed to them, plus any not yet assigned. | Invited by you. |
| **Hospital coordinator** | Everything at their hospital, for scheduling. Can add their own doctors for your approval. | Invited by you. |
| **Case manager** | All cases, for oversight. | Invited by you. |
| **Compliance / admin** | Everything, plus all settings screens. | Invited by another admin. |
| **Patient** | Read-only view of their own single referral. | Invited per referral. 🟡 Partly built. |

---

## 7. Privacy & safety built in

These are the protections the charity's concerns asked for. They are not settings
that can be forgotten — they are enforced every time.

- **Nobody sees another doctor's patients.** Every list and page is filtered to
  the person logged in. Typing another case's address gives a page-not-found.
- **The NHS declaration cannot be skipped.** A referral cannot be submitted
  without stating why NHS care is not the substitute.
- **NHS-routine specialties are blocked.** The platform, not the doctor's
  judgement, holds that line — locked and crossed out in the wizard.
- **Consent is itemised and versioned.** Five separate statements naming the
  country and safeguard, stored with the exact wording shown and the time.
- **Consent can be withdrawn**, which halts processing immediately.
- **The history cannot be edited.** Every action is chained to the one before it,
  so tampering is detectable. Deleting the sample data required a deliberate
  override in the database — the app itself refused.
- **Data location follows the corridor.** Each route carries its own storage
  location and legal basis, applied automatically.
- **No referral fees.** Stated publicly and in the referral flow.

---

## 8. Not built yet

An honest list, so nothing is a surprise in a demo. Nothing here blocks the test
script above.

| Feature | Where it stands | Status |
|---|---|---|
| **Writing the treatment plan** | The case can be *moved* to "plan received", but the specialist cannot yet write and send the actual plan, costs and timeline. The form is on screen but not connected. | 🟡 |
| **The 5-day clinical summary** | Same — the handback document that returns to the UK doctor after treatment cannot yet be written. This is the next priority. | 🟡 |
| **Requesting more information** | The receiving hospital cannot yet formally ask the UK doctor for missing records. | 🟡 |
| **Two-factor login** | Screens exist but codes are not sent or checked. Needed before real patients. | 🟡 |
| **GMC and FCA checking** | Numbers are collected and stored but not verified against the public registers. | 🟡 |
| **Emails** | Nothing is sent for invitations, password resets or case updates. Invited staff get their password on screen instead. | ⚪ |
| **Patient portal access** | The portal is built and private, but connecting a patient account to their specific referral is still to do — a patient currently logs in to "no referral linked". | 🟡 |
| **Insurance / introducer area** | They can register and are held for review, but have no workspace yet, and the UK-doctor co-sign step is not built. | 🟡 |
| **Files attached during the wizard** | Names are recorded but the file itself is not stored. Uploading from the case page afterwards **does** store the real file securely. | 🟡 |
| **Medical image viewer** | Scans can be attached and downloaded but not viewed in the browser. Agreed as out of scope for version one. | ⚪ |
| **Editing FAQ & glossary** | The admin screen lists the content; the edit buttons do not save yet. | 🟡 |

---

## 9. Before real patients

Commercial and legal steps rather than programming, but they must happen before
any genuine patient record enters the system.

- **Upgrade the database to a paid plan and sign the data agreement.** The free
  plan is fine for testing; it is not appropriate for real medical records.
- **France needs specialist hosting.** French health data must sit on
  French-certified "HDS" infrastructure, which our current provider is not. Every
  other corridor is fine where it is. France is currently switched off — keep it
  off until this is arranged.
- **Turn on two-factor login** for all staff.
- **Connect the real GMC and FCA checks** so registrations are verified rather
  than trusted.
- **Set up email sending** for invitations and password resets.
- **Replace the test admin account.** `admin@libamed.test` is not a real address
  and cannot receive a password reset. Create an admin on a real company address
  and remove this one.

> ⚠️ **Please treat the current site as a working demonstration, not a live
> service.** It is safe to explore with invented patients. Do not enter any real
> patient's details until the steps above are complete.

---

*LibaMed clinician-to-clinician referral platform. Screens and addresses accurate
as of this build.*
