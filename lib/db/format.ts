// Formatting helpers for DB rows → the display strings the UI expects.
// All formatting is done in UTC so it matches the seeded timestamps regardless
// of server timezone.

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "Mon 09:12" from an ISO timestamp (UTC) — for message timestamps. */
export function formatDayTime(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${DAYS[d.getUTCDay()]} ${hh}:${mm}`;
}

/** "2h ago" / "Yesterday" / "3d ago" / "2w ago" from an ISO timestamp. */
export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = diff / 60_000;
  const hours = mins / 60;
  const days = hours / 24;
  if (hours < 1) return `${Math.max(1, Math.floor(mins))}m ago`;
  if (days < 1) return `${Math.floor(hours)}h ago`;
  if (days < 2) return "Yesterday";
  if (days < 7) return `${Math.floor(days)}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

/** "12 Jul 2026 09:04" from an ISO timestamp (UTC). */
export function formatDateTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${hh}:${mm}`;
}

/** "08 Jul 2026" from an ISO date/timestamp (UTC). */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
