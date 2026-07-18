import { FolderLock } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import ListRow from "@/components/ui/ListRow";
import SearchInput from "@/components/ui/SearchInput";
import { DEMO_CASES, DEMO_USER } from "@/lib/demo";

// Receiving · Messages (sidebar aggregation) — threads with referring clinicians
// across this specialist's cases.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const threads = DEMO_CASES.slice(0, 3);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Messages</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Secure threads with the referring clinician on each of your cases.
        </p>
      </div>

      <Card>
        <CardTitle>Conversations</CardTitle>
        <SearchInput placeholder="Search messages" className="mb-3" />
        <div className="-mx-2 flex flex-col">
          {threads.map((c, i) => (
            <ListRow
              key={c.id}
              href={`/${locale}/receiving/cases/${c.id}/messages`}
              chevron
              unread={i === 0}
              leading={
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FolderLock aria-hidden className="size-4.5" />
                </span>
              }
              title={`${c.ref} · ${DEMO_USER.name}`}
              subtitle={i === 0 ? "Could you also share the histopathology report?" : "Thread up to date"}
              meta={c.updated}
              badge={
                i === 0 ? (
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
                    1
                  </span>
                ) : undefined
              }
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
