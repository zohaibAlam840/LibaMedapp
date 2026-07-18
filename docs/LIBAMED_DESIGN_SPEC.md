# LibaMed — Design System & UI Spec

**For Claude Code.** Read this alongside `docs/LIBAMED_C2C_SPEC.md`. This translates a set of reference designs ("Mind Bridge" mental-health platform) into a reusable design system for LibaMed's 67 V1 pages. Build the shared tokens + components first, then compose screens from them.

> **Important framing.** The reference images are a *consumer wellness* product. LibaMed is a *clinician-facing, PHI-handling, cross-border medical referral tool*. We keep the reference's **structure, layout patterns, spacing, blue accent, rounded cards, and icon-rail/3-panel compositions**. We deliberately **adapt** three things: (1) tone down glassmorphism/translucency so text meets **WCAG 2.2 AA** contrast; (2) replace floral photo backgrounds with a calm neutral/subtle-gradient surface; (3) treat patient identity carefully — patients are **not** users, so we don't splash patient names/avatars around the way the reference splashes clients. Details in §7.

---

## 1. The design language in one paragraph

Soft, rounded, airy, blue. White cards with generous padding float on a light surface. A narrow **icon-rail sidebar** on the left (circular buttons; active = filled dark-navy circle). Content is organised into **panels** — often three side by side (list → detail → meta). Primary actions are **dark-navy pill/rounded buttons**; everything selectable is a **pill/chip**. Accent is a friendly **sky blue**, used for selected states, links, progress bars, charts, and (in the reference) even the star ratings. Typography is a clean humanist sans, sentence case, dark navy headings with grey secondary text. Numbers are big in stat cards. Corners are large, shadows are soft and diffuse. The overall feeling is calm, trustworthy, and uncluttered — which is exactly right for stressed clinicians, once we strip the decorative excess.

---

## 2. Design tokens

Approximate values read from the references — refine once, then treat as canonical. Expose as CSS variables (and Tailwind theme extend). Names below are the intended semantic tokens.

### 2.1 Color

| Token | Value (approx) | Use |
|---|---|---|
| `--accent` | `#3B82D6` | primary brand blue: links, selected states, focus, chart, star |
| `--accent-hover` | `#2E6FC0` | hover for accent |
| `--accent-soft` | `#E8F1FC` | selected chip bg, soft highlight fill |
| `--accent-border` | `#BBD6F5` | selected chip / soft border |
| `--accent-grad-from` | `#7EB8F0` | progress/chart gradient start |
| `--accent-grad-to` | `#6E8AE8` | progress/chart gradient end (periwinkle) |
| `--navy` | `#182238` | primary buttons, active nav circle, strong headings |
| `--navy-hover` | `#232F49` | primary button hover |
| `--text-primary` | `#1E2433` | headings, key text |
| `--text-secondary` | `#6B7280` | body secondary, labels |
| `--text-muted` | `#9CA3AF` | timestamps, hints, disabled |
| `--surface-card` | `#FFFFFF` | card background |
| `--surface-page` | `#F5F8FC` | app page background (calm, replaces floral bg) |
| `--surface-subtle` | `#F4F5F7` | default chip bg, inset areas |
| `--border` | `#E5E7EB` | hairline borders, dividers |
| `--border-strong` | `#D1D5DB` | hover/emphasis borders |
| `--success-bg` | `#D8F3DE` | positive delta pill bg |
| `--success-text` | `#2E7D46` | positive delta text |
| `--danger-bg` | `#FCE4E4` | negative/alert pill bg |
| `--danger-text` | `#C0392B` | negative/alert text |
| `--warning-bg` | `#FBEFD6` | warning pill bg |
| `--warning-text` | `#8A5A0B` | warning text |

**Dark mode:** provide a dark variant (surfaces → deep navy `#0F1626`/`#16203A`, text inverts, accent stays). Not required for V1 launch but wire tokens so it's a theme swap, not a rewrite.

