import { Inbox } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import EnquiryRow from "@/components/admin/EnquiryRow";
import { getContactMessages } from "@/lib/db/contact";

// Enquiries from the public contact form.
//
// The form used to discard what people typed, so there was nothing to show and
// no screen to show it on. Both now exist: the message is stored before any
// email is attempted, which is why an enquiry can appear here even if the
// notification email failed.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getContactMessages();

  const open = messages.filter((m) => m.status === "new" || m.status === "read");
  const closed = messages.filter((m) => m.status === "answered" || m.status === "archived");
  const unread = messages.filter((m) => m.status === "new").length;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-[28px] font-semibold text-ink">Enquiries</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Messages sent through the public contact form. Replying happens in your
          own mail client; what you record here is the trail.
        </p>
      </div>

      <Card>
        <CardTitle>
          Open{open.length > 0 && ` · ${open.length}`}
          {unread > 0 && ` (${unread} new)`}
        </CardTitle>
        {open.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nothing waiting"
            description="Enquiries from the contact form arrive here the moment someone sends one."
          />
        ) : (
          <div className="flex flex-col gap-3">
            {open.map((m) => (
              <EnquiryRow key={m.id} locale={locale} message={m} />
            ))}
          </div>
        )}
      </Card>

      {closed.length > 0 && (
        <Card>
          <CardTitle>Answered &amp; archived · {closed.length}</CardTitle>
          <div className="flex flex-col gap-3">
            {closed.map((m) => (
              <EnquiryRow key={m.id} locale={locale} message={m} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
