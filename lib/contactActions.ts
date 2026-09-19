"use server";

import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import {
  insertContactMessage,
  isMissingTable,
  updateContactMessage,
  type ContactStatus,
} from "@/lib/db/contact";
import { appendAdminAudit } from "@/lib/db/write";
import { sendEmail } from "@/lib/email";

// Public contact form + the admin inbox that reads it.
//
// The form is unauthenticated, so it is the one write path on the platform a
// stranger can reach. It is therefore deliberately narrow: it inserts into one
// table, stores no files, and its fields are length-capped below.

export type ContactState = { ok?: boolean; error?: string };

/** Where enquiries are sent. Falls back to the from-address, which is always set. */
function inbox(): string {
  return process.env.CONTACT_INBOX || process.env.EMAIL_FROM?.match(/<(.+)>/)?.[1] || "";
}

const LIMITS = { name: 120, email: 200, organisation: 160, subject: 120, body: 5000 };

export async function sendContactMessageAction(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const read = (key: keyof typeof LIMITS) =>
    String(formData.get(key) || "").trim().slice(0, LIMITS[key]);

  const name = read("name");
  const email = read("email");
  const organisation = read("organisation");
  const subject = read("subject");
  const body = read("body");

  // A hidden field no person fills in. Bots do, and the response they get is
  // identical to a success, so nothing is learned from probing it.
  if (String(formData.get("company_website") || "")) return { ok: true };

  if (!name || !email || !body) {
    return { error: "Please give your name, email, and a message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address doesn't look right." };
  }

  try {
    // Stored first. If the email fails afterwards the enquiry still exists and
    // shows up in the admin inbox; if this throws, nothing was promised.
    await insertContactMessage({ name, email, organisation, subject, body });
  } catch (e) {
    if (isMissingTable(e)) {
      console.warn("[action] contact: table missing — apply migration 005");
      return {
        error:
          "We couldn't record your message just now. Please email us directly and we'll pick it up.",
      };
    }
    console.warn("[action] contact insert failed:", (e as Error)?.message);
    return { error: "Something went wrong sending that. Please try again." };
  }

  const to = inbox();
  if (to) {
    await sendEmail({
      to,
      subject: `Enquiry — ${subject || "Contact form"} — ${name}`,
      body: `${name}${organisation ? ` (${organisation})` : ""} sent an enquiry via the website.

Reply to: ${email}

${body}`,
      footnote: "Sent from the LibaMed contact form. The enquiry is also in Admin → Enquiries.",
    });
  }

  revalidatePath("/en/admin/enquiries");
  return { ok: true };
}

/** Admin inbox: mark read/answered/archived, and keep a note of what was done. */
export async function updateContactMessageAction(formData: FormData): Promise<void> {
  const admin = await getSessionUser();
  if (!admin || !admin.canManageUsers) return;

  const id = String(formData.get("messageId") || "");
  const locale = String(formData.get("locale") || "en");
  const status = String(formData.get("status") || "") as ContactStatus;
  const note = formData.get("note");
  if (!id) return;

  try {
    await updateContactMessage(id, {
      ...(status ? { status } : {}),
      ...(note !== null ? { note: String(note) } : {}),
      handledBy: admin.profileId,
    });
    if (status) {
      await appendAdminAudit(admin.name, "Enquiry updated", `${id} · ${status}`);
    }
    revalidatePath(`/${locale}/admin/enquiries`);
  } catch (e) {
    console.warn("[action] updateContactMessage failed:", (e as Error)?.message);
  }
}
