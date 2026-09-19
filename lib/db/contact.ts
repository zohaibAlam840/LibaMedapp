import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { formatDateTime } from "@/lib/db/format";

// Contact enquiries from the public site.
//
// The form used to render a Send button with nothing behind it: a partnership
// enquiry was typed, submitted, and discarded. Enquiries are stored FIRST and
// emailed second, so a mail-provider outage costs a notification, never the
// message itself.

function configured(): boolean {
  const s = process.env.SUPABASE_SECRET_KEY;
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && s && !s.startsWith("REPLACE_WITH"));
}

export type ContactStatus = "new" | "read" | "answered" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  organisation: string;
  subject: string;
  body: string;
  status: ContactStatus;
  note: string;
  receivedAt: string;
  receivedIso: string;
}

interface Row {
  id: string;
  name: string;
  email: string;
  organisation: string | null;
  subject: string | null;
  body: string;
  status: ContactStatus;
  note: string | null;
  created_at: string;
}

function map(r: Row): ContactMessage {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    organisation: r.organisation ?? "",
    subject: r.subject ?? "",
    body: r.body,
    status: r.status,
    note: r.note ?? "",
    receivedAt: formatDateTime(r.created_at),
    receivedIso: r.created_at,
  };
}

/** True when migration 005 has been applied — the form says so if not. */
export function isMissingTable(e: unknown): boolean {
  const msg = (e as { message?: string })?.message ?? "";
  return /could not find the table|relation .* does not exist/i.test(msg);
}

export async function insertContactMessage(m: {
  name: string;
  email: string;
  organisation?: string;
  subject?: string;
  body: string;
}): Promise<boolean> {
  const { error } = await supabaseAdmin().from("contact_messages").insert({
    name: m.name,
    email: m.email,
    organisation: m.organisation || null,
    subject: m.subject || null,
    body: m.body,
  });
  if (error) throw error;
  return true;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  if (!configured()) return [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("contact_messages")
      .select("id, name, email, organisation, subject, body, status, note, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return ((data as unknown as Row[]) ?? []).map(map);
  } catch (e) {
    console.warn("[db] getContactMessages failed:", (e as Error)?.message);
    return [];
  }
}

export async function updateContactMessage(
  id: string,
  patch: { status?: ContactStatus; note?: string; handledBy?: string },
): Promise<boolean> {
  const closing = patch.status === "answered" || patch.status === "archived";
  const { error } = await supabaseAdmin()
    .from("contact_messages")
    .update({
      ...(patch.status ? { status: patch.status } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.handledBy ? { handled_by: patch.handledBy } : {}),
      ...(closing ? { handled_at: new Date().toISOString() } : {}),
    })
    .eq("id", id);
  if (error) throw error;
  return true;
}
