-- 007 · Regulatory filings + receiving-access expiry
--
-- Closes the last two "the screen flags it but nothing records it" gaps.
--
-- 1 · REGULATORY FILINGS. /admin/attention already says "the KVKK must be
--     notified within N business days of the first transfer" for every corridor
--     that transfers under Standard Contractual Clauses. It said it for ever,
--     because nothing recorded whether the notice had been filed — so a done
--     task looked identical to an outstanding one. A filing is per corridor and
--     per authority, not per case: one notification covers the transfer route.
--
-- 2 · ACCESS EXPIRY. A receiving hospital's access to a case is meant to lapse
--     when its purpose is served; the `access-expired` status existed with
--     nothing to set it. The window starts when the hospital ACCEPTS the case
--     (not when it is submitted — a case waiting in a queue is not being
--     worked on) and is per corridor, because the contracts differ.

-- ── 1 · Regulatory filings ─────────────────────────────────────────────────
create table if not exists regulatory_filings (
  id           uuid primary key default gen_random_uuid(),
  corridor_id  text not null references corridors(id) on delete cascade,
  authority    text not null,                 -- 'KVKK', 'CNIL', …
  -- The regulator's own reference. Free text on purpose: every authority
  -- formats these differently and a wrong mask would block a valid entry.
  reference    text,
  filed_at     date not null,
  -- When the filing stops being current. Null = it does not need renewing,
  -- which is the common case for a one-off transfer notification.
  review_by    date,
  note         text,
  filed_by     uuid references profiles(id),
  created_at   timestamptz not null default now()
);

create index if not exists regulatory_filings_corridor_idx
  on regulatory_filings (corridor_id, filed_at desc);

alter table regulatory_filings enable row level security;   -- default-deny

-- ── 2 · Receiving-access expiry ────────────────────────────────────────────
-- 90 days is the platform default, not a legal figure: it is the window the
-- corridor contracts assume unless an admin sets otherwise per corridor.
alter table corridors  add column if not exists access_window_days integer not null default 90;
alter table referrals  add column if not exists access_expires_at date;
alter table referrals  add column if not exists access_extended_at timestamptz;

-- Backfill: any case already ACCEPTED gets a window measured from its last
-- activity. Cases still sitting in a queue get none — their clock has not
-- started, and dating it from submission would expire cases nobody has opened.
update referrals r
set access_expires_at = (r.updated_at + make_interval(days => c.access_window_days))::date
from corridors c
where r.corridor_id = c.id
  and r.access_expires_at is null
  and r.status in ('under-review','plan-received','confirmed','complete','summary-returned');

-- ── Verify ─────────────────────────────────────────────────────────────────
select
  (select count(*) from regulatory_filings)                             as filings,
  (select count(*) from referrals where access_expires_at is not null)  as cases_with_window,
  (select access_window_days from corridors limit 1)                    as default_window_days;
