import { FolderLock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { MessageSquare } from "lucide-react";
import { DEMO_CASES } from "@/lib/demo";

// Referring · Messages (sidebar aggregation) — every case thread in one place.
// Opening one drills into that case's 3-panel messaging workspace.
const PREVIEWS: Record<string, string> = {
  "LM-2026-0142": "We will review at our MDT on Thursday and return a plan by Friday.",
  "LM-2026-0139": "Thank you — the cost breakdown is attached to the plan.",
  "LM-2026-0133": "Pre-operative assessment is booked for the 24th.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const withMessages = DEMO_CASES.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Messages</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Secure threads with the receiving specialist on each case. Encrypted
          and written to the audit trail.
        </p>
      </div>

      <Card>
        <CardTitle>Conversations</CardTitle>
        <SearchInput placeholder="Search messages" className="mb-3" />
        {withMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Threads appear here once a case is routed to a specialist."
          />
        ) : (
          <div className="-mx-2 flex flex-col">
            {withMessages.map((c, i) => (
              <ListRow
                key={c.id}
                href={`/${locale}/referring/cases/${c.id}/messages`}
                chevron
                unread={!!c.unread}
                leading={
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FolderLock aria-hidden className="size-4.5" />
                  </span>
                }
                title={`${c.ref} · ${c.specialist}`}
                subtitle={PREVIEWS[c.id] ?? "No messages yet"}
                meta={c.updated}
                badge={
                  c.unread ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                      {c.unread}
                    </span>
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
