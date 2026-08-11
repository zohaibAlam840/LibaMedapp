# Message to send the client

Copy whichever version fits. Both assume you attach or link
`CLIENT_TESTING_GUIDE.md`.

---

## Short version — WhatsApp / quick email

> Hi [Name],
>
> The platform is ready for you to try properly. I've written a short guide that
> walks you through it — no technical knowledge needed, just a browser.
>
> **Log in:** `admin@libamed.test` / `Admin!2026demo`
>
> A few things worth knowing before you start:
>
> • **The case list will look empty — that's correct.** I removed all the sample
> data so nothing you see is fake. The guide shows you how to create a real
> referral and follow it through.
>
> • **You now control the site yourself.** Corridors, partner hospitals, and
> which doctors are featured on the homepage are all editable from the admin
> area — change something there and the public site updates immediately. Try
> hiding a corridor; it disappears from the homepage straight away.
>
> • **There's a 15-minute test script** in the guide that takes you end to end:
> invite a doctor at Sheba, register as a UK GP, create a referral, then accept
> it as the hospital abroad and message back and forth.
>
> The guide is honest about what isn't finished yet too — emails, two-factor
> login and the GMC check are the main ones — so nothing catches you out in a
> demo.
>
> Please only use invented patient details for now. Happy to walk through it
> together on a call if that's easier.

---

## Longer version — formal email

> Subject: LibaMed — ready for your review
>
> Hi [Name],
>
> LibaMed is at the point where it's worth you testing it hands-on. I've
> attached a guide written for a non-technical reader: every page, what it does,
> and a step-by-step script you can follow yourself.
>
> **Where things stand**
>
> The platform now does the full job end to end. A UK clinician can register,
> build a referral through a seven-step wizard, and submit it. It arrives in the
> named specialist's queue at the partner hospital abroad, who accepts it, sends
> a treatment plan, and messages back — with everything written to a permanent,
> tamper-proof record.
>
> **What you can now change without a developer**
>
> • **Corridors** — add a whole new country route, edit the legal wording
> patients see, choose which specialties can be referred, and show or hide it
> from the public site.
> • **Featured doctors** — approve clinicians and promote a chosen few onto the
> homepage.
> • **Hospitals** — edit their details and control whether they appear publicly.
> • **Staff** — invite people and set what they're allowed to see.
>
> Changes take effect on the live site immediately. The guide includes two
> one-minute exercises that demonstrate this.
>
> **On the safeguards the charity raised**
>
> These are built in and enforced rather than left to policy: the NHS
> non-substitution declaration cannot be skipped; specialties routinely
> available on the NHS are blocked from overseas referral by the platform
> itself; patient consent is captured as five separate itemised statements
> naming the destination country and legal safeguard; consent can be withdrawn,
> which halts processing; and the full history of a case cannot be edited or
> deleted.
>
> I also closed a serious issue this week: previously any signed-in clinician
> could see every referral in the system. Access is now strictly limited to the
> cases each person is entitled to — a doctor cannot reach another's patients
> even by typing the address directly.
>
> **What isn't finished**
>
> Set out plainly in section 8 of the guide. The main gaps are email sending,
> two-factor login, and the live GMC/FCA register checks — all needed before
> real patients, none of which block your testing.
>
> **Login**
>
> Website: `localhost:3000/en`
> Email: `admin@libamed.test`
> Password: `Admin!2026demo`
>
> Please treat this as a working demonstration and use invented patient details
> only. Section 9 lists what needs to happen commercially — a paid database plan
> with a data agreement, and specialist French hosting — before any genuine
> patient record goes in.
>
> Happy to run through it on a call whenever suits.
>
> Best,
> [Your name]

---

## Notes before you send

- **The password is in these messages.** Fine for a test account with invented
  data. If it's going anywhere public, send the login separately from the guide.
- **Addresses say `localhost:3000`** — they only work on the developer's machine.
  Once it's deployed somewhere the client can reach, swap in the real web address
  throughout the guide (find and replace `localhost:3000`).
- **France is currently hidden** on the public site. If you'd rather they saw all
  four corridors during the demo, switch it back on at
  `/en/admin/corridors` first.
