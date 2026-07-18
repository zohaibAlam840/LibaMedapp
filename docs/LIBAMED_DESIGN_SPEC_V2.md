# LibaMed — Deep Design Specification (Volume II)

**Companion to `docs/LIBAMED_DESIGN_SPEC.md`.** That file defines tokens and the component inventory. This file goes deeper: a forensic breakdown of the reference designs, exact anatomy for every component, and a **layout spec for each of the 67 V1 pages**.

Build order stays: **tokens → primitives → composites → app shell → pages**. Nothing here overrides `docs/LIBAMED_C2C_SPEC.md` scope rules or the clinical adaptations in DESIGN_SYSTEM §7.

---

## PART 1 — FORENSIC READ OF THE REFERENCES

### 1.1 Reference A — "Make an appointment" + profile card

**Left card — the guided selection flow.** Card is white, radius ~24px, padding ~28px, soft diffuse shadow, sitting on a blurred background. Internal structure, top to bottom:

1. **Card title** — "Make an appointment", ~24px/600, navy, no subtitle. Sits alone with ~20px below.
2. **Section label** — "Choose a category", 13px/500, grey-secondary, ~8px above its content. *Every group in this card uses the same label treatment.* This is the single most repeatable pattern in the whole reference — copy it everywhere.
3. **Chip group** — wrapping row of pills. Unselected: `--surface-subtle` bg, no border, text-primary, ~9px vertical / 16px horizontal padding, radius 999. Selected ("Family therapy"): `--accent-soft` bg, 1px `--accent-border`, `--accent` text. Gap ~8px both axes. Chips wrap to a second line naturally — no scroll.
4. **Selectable person cards** — two side by side, equal width, gap 12px. Each: avatar 40px circle left, then name (15px/600), role (13px, secondary), rating row (small accent star + number). Radius 12px, padding 12px. **Unselected = white with 1px border. Selected = accent-soft fill + accent border.** Note the selected card also has a slightly stronger border — selection is communicated by fill *and* border, never fill alone.
5. **Date strip** — label row with `‹ ›` arrows right-aligned on the same line as the label. Then 7 columns: weekday abbreviation (12px, muted) stacked over date number (15px). Selected date = filled accent square with white text, radius ~10px. Unselected = plain text, no container.
6. **Time-slot chips** — 5-per-row grid, radius 999. Three distinct states visible: **available** (white/subtle bg, dark text), **selected** ("11:00 am" — accent-soft bg, accent border, accent text), **disabled** ("12:00 am", "4:00 pm" — muted grey text, no border, clearly recessive). Build all three.
7. **Divider** — hairline, full card width, ~20px margin above the footer.
8. **Summary + CTA row** — left side shows the accumulated selection in plain text ("August 22, 2024   11:00 am"); right side the primary button. Button: navy fill, white 15px/600 text, radius ~10px, padding ~14px/28px. **The summary-left / CTA-right footer is the pattern for our wizard footer.**

**Right card — the profile.** Centred header: 96px circular avatar with a soft ring, name 22px/600, role + rating on one line beneath. Then a row of **three circular icon buttons** (~44px, white, soft shadow, thin icon) — phone, message, calendar. Then left-aligned sections, each with the same 13px grey label: *Biography* (paragraph, ~1.55 line-height, truncated with an inline accent "See more" link), *Approach* (tag group — same chips, but non-interactive), *Practice Experience* (an inset card: org logo left, org name 15px/600, role + employment type on one line, dates in muted 12px beneath).

**What transfers:** the label→content rhythm, the three chip states, the selectable card pattern, the summary+CTA footer, and the profile scaffold (avatar header → action row → labelled sections → inset credential card).

### 1.2 Reference B — "Schedule"