### 2.2 Typography
- **Font:** a clean humanist/geometric sans. The reference looks like a rounded sans (e.g. *Onest* / *General Sans*). Safe, accessible default: **Inter**. Pick one, load via `next/font`.
  - **Build decision:** **Rubik** was chosen — Inter on Google Fonts has no Hebrew subset, and Hebrew is a mandated locale. Rubik is a rounded humanist sans with native Hebrew + latin-ext (Turkish), closer to the reference's rounded look.
- **Scale (sentence case everywhere, never Title Case, never ALL CAPS):**

| Role | Size | Weight |
|---|---|---|
| Greeting / page hero | 28–32px | 600 |
| Card / panel title | 18px | 600 |
| Stat number | 32–36px | 600 |
| Body | 15px | 400 |
| Section label | 13px | 500 (secondary color) |
| Meta / timestamp | 12px | 400 (muted) |

- Line-height ~1.5 for body. Two weights in practice (400, 600) — avoid a heavy 700.

### 2.3 Radius, spacing, shadow, blur

| Token | Value | Use |
|---|---|---|
| `--radius-panel` | `24px` | outer panels / large containers |
| `--radius-card` | `16px` | cards |
| `--radius-inner` | `12px` | inputs, inset cards, buttons |
| `--radius-pill` | `999px` | chips, tags, toggles, segmented control |
| icon button | `50%` | circular icon buttons / avatars |
| spacing scale | `4 · 8 · 12 · 16 · 20 · 24 · 32` | padding/gaps; card padding = 20–24 |
| `--shadow-card` | `0 4px 20px rgba(30,58,95,0.06)` | resting cards |
| `--shadow-elevated` | `0 8px 30px rgba(30,58,95,0.10)` | popovers, active |
| blur (adapted) | `backdrop-filter: blur(12px)` **on solid-ish surfaces only** | see §7.1 — keep translucency low so contrast holds |

---

## 3. Core layout patterns (walk-through of each reference)

Each reference image demonstrates a pattern we reuse. Here's what to extract from each, and which LibaMed screens it feeds.

### 3.1 Icon-rail sidebar (all images 2–5)
A narrow (~72px) vertical rail: brand logo top; a stack of **circular icon buttons**; two utility icons (help, flag) pinned bottom. **Active item = solid dark-navy circle, white icon; inactive = no fill (or faint circle), grey icon.** Tooltips on hover.
→ This is the **`(app)` layout** shell for LibaMed. Nav items: Dashboard, Cases, Messages, Hospitals/Corridors, Documents/Guides, (admin sees more). On **mobile it collapses to the bottom tab bar** already scaffolded. **RTL: rail moves to the right** (§7.3).

### 3.2 Secondary list + filter panel (images 2 & 4 — "Doctors" / "Type of Consultation")
A column with a titled, checkable **list of people** (avatar + name + role + checkbox) and a **filter group** of checkboxes below. Used to scope the main view.
→ LibaMed: the **filter panel on the referring dashboard and receiving queue** — filter cases by corridor, status, specialty, and (for admin) hospital. Same checkable-list + checkbox-group pattern; content becomes corridors/statuses, not doctors.

