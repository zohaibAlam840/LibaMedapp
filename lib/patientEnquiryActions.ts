"use server";

import { insertInterest, isMissingTable } from "@/lib/db/patientInterest";
import { validOption } from "@/lib/patientInterest";
import { sendEmail, siteUrl, staffInbox } from "@/lib/email";

// The public patient enquiry form.
//
// Along with the contact form, this is one of only two write paths on the
// platform a stranger can reach, so it is deliberately narrow: one insert into
// one table, no files, every field length-capped, and every dropdown value
// checked against the list we actually offered rather than trusted.
//
// It captures INTEREST. It does not create a case, it does not notify a
// clinician, and there is no code path from here into `referrals` — a patient
// cannot originate a clinical referral, and this release does not change that.

export type EnquiryState = { ok?: boolean; error?: string };

const LIMITS = {
  name: 120,
  email: 200,
  phone: 40,
  postcode: 12,
  description: 4000,
  campaignId: 120,
  leadSource: 120,
};

// Deliberately permissive: it catches typos without rejecting a valid postcode
// the pattern's author never thought of. The admin reads it either way.
const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

export async function submitPatientEnquiryAction(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const read = (key: keyof typeof LIMITS) =>
    String(formData.get(key) || "").trim().slice(0, LIMITS[key]);

  // A hidden field no person fills in. Bots do, and what they get back is
  // indistinguishable from success, so probing teaches them nothing.
  if (String(formData.get("company_website") || "")) return { ok: true };

  const name = read("name");
  const email = read("email");
  const postcode = read("postcode");
  const description = read("description");

  if (!name || !email) return { error: "Please give your name and email address." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address doesn't look right." };
  }
  if (postcode && !UK_POSTCODE.test(postcode)) {
    return { error: "That postcode doesn't look like a UK one." };
  }
  // Consent is the lawful basis for contacting them at all, so it is a hard
  // requirement rather than a preference stored alongside the enquiry.
  if (formData.get("consentToContact") !== "on") {
    return { error: "Please tick the box to say we may contact you about this." };
  }

  try {
    await insertInterest({
      name,
      email,
      phone: read("phone"),
      postcode,
      description,
      ageRange: validOption("ageRange", String(formData.get("ageRange") || "")),
      specialtyArea: validOption("specialtyArea", String(formData.get("specialtyArea") || "")),
      destinationPreference: validOption(
        "destinationPreference",
        String(formData.get("destinationPreference") || ""),
      ),
      fundingType: validOption("fundingType", String(formData.get("fundingType") || "")),
      budgetBand: validOption("budgetBand", String(formData.get("budgetBand") || "")),
      timeframe: validOption("timeframe", String(formData.get("timeframe") || "")),
      consentToContact: true,
      campaignId: read("campaignId"),
      leadSource: read("leadSource"),
    });
  } catch (e) {
    if (isMissingTable(e)) {
      return {
        error:
          "We can't record enquiries just yet. Please email hello@libamed.com and we'll pick it up from there.",
      };
    }
    console.warn("[action] patient enquiry failed:", (e as Error)?.message);
    return { error: "Something went wrong saving that. Please try again in a moment." };
  }

  // Stored first, announced second: a mail outage costs a notification, never
  // the enquiry. The email carries NO health detail — just that one arrived and
  // where to read it. Whoever runs the inbox is not necessarily clinical.
  const to = staffInbox();
  if (to) {
    await sendEmail({
      to,
      subject: "New patient enquiry",
      body: `Someone has sent an enquiry through the patient page.

Open the admin area to read it. The details are not included in this email.`,
      action: { label: "Open patient enquiries", url: `${siteUrl()}/en/admin/patient-enquiries` },
    });
  }

  return { ok: true };
}
