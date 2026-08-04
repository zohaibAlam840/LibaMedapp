import { FolderLock, MessageSquare } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import EmptyState from "@/components/ui/EmptyState";
import { getThreads } from "@/lib/db/referrals";

// Referring · Messages (sidebar aggregation) — every case thread in one place.
// Opening one drills into that case's 3-panel messaging workspace. Scoped to
// the signed-in clinician's own cases.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const threads = await getThreads();

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
        {threads.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No conversations yet"
            description="Threads appear here once a case is routed to a specialist."
          />
        ) : (
          <>
            <SearchInput placeholder="Search messages" className="mb-3" />
            <div className="-mx-2 flex flex-col">
              {threads.map((c) => (
                <ListRow
                  key={c.id}
                  href={`/${locale}/referring/cases/${c.id}/messages`}
                  chevron
                  unread={c.unreadCount > 0}
                  leading={
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <FolderLock aria-hidden className="size-4.5" />
                    </span>
                  }
                  title={`${c.ref}${c.specialist ? ` · ${c.specialist}` : ""}`}
                  subtitle={c.preview}
                  meta={c.lastAt}
                  badge={
                    c.unreadCount > 0 ? (
                      <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                        {c.unreadCount}
                      </span>
                    ) : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
