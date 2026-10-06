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
import { sendEmail, siteUrl, staffInbox } from "@/lib/email";

// Public contact form + the admin inbox that reads it.
//
// The form is unauthenticated, so it is the one write path on the platform a
// stranger can reach. It is therefore deliberately narrow: it inserts into one
// table, stores no files, and its fields are length-capped below.

export type ContactState = { ok?: boolean; error?: string };

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

  // A hidden CHECKBOX no person ticks. Bots tick everything, and the response
  // they get is identical to a success, so nothing is learned from probing it.
  // It was a text field named "company_website" until Chrome's autofill was
  // found filling it, which silently discarded messages from real people.
  // Logged for the same reason as the enquiry form: this branch throws away
  // what someone wrote, so it must leave a trace somewhere.
  if (formData.get("acceptUpdates") != null) {
    console.warn("[action] contact message rejected by honeypot — discarded.");
    return { ok: true };
  }

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
          "We couldn't record your message just now. Please email hello@libamed.com and we'll pick it up.",
      };
    }
    console.warn("[action] contact insert failed:", (e as Error)?.message);
    return { error: "Something went wrong sending that. Please try again." };
  }

  // Both sends are best-effort and independent: the message is already stored.
  const to = staffInbox("contact");
  await Promise.all([
    to &&
      sendEmail({
        to,
        // Hitting Reply answers the sender, not the no-reply address we send as.
        replyTo: email,
        subject: `Enquiry — ${subject || "Contact form"} — ${name}`,
        body: `${name}${organisation ? ` (${organisation})` : ""} sent an enquiry via the website.

Reply to: ${email}

${body}`,
        action: { label: "Open in Admin → Enquiries", url: `${siteUrl()}/en/admin/enquiries` },
        footnote: "Sent from the LibaMed contact form. Reply to this email to answer them directly.",
      }),
    // Acknowledgement to the sender. Delivers only once a domain is verified in
    // Resend; on the shared test sender it fails quietly like any other send.
    // It deliberately does NOT echo the message: the address is unverified, so
    // echoing would let anyone mail arbitrary text to anyone from our domain.
    sendEmail({
      to: email,
      replyTo: "hello@libamed.com",
      subject: "We've received your message",
      body: `Hi ${name},

Thanks for getting in touch with LibaMed. We have your message and usually reply within two working days.

If you need us sooner, email hello@libamed.com or call +44 7311 990430.`,
      footnote:
        "You are receiving this because this address was entered on the LibaMed contact form. If that wasn't you, you can ignore this email.",
    }),
  ]);

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
