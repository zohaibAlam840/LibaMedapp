# LibaMed — Clinician-to-Clinician referral platform

Next.js (App Router) PWA for clinician-gated international medical referrals.
**Read the specs before writing code:**

- [`docs/LIBAMED_C2C_SPEC.md`](docs/LIBAMED_C2C_SPEC.md) — product & compliance spec (source of truth; 67 V1 pages, corridors, RBAC, audit/consent rules)
- [`docs/LIBAMED_DESIGN_SPEC.md`](docs/LIBAMED_DESIGN_SPEC.md) — design system & UI spec (tokens, component inventory, layout patterns, clinical guardrails)

## Develop

```bash
npm run dev
```

Routes live under `app/[locale]/` (`en`/`fr`/`tr`/`he`, Hebrew = RTL). A
locale-less URL redirects to `/en` via `proxy.ts`.

## Key places

| Path | What |
|---|---|
| `lib/routes.ts` | Route manifest for all 67 V1 pages (generated — see below) |
| `scripts/generate-scaffold.mjs` | Authoritative route table; re-emits `lib/routes.ts` + placeholder pages |
| `app/globals.css` | Design tokens (colors/radius/shadows) → Tailwind utilities |
| `components/ui/` | Design-system components (Button, Chip, StatCard, …) |
| `components/PlaceholderPage.tsx` | Self-documenting stub rendered by not-yet-designed pages |
| `lib/demo.ts` | DEMO data only — no real patient data; replace with the region-controlled data layer |
| `public/sw.js` | App-shell-only service worker — **never cache PHI** |

## Status

Structure + design pass complete: all 67 routes exist; key flows (auth,
referring dashboard/wizard/case, messaging, receiving queue/forms, admin
dashboard, hospital profiles, system states) are composed from the design
system with demo data. **No real auth/RBAC, database, uploads, or i18n
dictionaries yet.**

> Hosting note: anything touching PHI must be pinned per-corridor (France =
> HDS-certified EEA). Default Vercel deployment is **not** compliant for PHI —
> see spec §2.1.