**Icon rail.** ~72px wide. Brand mark top (~24px, accent). Then a vertical stack of 5 circular buttons, ~44px, gap ~16px. **Active = solid navy filled circle with white icon. Inactive = no fill at all, just a grey stroked icon** (there's a faint white circle on some). Two utility icons (help `?`, flag) pinned to the bottom with a large gap above. No text labels on desktop — tooltips only.

**Page header row.** Page title "Schedule" (28px/600) far left next to the rail, a wide pill **search input** centred (radius 999, magnifier icon left, placeholder muted, subtle fill), and the **top-right cluster**: three items — notification bell (with dot), settings gear, avatar — grouped inside a single white pill container with soft shadow. That grouping into one pill is a signature detail; don't scatter them.

**Left filter column.** A white card containing: title "Doctors" 18px/600, a two-line grey description beneath (this is the "panel title + supporting line" pattern), then a checkable person list — **accent-filled checkbox left**, avatar, name (with "(You)" in muted grey for self), role beneath. A subheading row "Others" with a right-aligned "Clear all" text action. Second card below: "Type of Consultation" with a plain checkbox list, checked items accent-filled, unchecked empty with a hairline border.

**Main panel.** Header row: title "Appointments" + supporting line, and a navy **"+ Add new"** pill button right. Below: date label, then a control row with **segmented control** (Day | Week | Month — active = white pill on subtle track) and a date-picker chip. The calendar grid itself we skip, but note two reusable devices: **hatched/striped blocks** to indicate a different state, and a **coloured dot** on each event block for category.

### 1.3 Reference C — "Messages" (the three-panel workspace)

Four columns: rail | inbox | thread | details. Each panel is its own white rounded card with its own padding — they don't bleed into one another. Gap ~12px.

**Inbox panel.** Header row: "Inbox" 18px/600 + a circular accent **"+"** button right. Below it a **segmented control** with two options (Patients | Doctors). Then rows: 40px avatar, name 15px/600, one-line preview truncated with ellipsis, right-aligned time 12px muted, and — where unread — a small **accent circular count badge** beneath the time. The **selected row** gets an accent-soft fill with a rounded container and a subtle left indicator. Note the first row uses a document icon instead of an avatar (a non-person item) — useful precedent for our system/case rows.

**Thread panel.** Header: correspondent name 18px/600 left; call icon and `⋮` overflow right. Message bubbles: **incoming = white/very light with avatar on the left**; **outgoing = accent-soft, right-aligned, no avatar** (avatar appears on some). Radius ~14px with a subtle tail-side asymmetry. Timestamp 12px muted beneath the bubble, with a **double-tick read receipt** in accent. Attachments render *inside* the bubble: an image with a rounded thumbnail and a caption line; a quoted/reply block shows a compact bordered card with the original sender's name and text above the new content. **Composer**: full-width pill, paperclip left, placeholder text, mic right.

**Details panel.** Header "Details" + an expand icon. Then: correspondent card (avatar, name, "Last activity — 20 minutes ago" muted). A list of **icon + value rows** (phone, date, and a toggle row for Notification with an accent switch). "Attachments" section: a 3-up thumbnail grid where the **last tile is an overlay showing "274+"**. Then a list of **count rows with chevrons** ("243 photos ›", "9 sessions recorded ›"). Finally "Notes" with a `+` action and dated entry cards (date 12px muted, note text beneath, subtle fill, radius 12).

**What transfers wholesale:** panel-as-card composition, the selected-row treatment, bubble asymmetry, the read receipt, the icon+value detail rows, the count-row-with-chevron, and the dated note card.

### 1.4 Reference D — dashboard components close-up

**Stat card.** Padding ~20px. Title 18px/600. Then a row: **big number (32–36px/600)** with a **delta pill** immediately right — green bg + dark green text for positive (`+15%`), light red/blue for negative (`-30%`). Below: a 2-line grey description. Then a **progress bar**: full-width track (light grey, radius 999, ~10px tall) with a gradient fill (light blue → periwinkle) that has a subtle diagonal striping. Note the fill is *rounded on both ends*.

**Checklist card variant.** Same header/number/delta, but instead of a bar, a list of rows each with a **circular accent-tinted check icon** + label.

**Bar chart.** Y-axis labels 0–100 in muted 11px. Bars are **rounded on all corners** (radius ~6px), filled with a vertical blue→periwinkle gradient. Above each solid bar sits a **hatched/striped translucent segment** representing a projected or comparison value — a nice device for "target vs actual". X-axis = date labels 11px muted. No gridlines. Segmented control (Week | Month | Year) top-right of the card.

**Progress list card.** Title, description, then rows: small icon, label 15px, right-aligned percentage + mini progress bar, then metadata columns (duration, category, and small icon+count pairs).

**Coloured-dot list card.** Date heading 18px/600 with a divider, then rows of a **coloured circle/gradient dot** + label + a right-aligned fraction ("2/3"). Simple, and a good model for our corridor or completeness lists.

### 1.5 Cross-cutting observations

- **Everything is a card.** Even sub-sections inside cards are inset cards with their own radius and fill. Nesting depth is usually 2, occasionally 3.
- **Labels are always 13px grey and sit tight above their content.** This creates the calm scanability. Miss this and the design collapses.
- **Selection is always accent-soft fill + accent border + accent text** — three signals, which is also why it passes accessibility.
- **Only one dark element per view** (the primary button, or the active nav circle). Navy is scarce and therefore loud.
- **No dividers between list rows** — separation comes from spacing and hover fill, not lines. The only dividers are between major card sections.
- **Icons are thin-stroke, ~18–20px, always grey unless active.**
- **Right-aligned metadata** (times, counts, percentages) is consistent throughout; it makes rows scannable.

---

## PART 2 — COMPONENT ANATOMY (exact specs)

Build each in `components/ui/` with all listed states. Sizes are baseline desktop; mobile overrides noted in Part 4.

### 2.1 `Chip`
- **Sizes:** sm (h 28, px 12, 12px text), md (h 34, px 16, 14px) default.
- **Variants:** `default` (surface-subtle bg, transparent border, text-primary) · `selected` (accent-soft bg, 1px accent-border, accent text) · `disabled` (transparent bg, muted text, no border, `cursor: not-allowed`) · `outline` (white bg, 1px border) · `status` (see StatusChip).
- **States:** hover (border-strong), focus-visible (2px accent ring, 2px offset), active (scale .98).
- **Behaviour:** wraps; never horizontally scrolls on desktop; on mobile may become a horizontally scrollable row with fade edges.

### 2.2 `SelectableCard`
White, radius 12, padding 12–16, 1px border. Layout: optional leading avatar/icon 40px → stacked title (15/600) + subtitle (13 secondary) + optional meta row → optional trailing radio/check.
- **Selected:** accent-soft bg + accent border + (optional) accent check top-right.
- Full keyboard support: role=`radio`/`checkbox`, arrow-key navigation within the group.

### 2.3 `SectionLabel`
13px/500, `--text-secondary`, margin-bottom 8. Optional right-aligned action (e.g. "Clear all") as a 13px accent text button. **Use for every field group and every panel sub-section.**

### 2.4 `PrimaryButton` / `Button`
- **Variants:** `primary` (navy bg, white text) · `secondary` (white bg, 1px border, text-primary) · `ghost` (transparent, text-secondary, hover subtle fill) · `danger` (danger-text on danger-bg, or solid red for destructive confirms) · `link` (accent, underline on hover).
- **Sizes:** sm (h 36), md (h 44) default, lg (h 52 — used for mobile sticky CTA).
- Radius 10 (pill variant 999). Icon slot leading or trailing, 18px, gap 8.
- **States:** hover (navy-hover), focus-visible (accent ring), disabled (40% opacity), **loading** (spinner replaces leading icon, label stays, width locked to prevent jump).

### 2.5 `StatCard`
Padding 20–24, radius 16, white, shadow-card.
Slots: `title` (18/600) · `value` (34/600) · `delta` (DeltaPill, inline right of value, gap 10) · `description` (14, secondary, max 2 lines) · `progress` (optional bar) · `footer` (optional link row).
Hover: shadow-elevated + `translateY(-2px)`, 160ms ease-out.

### 2.6 `DeltaPill`
Radius 999, px 8, h 22, 12px/600. `positive` (success-bg/success-text) · `negative` (danger-bg/danger-text) · `neutral` (surface-subtle/text-secondary). Always prefix with `+`/`−` so it isn't colour-only.

### 2.7 `ProgressBar`
Track: `--surface-subtle`, h 10, radius 999. Fill: linear-gradient(90deg, accent-grad-from, accent-grad-to), radius 999 both ends, transition width 400ms ease-out. Variants: `solid`, `gradient` (default), `striped` (projected/target — 45° translucent stripes). Optional right-aligned % label. `role="progressbar"` with aria values.

### 2.8 `StatusChip` (case status — critical)
Radius 999, h 26, px 10, 12px/600, **always a 6px leading dot + text label** (never colour alone).

| Status | Dot / text colour | Background |
|---|---|---|
| Submitted | slate `#64748B` | `#F1F5F9` |
| Under review | amber `#B45309` | `#FEF3C7` |
| Treatment plan received | accent `#2563EB` | `#DBEAFE` |
| Confirmed | indigo `#4F46E5` | `#E0E7FF` |
| Treatment complete | green `#15803D` | `#DCFCE7` |
| Summary returned | teal `#0F766E` | `#CCFBF1` |
| Consent withdrawn | red `#B91C1C` | `#FEE2E2` |
| Access expired | grey `#6B7280` | `#F3F4F6` |

### 2.9 `ListRow`
Grid: `[leading 40px] [1fr content] [auto meta]`, padding 12–14, radius 12, gap 12.
Content: title 15/600, subtitle 13 secondary truncated to one line. Meta: right-aligned time/count 12 muted, optional badge beneath, optional chevron.
**States:** hover (surface-subtle fill), selected (accent-soft fill + 3px accent left indicator inside the radius), focus-visible ring, unread (title 600 + accent count badge). No bottom borders between rows.

### 2.10 `MessageBubble`
Max-width 68% of thread column. Padding 12/14. Radius 14, with the corner nearest the sender reduced to 4.
- `incoming`: white bg, 1px border, 32px avatar on the leading side, name shown only in group contexts.
- `outgoing`: accent-soft bg, no border, aligned to the trailing edge.
- Slots: text · attachment card (file icon + name + size + download) · image thumbnail with caption · quoted-reply block (inset card, accent left-bar, original sender + truncated text).
- Footer: 12px muted timestamp, plus a **double-tick** read indicator in accent for outgoing.
- **Adaptation:** no voice-note/waveform UI.

### 2.11 `DetailPanelRow`
`[18px icon] [label 14] [value right-aligned 14/600]`, h 44, hairline divider between rows optional. Variants: `value`, `toggle` (Switch on the trailing edge), `link` (chevron), `count` (value + chevron, e.g. "12 documents ›").

### 2.12 `TopBarCluster`
White pill container, radius 999, padding 6, shadow-card, containing 3 circular 36px buttons: notifications (with 8px accent dot when unread), settings, avatar. Avatar opens a menu (profile, sessions, sign out, **and in demo mode the role switcher**).

### 2.13 `SearchInput`
Pill, h 44, `--surface-subtle` or white with border, leading 18px magnifier, muted placeholder, trailing clear `×` when filled. Focus: white bg + accent ring.

### 2.14 `SegmentedControl`
Track: surface-subtle, radius 999, padding 4. Items: radius 999, px 14, h 32, 13/500. Active: white bg + shadow-card + text-primary. `role="tablist"`, arrow-key nav, animated 180ms indicator slide.

### 2.15 `Wizard` shell
Header: step counter "Step 3 of 6" (13 secondary) + step title (24/600) + one-line helper (14 secondary).
**Stepper:** 6 segments as a thin track — completed = accent fill, current = accent fill + slightly taller, upcoming = surface-subtle. On desktop show numbered dots with labels beneath; on mobile the thin track only.
Body: one question per step, max-width 640, generous spacing.
**Footer (sticky):** left = "Back" ghost button + a muted **"Saved just now"** autosave indicator; right = primary "Continue" (or "Submit referral" on step 6). On mobile the footer is fixed above the tab bar and the CTA is full-width lg.

### 2.16 `UploadDropzone`
Dashed 2px border-strong, radius 16, padding 32, centred: 32px upload icon in an accent-soft circle, 15/600 "Drag files here or browse", 13 secondary listing accepted types + max size. **States:** default · dragover (accent border + accent-soft fill) · uploading (per-file progress rows) · error (danger border + message).
**File row:** file-type icon, name, size, timestamp, progress or ✓, remove `×`. DICOM files get a distinct icon + a "DICOM" chip.

### 2.17 `ConsentChecklist`
Each item = an inset card: leading checkbox, item title 15/600, explanatory body 14 secondary, and a muted 12px "Version 2.1 · shown 18 Jul 2026" line. **Items are individually checkable — never one master checkbox.** Include a distinct "withdraw consent" destructive action on the case view, with a confirmation dialog explaining that processing stops.

### 2.18 `StatusTracker`
Horizontal on desktop, vertical on mobile. Nodes = 28px circles: completed (accent fill + white check), current (accent ring + accent-soft fill + pulse-free), upcoming (surface-subtle + muted number). Connector line 2px, accent up to the current node, border grey after. Each node labelled beneath with the status name and, when known, a 12px muted timestamp.

### 2.19 `DataTable`
Header row: 12px/600 uppercase-off (sentence case) secondary text, surface-subtle bg, sticky on scroll. Rows h 56, hover surface-subtle, hairline dividers, zebra off. Cell types: text, StatusChip, avatar+name, date, right-aligned number, action menu. Toolbar above: SearchInput + filter chips + column/export actions. Pagination or "Load more" beneath. **Mobile: transforms to stacked cards** (title row + 3–4 label/value pairs + chip), never horizontal scroll.

### 2.20 `EmptyState` / `Skeleton` / `ErrorState`
- **Empty:** 48px icon in an accent-soft circle, title 18/600, one-line explanation, one primary action. Copy must be specific: "No cases awaiting your response" + "New referrals appear here as soon as they're routed to you."
- **Skeleton:** must mirror the final layout's shape and count (3 rows if 3 rows), animated shimmer 1.4s, respects reduced-motion.
- **Error:** danger icon, plain-language cause, retry button, and a support reference.

### 2.21 `CorridorBadge`
Pill: 16px country flag or 2-letter code chip + country name + optional muted residency note ("EEA · HDS"). Neutral background — corridors are not statuses.

### 2.22 `AccreditationBadge`
Small outline chip: body name (JCI / ISO 9001 / OECI) + expiry date. Expiring within 90 days → warning colours. Expired → danger.

### 2.23 `NumberedStepStrip`
For the 5-step referral pathway on marketing pages. Desktop: 5 columns, each with a 40px accent-soft numbered circle, title 16/600, 2-line description, joined by a hairline connector that runs behind the circles. Mobile: vertical with a left connector line.

---

## PART 3 — PAGE-BY-PAGE DESIGN SPECS (all 67)

Format: **# · Name — sections/anatomy.** Every app page loads from mock data; every list needs empty + skeleton states.

### A. PUBLIC (1–16)

**1 · Home** — (a) Header: logo left, 5 nav links centre, "Log in" text + navy "Register" pill right; sticky, shrinks with a shadow on scroll. (b) Hero: accent-soft eyebrow pill "Clinician-to-clinician referrals only", H1 capped `clamp(2.25rem,5vw,3.5rem)`, 18px subhead max 60ch, two CTAs (navy primary with arrow + white secondary), subtle blue radial wash behind. **Ensure the top of the value cards is visible at 1080p.** (c) Three value cards (icon-in-circle, title, body) — already correct, add hover lift. (d) `NumberedStepStrip` — the 5-step pathway. (e) Corridor band on surface-page: 4 `CorridorBadge`s + hospital wordmark chips. (f) Pledge teaser: 2-col — heading + intro left, 8 commitments as a compact ticked list right, link to full page. (g) Specialties preview: 8 chips + "View all". (h) Security strip: 3 icon+line items (AES-256, TLS 1.3, HDS-certified EEA hosting). (i) FAQ preview: 4 accordion items. (j) CTA band: navy or accent-gradient full-width, heading + register button. (k) Footer: 4 link columns + legal row + company details.

**2 · How it works** — Hero (compact). Then the 5 steps as **alternating full-width rows** (text one side, illustrative UI card the other), each with number, title, body, and a "what the platform does" note. Then two parallel columns: "For the referring clinician" / "For the receiving specialist", each a checklist. Then a timeline showing the 5-working-day summary commitment. FAQ preview + CTA band.

**3 · The Pledge** — Hero with the promise statement. Then **all 8 commitments** as a 2-col grid of cards: large muted numeral, title, 2–3 sentence explanation, and where relevant a linked proof point (e.g. accreditation → Hospitals page). Then "How we hold ourselves to it": governance summary. CTA band.

**4 · Specialties** — Hero + intro. Filter bar: chip group (all specialties) + corridor filter + a SearchInput. Grid of specialty cards: icon, name, sub-specialty tag list, "Available at: [hospital chips]", case-count-style meta. Clicking filters, not navigates. Empty state for no matches.

**5 · Partner hospitals** — Hero + intro. Filter chips (corridor, specialty). 5 hospital cards: wordmark chip, name, city + country, `CorridorBadge`, `AccreditationBadge`s, 4–6 specialty chips, languages, "View profile" link. Below: a residency explainer strip (which corridor stores data where).

**6 · Hospital profile** — Header block: wordmark, name, city/country, corridor badge, accreditation badges. Quick-facts row (founded, beds, international office, languages). Tabbed or stacked sections: **Overview** (2–3 paragraphs), **Specialties** (tag groups by category), **Named receiving clinicians** (person cards — name, title, specialty, languages; no ratings), **Accreditation & quality** (badge cards with body + expiry), **Data & residency** (corridor rule, hosting note, transfer mechanism), **Practical** (visas, interpreters, travel). Sticky right rail on desktop: "Refer to this hospital" CTA + key facts. Uses the Reference-A profile scaffold.

**7 · For clinicians** — Hero (value prop for doctors). Three-benefit row. **GMC verification explainer**: numbered strip of what happens at sign-up. "What you'll need" checklist card. "How your patient's data is handled" summary with links. FAQ (8 items). CTA band.

**8 · Contact** — Two columns: form card (name, role, organisation, email, subject select, message; note that this is *not* for clinical or patient information) and an info column (registered address in Cardiff, company number, response expectations, plus a routing note that clinical concerns go to clinical governance). No map needed.

**9 · FAQ + glossary** — Sticky category nav (About, Referrals, Data & privacy, Hospitals, Costs, Access). 15+ accordion Q&As. Then the **glossary**: alphabetical definition list of regulatory/medical-tourism terms (HDS, KVKK, SCC, IDTA, DSAR, RTT, corridor, DICOM…), each a term + 1–2 line plain-language definition, with a jump bar A–Z.

**10–16 · Legal pages** (Privacy, Cookies, Terms, Acceptable use, Accessibility, Security, Sub-processors) — Shared **`LegalLayout`**: title, "Last updated" + version, a **"DRAFT — pending legal review"** warning banner, sticky table-of-contents rail on desktop (in-page anchors, active-section highlight), body capped ~70ch with numbered headings, and a footer offering contact for questions. Privacy must have real sections for: what we process, lawful basis, corridors & international transfers, data residency (incl. HDS), retention schedule, your rights & DSAR, security measures, sub-processors, contact/DPO. Cookies gets a category table (essential/analytics) + a "manage preferences" button. Security gets encryption/hosting/access-control/audit sections plus a responsible-disclosure block. Sub-processors gets a table (name, purpose, location, safeguard).

### B. AUTH (17–28)

Shared **`AuthLayout`**: centred card max-width 440, logo above, title 24/600 + one-line helper, form, primary full-width button, secondary link beneath, and a small trust footer (encryption + "clinician access only"). Calm surface-page background with a subtle radial wash — no photography. Right-side value panel on desktop ≥1280 (optional, holds 3 trust points).

**17 · Register** — Fields: full name, professional email, role select, GMC number, password + strength meter, terms checkbox. Inline validation. Helper explaining verification comes next.
**18 · GMC verification** — Explanatory card: what's being checked, a "Verify" action, then three states designed: **pending** (spinner + "Checking the GMC register"), **success** (green tick + returned name/specialty/registration status card + Continue), **failed** (danger state + reasons + manual-review contact). Note the open question — design must tolerate a manual fallback path.
**19 · Login** — Email, password, remember, forgot link, primary CTA, "Register" link. Error state for bad credentials that doesn't reveal which field failed.
**20 · MFA enrolment** — Method choice cards (authenticator app / passkey), QR + manual key, 6-digit code input, backup codes panel with copy/download and a "saved these" confirm.
**21 · MFA challenge** — 6-box segmented code input with auto-advance and paste support, resend timer, "use a backup code" link.
**22 · Forgot password** — Email field, success confirmation that doesn't confirm account existence.
**23 · Reset password** — New password + confirm, strength meter, rules checklist that ticks live, success → login.
**24 · Verify email** — Sent state (with the address, resend timer), success state, expired-link state.
**25 · Account pending** — Status card with a small tracker (submitted → verifying → approved), expected timeframe, contact link, sign-out.
**26 · Profile & settings** — In-app (uses app shell): sections for personal details, professional registration (read-only verified block with badge), language preference, password change, MFA management, danger zone.
**27 · Sessions & devices** — Current session card (highlighted) + table/list of others: device, browser, location, IP, last active, "Revoke" per row + "Revoke all others" with confirm dialog.
**28 · Notification preferences** — Grouped toggle rows by category (case activity, messages, consent, access, security), each with channel toggles (email now; SMS shown as a disabled "coming later" per scope).

### C. REFERRING CLINICIAN (29–41)

**29 · Dashboard** — Greeting header ("Welcome back, Dr —") + TopBarCluster. Bento: 4 StatCards (open cases, awaiting hospital response, action needed, completed this month) — modest, no heavy charts. Primary action card: navy **"Start a new referral"** with arrow. Left filter panel (status / corridor / specialty checkbox groups + "Clear all"). Main: case list as ListRows or DataTable — case ref, patient minimal detail, hospital + corridor badge, StatusChip, last activity, chevron. Right rail: "Needs your attention" list (overdue responses, unread messages, consent expiring). Empty + skeleton states.

**30–35 · Intake wizard (6 steps)** — Shared Wizard shell, stepper, autosave indicator, sticky footer.
- **30 Patient details** — minimal-necessary fields, an explanatory note on why each is needed, DOB, sex, patient reference. A "minimum necessary" info callout.
- **31 Clinical summary** — presenting condition, history textarea with character guidance, urgency chips, current treatment, question for the specialist.
- **32 Corridor + specialty** — specialty chip group → corridor `SelectableCard`s (with residency note per corridor) → named receiving specialist `SelectableCard`s filtered by the above. Show a live "your data will be stored in —" callout that updates with the corridor.
- **33 Documents** — UploadDropzone + file rows + required-document checklist (referral letter, imaging, bloods) that ticks as uploaded. DICOM chip. Note on encryption.
- **34 Consent** — `ConsentChecklist` with itemised, versioned items; the destination country + protection status shown; a "what the patient is agreeing to" plain-language panel; signature/confirmation of having obtained consent.
- **35 Review & submit** — Read-only summary cards for each prior step, each with an "Edit" link jumping back; a final confirmation checkbox; navy "Submit referral" CTA.
**36 · Case created confirmation** — Success state: large check, case reference (with copy button), what happens next (3 steps), expected first-response time, buttons to view the case or start another.
**37 · Case detail** — Header: case ref, StatusChip, corridor badge, hospital + named specialist. `StatusTracker`. Tabs/sections: Overview (clinical summary, key dates), Documents (list with download + audit note), Activity (chronological events), Messages entry point, Consent summary. Right rail: metadata (residency region, consent status/version, access expiry countdown, assigned specialist card).
**38 · Messaging thread** — The 3-panel workspace from Reference C: case list | thread | **case metadata panel** (ref, corridor, residency, consent status, documents with counts+chevrons, audit link). No patient contact block. Mobile drills down.
**39 · Treatment plan received** — Structured document view: plan sections (proposed treatment, rationale, duration), an **itemised cost table** with total and currency + a note that no platform fee is added, availability/timeline, specialist's card, and actions (accept/confirm, ask a question, decline) plus a download.
**40 · Consent view + withdrawal** — Read-only itemised consent records with version and timestamp per item, an audit trail of consent events, and a clearly separated destructive **"Withdraw consent"** panel with a confirmation dialog explaining that processing stops immediately and is logged.
**41 · Clinical summary handback** — The returned structured summary: treatment given, outcome, medications, follow-up plan, red flags, contact for questions; received date + the 5-working-day commitment badge; download PDF and "add to records" actions.

### D. RECEIVING CLINICIAN / HOSPITAL (42–49)

**42 · Incoming queue** — Header noting it's the named specialist's personal queue. Filters (status, urgency, specialty, corridor). DataTable/ListRows: case ref, referring clinician + country, specialty, submitted date, **days-waiting with an SLA warning colour**, StatusChip, action. Sort by urgency/age. Empty + skeleton.
**43 · Case detail (receiving)** — Same shell as #37 but from the receiving side: full clinical summary, document list with prominent download, patient minimal detail, referring clinician card, and prominent primary actions ("Provide treatment plan", "Request more information"). Right rail shows **access-expiry countdown** and an audit notice ("every document access is logged").
**44 · DICOM download** — Study list: modality, body part, study date, series count, image count, file size; per-study download with progress; a checksum/integrity line; an explicit "viewer coming later — download to your PACS/workstation" note; and a logged-access banner.
**45 · Treatment plan response** — Structured form mirroring #39's output: proposed treatment (rich text), rationale, **itemised cost builder** (line items + auto total + currency select), timeline/availability, pre-treatment requirements, validity date. Autosave, "Save draft" + "Send to referring clinician". Live preview panel on desktop.
**46 · Request additional information** — Card listing categories to request (imaging, bloods, history, pathology, other) as checkboxes + a free-text note + urgency; shows what's already been provided so nothing is double-requested; sends and sets status.
**47 · Messaging (receiving)** — Same 3-panel component, receiving-side data.
**48 · Submit clinical summary** — Structured form: treatment delivered, dates, outcome, complications, discharge medications, follow-up plan, red flags, attachments; a completeness meter; preview; submit → returns to the referrer and stamps the 5-working-day clock.
**49 · Coordinator dashboard** — Hospital-wide view: StatCards (incoming, awaiting response, overdue, completed), per-specialist workload list (name, queue count, avg response), unassigned/misrouted cases needing routing, and a corridor/consent compliance summary. No clinical content beyond what the role needs.

### E. ADMIN / GOVERNANCE (50–59)

**50 · Admin dashboard** — Bento: StatCards (active cases, by corridor, awaiting response, overdue vs SLA, consent issues). A corridor breakdown card (4 rows with counts + residency confirmation ticks). "Requires attention" list (consent expiring, access expiring, verification pending, **Turkish 5-day SCC notification due** — even if the full tracker is V1.5, surface the flag). Recent audit activity list.
**51 · Case oversight detail** — Everything about one case for governance: full timeline, both clinicians, corridor + residency confirmation, consent record with versions, complete document access log, message metadata (counts/timestamps, not content by default — least privilege), and admin actions (reassign, extend access, flag).
**52 · Partner hospital list** — DataTable: hospital, corridor, accreditation status chip (valid / expiring / expired), specialties count, named clinicians count, contract/LOI status, active toggle, row actions. "Add hospital" primary button.
**53 · Partner hospital add/edit** — Sectioned form (shared shell for add and edit): identity, location + corridor, accreditation repeater (body, number, issued, expiry), specialties multi-select from the controlled taxonomy, named receiving clinicians repeater, languages, contract/LOI status + dates, data-residency confirmation, active toggle. Sticky save bar with dirty-state warning.
**54 · Named clinician management** — Table of receiving clinicians: name, hospital, specialty, languages, verification status, active. Add/edit drawer. Verification evidence block.
**55 · Corridor configuration** — One card per corridor + "add corridor": residency rule + hosting region, transfer mechanism, consent wording version, retention schedule, language pack, regulatory notification requirements (with the Turkish 5-day rule visible), active toggle. Read-mostly with an edit mode; changes clearly flagged as audited.
**56 · User & role management** — Table: name, email, role chip, organisation, verification, MFA status, last active, status. Invite user, edit roles drawer, deactivate with confirm. A role-permission reference panel showing what each of the 5 roles can see.
**57 · Audit log viewer** — The most data-dense page. Toolbar: date range, actor, action type, case ref, corridor, free-text search, **Export** (CSV/JSON). Table: timestamp (precise), actor + role, action, object (case/document), IP + location, result. Row expands for the full event payload. An "immutable — append only" notice and a verification/hash indicator. Pagination, sticky header, 30+ mock rows.
**58 · Consent records viewer** — Table of consent records: case ref, corridor, version, items granted (count), captured date, status (active/withdrawn/expired), captured-by. Detail drawer shows the **exact wording shown at the time**, per-item grants, and the event history including withdrawal.
**59 · Retention / erasure / DSAR** — Three tabs. *Retention*: schedule table per data category × corridor with next-review dates and items due. *Erasure*: queue of scheduled/pending deletions with confirm-and-log. *DSAR*: request list (received, type, deadline countdown with urgency colour, assignee, status) + a new-request form and an export action.

### F. SYSTEM / STATE (60–67)

Shared `SystemPageLayout`: centred, icon in a soft circle, title 24/600, plain-language explanation, one primary action + one secondary link, no dead ends.
**60 · 404** — "We couldn't find that page" + go to dashboard / home. **61 · 403** — "You don't have access to this" + explains role-based access + contact admin. **62 · 500** — apology, reference code, retry, support. **63 · Maintenance** — scheduled window, expected return, status link (note the outside-clinic-hours policy). **64 · Session expired** — timed out for security, log in again. **65 · Case access expired** — explains the 90-day inactivity rule, who to ask for renewal, request-renewal action. **66 · Offline** — PWA shell state, "you're offline", what's unavailable, retry; explicitly note patient data is never stored on the device. **67 · Consent expired** — explains processing has paused, what's needed to resume, contact the referring clinician.

---

## PART 4 — MOBILE SPECIFICATION (390px baseline)

**Shell.** Bottom tab bar: h 64 + safe-area-inset-bottom, elevated white surface with a top hairline, **max 5 items**, each icon 22px + 10px label, active = accent icon+label, inactive = muted. Desktop icon-rail hidden below `lg`. Top bar: h 56 sticky, compact — back chevron (on detail pages) + title (17/600) + one action.

**Navigation model.** Detail views **push full-screen**, they don't squeeze into panes. Three-panel screens become three separate mobile views: list → thread → details (details reachable via an info button in the thread header). Back always returns one level.

**Layout rules.** Page gutters 16–20px. Cards near full-bleed with 16px radius. Stack all multi-column grids to one column. Tables → stacked cards (title row + 3–4 label/value pairs + StatusChip). Chip groups may scroll horizontally with fade edges. Wizard = one full-screen question, sticky footer CTA at `lg` size, full width.

**Touch & feel.** All targets ≥44×44. No hover-only affordances — every hover action has a tap equivalent. Momentum scrolling, no scroll-jacking. Sheets/drawers slide from the bottom with a drag handle for filters and detail panels.

**PWA.** Manifest with 192/512 icons + maskable, `display: standalone`, `theme-color` matching the shell, apple-touch-icon, splash. Service worker caches the **app shell only** — never PHI. Offline route wired to page 66.

---

## PART 5 — QUALITY BAR

**Per-page checklist** (verify before calling a page done):
□ Uses only design-system components — zero one-off styles
□ Marketing: ≥4 distinct sections with 80–120px rhythm and alternating backgrounds. App: fully populated from mock data
□ Hover, focus-visible, active, disabled, loading (skeleton), empty, and error states all exist where applicable
□ Contrast ≥4.5:1 body / 3:1 large; focus rings visible; status = colour + label + icon
□ Keyboard reachable in a sensible order; dialogs trap focus and restore it
□ Correct at 390px and feels app-like (no horizontal scroll anywhere)
□ Correct in RTL (`he`) — CSS logical properties only, no hard-coded left/right
□ Headings in a proper hierarchy (one h1); images have alt text; forms have real labels
□ No visible TODO/placeholder text; no lorem ipsum
□ Patient data shown as case reference + minimal detail only

**Global don'ts:** no glassmorphism over photography · no floral/landscape backgrounds · no stock photos of patients or doctors · no decorative emoji · no Title Case or ALL CAPS · no colour-only status · no per-page bespoke styling · no out-of-scope builds (calendar grid, DICOM viewer, voice notes, heavy analytics).
