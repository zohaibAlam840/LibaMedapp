# LibaMed — Project Status

Where the build stands, what remains, and the recommended order of work.

**Current build:** 268 pages · 4 languages (EN / FR / TR / HE, Hebrew RTL) ·
Supabase Postgres live in London · TypeScript clean · production build passing.

---

## Contents

- [Part 1 — What has been built](#part-1--what-has-been-built)
- [Part 2 — What is left](#part-2--what-is-left)
- [Part 3 — Recommended order of work](#part-3--recommended-order-of-work)
- [Part 4 — Commercial & legal (not code)](#part-4--commercial--legal-not-code)

---

# Part 1 — What has been built

## 1.1 Foundation

| Item | State | Notes |
|---|---|---|
| Route structure | ✅ Done | 268 pages under `app/[locale]/`, grouped `(public)` / `(auth)` / `(app)` / `(patient)` / `(system)`. |
| Design system | ✅ Done | Tokens in `app/globals.css`; native-element components in `components/ui/` (no shadcn, deliberately). Rubik typeface for native Hebrew. |
| Internationalisation | 🟡 Partial | 4 locales wired, Hebrew flips RTL. **Translated:** public site chrome + full homepage. **Not translated:** deeper public pages, all dashboard/app screens. |
| Mobile / responsive | ✅ Done | Desktop sidebar collapses to icon rail; mobile bottom tab bar with 5-item cap + More sheet. |
| PWA shell | ✅ Done | Service worker caches the shell only — never patient data offline. |

## 1.2 Compliance spine — the seven NHS safeguards

The charity's concerns are enforced by the system, not left to policy.

| # | Safeguard | State | How it works |
|---|---|---|---|
| 1 | NHS non-substitution declaration | ✅ Done | Required intake step. Reason + written justification (min. 10 chars) before Continue unlocks. Written to the audit trail. |
| 2 | Immutable audit trail | ✅ Done | Append-only table, SHA-256 hash-chained per referral via database triggers. `UPDATE`/`DELETE` blocked at the database level — proven when deleting sample data required a deliberate trigger override. GP-facing record page with print-to-PDF. |
| 3 | Continuity of care / handback | 🟡 Partial | Status and overdue flags exist and display. The 5-working-day clinical summary itself cannot yet be submitted (see 2.1). |
| 4 | No referrer fee | ✅ Done | Standing notice in the GP flow, on corridor pages, and in public legal copy. |
| 5 | Corridor transfer-basis tagging | ✅ Done | Each corridor carries adequacy vs SCC/IDTA. Surfaced before submit, on consent, and publicly. Turkey's KVKK 5-business-day notification is tracked and displayed. |
| 6 | Separate itemised patient consent | ✅ Done | Five discrete statements naming destination country + safeguard — never one blanket checkbox. Stored with exact wording and timestamp. Withdrawal halts processing. |
| 7 | Eligibility gating | ✅ Done | Specialties marked "routinely available on the NHS" are struck through and locked in the wizard. Admin-configurable per corridor. |

## 1.3 Database

| Item | State | Notes |
|---|---|---|
| Supabase Postgres | ✅ Live | Project in **London (eu-west-2)**. Free tier — testing only. |
| Schema | ✅ Done | 10 tables: corridors, corridor_specialties, hospitals, doctors, profiles, referrals, patient_consent, documents, messages, audit_log. Constraints mirror the TypeScript types exactly. |
| Audit triggers | ✅ Done | Sequence + hash chain computed in-database; immutability trigger blocks edits and deletes. |
| Row Level Security | 🟡 Partial | Enabled default-deny on every table. Access is currently enforced in the application layer (see 1.5), not by per-user RLS policies. |
| File storage | ✅ Done | Private `case-documents` bucket. Downloads via short-lived signed URLs only. |
| Sample data | ✅ Cleared | The five demo referrals and all their messages, consents and audit rows were purged. Corridors, hospitals, doctors and accounts kept. |

## 1.4 Authentication

| Item | State | Notes |
|---|---|---|
| Email + password login | ✅ Done | Real Supabase Auth. Session refreshed on every request. |
| Self-registration | ✅ Done | Referring clinicians (GMC) and introducers only. All other roles are invited. |
| Invite-based provisioning | ✅ Done | Admin creates the account and receives a one-time password to hand over. |
| Route protection | ✅ Done | Unauthenticated users are redirected to login; non-clinicians cannot reach clinician areas. |
| Bootstrap admin | ✅ Done | `admin@libamed.test` / `Admin!2026demo`, re-creatable via `scripts/ensure-admin.mjs`. |
| Two-factor (MFA) | ⚪ Not built | Screens exist; no codes issued or verified. |
| Password reset | ⚪ Not built | Screen exists; requires email sending. |

## 1.5 Access control — who can see what

A significant defect was found and fixed during this phase: **every signed-in
clinician could previously read every referral in the database.** Access is now
scoped on every query.

| Role | Sees |
|---|---|
| Referring clinician | Only referrals they created. |
| Receiving clinician | Cases at their own hospital addressed to them, plus unassigned ones there. |
| Hospital coordinator | All cases at their hospital. |
| Case manager | All cases. |
| Admin | Everything, plus configuration. |
| Patient | Their own single referral, read-only. |
| Anyone else | Nothing. |

Unauthorised access returns **page-not-found**, never an error — the existence
of a case is not revealed to someone not entitled to see it. Write actions
re-check permission server-side; the client is never trusted.

## 1.6 Working end-to-end flows

| Flow | State | Notes |
|---|---|---|
| Create a referral | ✅ Done | 7-step wizard, autosaves across steps and refreshes. Writes referral + itemised consent + document rows + audit entries. Issues a real case reference. |
| Secure messaging | ✅ Done | Both directions, Enter-to-send, audited. |
| Case status progression | ✅ Done | Accept → under review → plan received → confirmed → complete → summary returned. Each transition audited. |
| Consent withdrawal | ✅ Done | Confirmation-gated, halts processing, permanently recorded. |
| Document upload | ✅ Done | Real files to private storage from the case page, with audit entry. |
| Patient portal | ✅ Done | Portal is private and scoped to one referral. The referring clinician issues a single-use invitation from the case (14-day expiry); redeeming it binds the account to that referral, and both steps are written to the case audit trail. |

## 1.7 Admin control surfaces

Everything here changes the live public site with no developer involvement.

| Screen | State | Capability |
|---|---|---|
| Corridors | ✅ Done | **Create** new country routes, edit legal wording and residency, set referable specialties with NHS availability, publish/hide, delete (blocked while referrals reference it). |
| Clinicians | ✅ Done | Add doctors, approve/reject, **feature** on the homepage, remove. |
| Hospitals | ✅ Done | Edit identity and specialties, publish/hide from the public directory. |
| Users & roles | ✅ Done | Invite staff, assign role and hospital, issue one-time password. |
| Cases / Audit / Consent | ✅ Done | Read-only oversight across all cases. |
| Help & glossary | 🟡 Screen only | Lists content; edit buttons do not save. |
| Retention & DSAR | 🟡 Screen only | Displays policy; no workflow behind it. |

## 1.8 Public marketing site

| Item | State |
|---|---|
| Homepage, How it works, For clinicians, Pledge, FAQ, legal pages | ✅ Done |
| Corridor directory + per-corridor detail pages | ✅ Done |
| Hospital directory + detail pages | ✅ Done |
| Featured specialists section (admin-driven) | ✅ Done |
| Specialties page | 🟡 Deliberate placeholder — list differs per hospital |

---

# Part 2 — What is left

## 2.1 Blocks a genuine pilot

These prevent the product from completing its core promise.

### ▲ Treatment plan submission — **not built**
The receiving specialist can move the case to "plan received", but **cannot
actually submit a plan**. The page at
`/receiving/cases/[id]/treatment-plan` is a form with no save behind it.
Needs: plan content, itemised cost estimate, proposed timeline, stored and
shown to the referring clinician.

### ▲ Clinical summary / handback — **not built**
Same situation at `/receiving/cases/[id]/summary`. This is the **5-working-day
structured handback to UK care** — one of the platform's headline commitments
and NHS safeguard #3. The status can be flipped; the document cannot be
produced.

### ▲ Request more information — **not built**
`/receiving/cases/[id]/request-info` does not save. The receiving side cannot
formally request missing records.

### ▲ Two-factor authentication
Mandated for clinical data. Screens exist; the mechanism does not.

### ▲ Transactional email
Nothing is sent — no invitations, password resets, or "your case has moved"
notifications. Invited staff currently receive their password on screen.
Without this the product cannot operate unattended.

### ▲ GMC / FCA verification
Registration numbers are collected and stored but never checked against the
public registers. Currently any 7 digits is accepted.

## 2.2 Completes the product

| Item | Notes |
|---|---|
| Introducer workspace | Insurance/broker accounts register and are held for review, but have no workspace. |
| UK-clinician co-sign | The safeguard that makes introducer-originated cases legitimate. Designed, not built. |
| Intake file uploads | Files chosen during the wizard record their name only; bytes are not stored. Uploading from the case page afterwards works correctly. |
| Account / profile editing | `/account` displays details but does not save changes. |
| Search and filters | Filter checkboxes and search boxes on dashboards are visual only. |
| Notifications | No in-app notification centre or unread tracking beyond seeded counts. |
| Per-user RLS policies | Move access enforcement into the database as defence in depth. |
| Help & glossary editing | Wire the admin content screen to save. |
| Retention & DSAR workflow | Automated retention periods and data-subject request handling. |

## 2.3 Deferred by agreement

| Item | Notes |
|---|---|
| DICOM image viewer | Out of scope for v1. Scans upload and download; they cannot be viewed in-browser. |
| FHIR interoperability | Out of scope for v1. |
| Specialties directory | Deliberate "coming soon" — content differs per hospital. |
| Full translation of app screens | Framework is in place; wording needs supplying. |
| SMS, AI document processing | Out of scope for v1. |

## 2.4 Known limitations to be aware of

- **New corridors do not enforce residency rules.** An admin types the residency
  as free text. France-style hard requirements (HDS-certified hosting) are a
  code-level rule and will not apply automatically to an admin-created corridor.
- **Hospital accreditation and named clinicians** on the hospital edit screen are
  read-only; they are managed elsewhere.
- **Deleting a corridor is blocked** while any referral references it — by
  design, to avoid orphaning live cases.

---

# Part 3 — Recommended order of work

### Stage 1 — close the clinical loop *(highest value)*
1. **Treatment plan submission** — content, cost estimate, timeline.
2. **Clinical summary / handback** — delivers the 5-day promise and safeguard #3.
3. **Request more information.**

After this stage the product does, end to end, what it claims to do.

### Stage 2 — make it operable unattended
4. **Transactional email** — invitations, resets, case-movement notifications.
5. **Two-factor authentication.**

### Stage 3 — trust and verification
6. **GMC / FCA register checks.**
7. **Per-user RLS policies.**
8. **Session and device revocation, 90-day inactivity expiry.**

### Stage 4 — completeness
10. Introducer workspace + UK-clinician co-sign.
11. Intake file uploads, profile editing, working search and filters.
12. Help & glossary editing, retention and DSAR workflow.
13. Translation of app screens.

---

# Part 4 — Commercial & legal (not code)

Must be resolved before any genuine patient record enters the system.

| Item | Why |
|---|---|
| **Paid database tier + data processing agreement** | The free tier is not appropriate for real medical records. (Note: a "DPA" — not a "BAA", which is US/HIPAA terminology.) |
| **France on HDS-certified hosting** | French health data must sit on HDS-certified infrastructure. Supabase is not HDS-certified. **France is currently unpublished — keep it that way until resolved.** Israel, Turkey and Switzerland are fine where they are. |
| **Turkey KVKK notification** | A notification is due within 5 business days of first transfer. The platform tracks and displays this; someone must action it. |
| **Replace the bootstrap admin** | `admin@libamed.test` is not a real address and cannot receive a password reset. |
| **Deployment** | The application currently runs only on the developer's machine. Vercel is suitable for the frontend, but PHI must not be stored in a US region. |
| **Penetration test / security review** | Standard expectation before handling clinical data. |

---

## Reference — useful commands

```bash
npm run dev                        # start the site (localhost:3000)
node scripts/ensure-admin.mjs      # restore the admin login
node scripts/ensure-storage.mjs    # ensure the document bucket exists
node scripts/create-account.mjs <email> <password> <role> "<Name>"
```

If the dev server errors with `ENOENT ... .next/dev/*-manifest.json`, a stale
process is running: stop it, delete `.next`, and start again. It is not a code
fault.

---

*Status accurate as of this build. See `CLIENT_TESTING_GUIDE.md` for the
non-technical walkthrough.*