### 3.3 Three-panel workspace (image 3 — "Messages")
Four zones: icon rail | **inbox list** (tabs, search, conversation rows with avatar/name/preview/time/unread badge) | **conversation** (header with call/menu, message bubbles incoming vs outgoing, image + voice attachments, composer with attach + mic) | **details panel** (contact info rows, attachments grid, notes with dates).
→ LibaMed **secure messaging** (pages #38/#47) maps almost directly. Adaptations: the left list is **cases**, not patients; the right "details" panel becomes **case metadata** — patient *reference* (not full identity), corridor, data-residency region, consent status, document list, and a link to the audit trail. Drop the "photos/voice notes" social feel; keep threaded messages + document attachments. **No patient contact-info block** like the reference shows.

### 3.4 Dashboard bento grid (images 4 & 5)
Greeting header + notification/settings/avatar cluster (top-right pill). Then a **bento layout**: a row of **stat cards** (label, big number, colored delta pill, description, progress bar), a **chart card** (bar chart with Week/Month/Year segmented control), a side **"Upcoming" panel** (week strip + list of items with avatar + time), a highlighted **support/action card**, and **list cards** (recent items with play/▶ or status).
→ LibaMed dashboards: **referring dashboard** (#29) = "my cases" list + a few light stat cards (open cases, awaiting response, action needed); **admin dashboard** (#50) = case-flow overview across corridors. **Keep V1 stat cards modest** — full analytics/KPI charts are V1.5 (per spec §8.3/§15). Reuse the greeting header, the top-right cluster, the bento grid, and the "Upcoming/Action needed" side panel now; hold the rich charts for later.

### 3.5 Booking/intake wizard card (image 1 — "Make an appointment")
Left card is a guided flow: **category chips** → **selectable provider cards** (avatar, name, role, rating) → **horizontal date strip** (weekday + number, selected highlighted) → **time-slot chips** (available / selected / disabled-grey) → **summary bar** (chosen values) + dark **CTA button**.
→ This is the pattern for LibaMed's **6-step referral intake wizard** (#30–#35): step layout, chip selection, the summary bar, and the dark primary CTA all transfer. Content changes: "category" → **specialty**; "choose a doctor" → **corridor + named receiving specialist**; date/time slots aren't part of a referral, so that step becomes **document upload** and **itemised consent**. Keep it **one question per screen with autosave** (spec §8.4), not the all-in-one card the reference uses.

### 3.6 Profile / detail card (image 1 right — doctor profile)
Avatar, name, rating, a row of **circular action buttons**, a **Biography** block with "See more", **tag groups** (Approach), and an **experience card** (org logo + role + dates).
→ LibaMed **hospital profile** (#6) and **receiving-clinician** detail: swap bio/approach for **accreditation (JCI/ISO + expiry), specialties (controlled taxonomy tags), languages spoken, international patient office, insurance/payment**, and named clinicians. The card structure (header + tag groups + credentials card) is reused as-is.

### 3.7 Schedule / calendar grid (image 2)
Multi-column day view, time rows, colored event blocks, Day/Week/Month segmented control, date nav arrows.
→ **Not central to LibaMed** (there's no appointment calendar). Don't build the calendar grid for V1. But reuse its **segmented control**, **date-nav header**, and **colored status blocks** for things like the case timeline (V1.5) and status chips.

---

## 4. Component inventory (build these once, in `components/ui/`)

Map to **shadcn/ui** where noted (you're on Next.js; shadcn gets us accessible primitives fast). Each needs the states listed.

> **Build decision:** shadcn was **not** installed — on this Next 16.2 / React 19.2 / Tailwind v4 stack, `shadcn init` rewrites globals.css with its own token schema and adds radix/cva deps; every V1 component below is either fully custom or built on native elements (radio/checkbox inputs, `<button>`) with equivalent accessibility. APIs are kept swap-compatible so shadcn can be adopted later where genuinely needed (dialogs, popovers, selects).

| Component | States / variants | shadcn base | Used on |
|---|---|---|---|
| `IconRailButton` | default, active (navy circle), hover, badge | — (custom) | app shell nav |
| `PrimaryButton` | default (navy), hover, loading, disabled | `Button` | CTAs everywhere |
| `Chip` / `Tag` | default, selected (accent-soft + accent border/text), disabled | `Badge`/`Toggle` | intake, filters, specialties |
| `SegmentedControl` | 2–4 options, one active | `Tabs`/`ToggleGroup` | Day/Week/Month, Patients/Doctors |
| `StatCard` | label, number, delta pill (+green/−red), description, progress | `Card` | dashboards |
| `ProgressBar` | solid, gradient, striped/"projected" | `Progress` | stat cards, exercises |
| `DeltaPill` | positive (green), negative (red), neutral | `Badge` | stat cards |
| `PersonCard` | avatar, name, role, rating, selectable/selected | `Card` | provider/clinician select |
| `Avatar` | image, initials fallback, online-dot, sizes | `Avatar` | lists, headers |
| `IconButton` | circular, sizes, active | `Button` icon | actions, header cluster |
| `SearchInput` | pill, leading icon, clear | `Input` | list/inbox headers |
| `Checkbox` | unchecked, checked (accent), indeterminate | `Checkbox` | filters, consent items |
| `Toggle` | off, on (accent) | `Switch` | settings, notifications |
| `ListRow` | avatar + title + subtitle + meta + badge; hover/selected | — | inbox, cases, upcoming |
| `MessageBubble` | incoming (subtle grey), outgoing (accent-soft), attachment, timestamp, read-tick | — | messaging |
| `Composer` | textarea, attach, send; (drop mic/voice) | — | messaging |
| `DetailPanelRow` | icon + label + value; toggle variant | — | case/meta panel |
| `DateStrip` | weekday+date cells, selected, arrows | — | (V1.5 timeline) |
| `StatusChip` | maps case statuses to color+label (never color alone) | `Badge` | case status |
| `NotesCard` | dated entries, add | `Card` | case notes (admin/governance) |
| `TopBarCluster` | notifications + settings + avatar in a pill container | — | app header |
| `EmptyState` / `Skeleton` | for every list/panel | `Skeleton` | all data views |
| `Wizard` shell | step indicator, autosave, back/next, summary bar | — | intake #30–35 |

Statuses to standardize (`StatusChip`): `Submitted`, `Under review`, `Treatment plan received`, `Confirmed`, `Treatment complete`, `Summary returned`, plus `Consent withdrawn` / `Access expired`. Each = distinct color **and** text label.

---

## 5. Reference-image → LibaMed screen mapping (quick index)

| Reference image | Pattern | LibaMed screens it drives |
|---|---|---|
| **1 — Make an appointment** (left) | guided selection card, chips, summary bar, CTA | intake wizard #30–35 |
| **1 — Doctor profile** (right) | profile + tags + credentials card | hospital profile #6; receiving-clinician detail |
| **2 — Schedule** | icon rail, filter panel, segmented control, colored blocks | app shell nav; dashboard/queue filters; (calendar itself skipped) |
| **3 — Messages** | 3-panel: list \| thread \| details | secure messaging #38/#47; case detail + meta panel |
| **4 — Component close-ups** | stat cards, checkable list, bar chart, checklist card | dashboard cards #29/#50; filters; consent checklist |
| **5 — Full dashboard** | bento grid, greeting, top cluster, upcoming panel | referring dashboard #29; admin dashboard #50 |

---

## 6. Screen composition notes (how patterns assemble per area)

- **`(app)` layout** = icon rail (desktop) / bottom tab bar (mobile) + `TopBarCluster` + page slot. RTL-aware.
- **Referring dashboard (#29)** = greeting header + 3–4 `StatCard`s (open, awaiting response, action needed) + filter panel + `ListRow` case list. Modest, not the reference's dense analytics.
- **Intake wizard (#30–35)** = `Wizard` shell, one question per step, `Chip`/`Checkbox`/upload per step, persistent summary bar + `PrimaryButton`. Autosave between steps.
- **Case detail (#37)** = header (case ref + `StatusChip`) + status tracker + documents list + entry to messaging.
- **Messaging (#38/#47)** = 3-panel from image 3, with the right panel = **case metadata** (ref, corridor, residency region, consent status, documents, audit link), not patient contact info.
- **Receiving queue (#42)** = filter panel + `ListRow` queue (named-specialist only) + `StatusChip`.
- **Hospital profile (#6) / add-edit (#52/#53)** = profile-detail pattern (image 1 right) with accreditation/specialty/language/credential blocks; admin edit is the same shell in form mode.
- **Admin dashboard (#50)** = bento grid: case-flow overview + corridor/consent/residency confirmation cards. Charts minimal in V1.
- **Auth pages (#17–28)** = centered card on `--surface-page` (calm, no floral), logo, single-column, `PrimaryButton`. Includes MFA enrol/challenge, GMC verification step.
- **System/state pages (#60–67)** = centered illustration-light `EmptyState` with clear message + one action.

---

## 7. Clinical adaptations & guardrails (do NOT skip)

### 7.1 Glassmorphism & contrast
The reference floats translucent cards on photo backgrounds. **For LibaMed:** cards sit on a **solid `--surface-page`** (`#F5F8FC`); if any translucency/blur is used, keep it subtle and **verify every text/background pair meets WCAG 2.2 AA (4.5:1 body, 3:1 large)**. No floral or landscape photo backgrounds in the app. Contrast is an acceptance-level requirement, not a nicety.

### 7.2 Patient data restraint
Patients are **not users**. Do **not** build patient-avatar-and-name-everywhere UIs like the reference's client lists. Show patients by **case reference + minimal necessary detail**, respecting RBAC (each role sees only what it needs). Clinician and hospital avatars/names are fine. Nothing sensitive in a service-worker cache (PWA), in URLs, or in analytics.

### 7.3 RTL (Hebrew)
Everything mirrors for `he`: icon rail → right side; 3-panel order reverses; chips, list rows, and directional icons flip. **Use CSS logical properties** (`margin-inline-start`, `inset-inline`, etc.) and `dir="rtl"` on the locale (already wired). Avoid hard-coded left/right. Test the messaging 3-panel and the wizard in RTL specifically.

### 7.4 Tone
Warm but professional. Keep friendly greetings if you like (e.g. "Welcome back, Dr. Chen") but **drop decorative emoji** and the wellness-y copy. This is a medical-legal tool; credibility matters to hospital partners and investors.

### 7.5 Accessibility (WCAG 2.2 AA — mandated)
Large touch targets (≥44px), visible focus rings (use `--accent`), status conveyed by **color + label** (never color alone), full keyboard nav, proper labels/roles. shadcn primitives help; don't regress them.

### 7.6 Don't build (per project scope)
No appointment **calendar grid**, no **voice-message** UI, no **DICOM viewer** (upload/download only), no rich **analytics charts** in V1 (V1.5+). Reuse those components' smaller parts (segmented control, date strip, progress bar) where they fit.

---

## 8. Suggested build order

1. **Tokens** → CSS variables + Tailwind theme (§2). Load font.
2. **Primitives** → install shadcn base; build `Button`, `Chip`, `Avatar`, `IconButton`, `SearchInput`, `Checkbox`, `Toggle`, `Badge/DeltaPill`, `ProgressBar`, `StatusChip`, `Skeleton`, `EmptyState`.
3. **Composites** → `StatCard`, `PersonCard`, `ListRow`, `SegmentedControl`, `DetailPanelRow`, `TopBarCluster`, `MessageBubble`, `Composer`, `Wizard` shell.
4. **App shell** → `(app)` layout: icon rail + bottom tab bar + top cluster, RTL-aware. Wire to `lib/routes.ts`.
5. **Compose screens** in this order: auth pages → referring dashboard → intake wizard → case detail → messaging 3-panel → receiving queue/detail → hospital profile → admin dashboard → system/state pages.
6. Keep everything **structure + design only** until real data/RBAC/API land — the placeholder scaffold stays the source of truth for coverage.

Build the design system as **reusable components**, not per-page styling. Every one of the 67 screens should be assembled from §4's inventory so that when designs are finalized, a token or component tweak updates the whole platform at once.
