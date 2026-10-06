"use server";

import { insertInterest, isMissingTable } from "@/lib/db/patientInterest";
import { SECOND_OPINION_AREA, validDestination, validOption } from "@/lib/patientInterest";
import { getDestinationOptions } from "@/lib/db/destinations";
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

export type EnquiryState = {
  ok?: boolean;
  error?: string;
  /**
   * Which field the error is about, so the form can point at it.
   *
   * The postcode box sits near the top and the error appears at the bottom, so
   * "That postcode doesn't look like a UK one" was shown a full screen away
   * from the field it meant — one report was simply "no place to put a
   * postcode".
   */
  field?: string;
  /**
   * Everything that was typed, handed back so the form can re-fill itself.
   *
   * React resets an uncontrolled form once its action resolves, so a rejected
   * submission emptied every box and the whole thing had to be typed again.
   * On a form that asks about somebody's cancer, that is not a small
   * annoyance — it is the point at which people give up.
   */
  values?: Record<string, string>;
  /**
   * How many times this form has been submitted, counted on the server.
   *
   * The form uses it as a React `key` so a rejection rebuilds the inputs.
   * That is not cosmetic: React applies a select's `defaultValue` as a DOM
   * property, so the reset React performs after an action reverts each select
   * to its options' own `selected` attributes — none of which are set — and
   * every dropdown silently emptied while the text fields kept their values.
   * Remounting makes the echoed values the ones the reset lands on.
   *
   * Counted here rather than in a ref because a ref cannot be read during
   * render, and the key has to change in the same render that carries the new
   * values — any later pass has already lost the race with the reset.
   */
  attempt?: number;
};

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
  prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const read = (key: keyof typeof LIMITS) =>
    String(formData.get(key) || "").trim().slice(0, LIMITS[key]);

  // A hidden CHECKBOX no person ticks. Bots tick everything, and what they get
  // back is indistinguishable from success, so probing teaches them nothing.
  //
  // It used to be a hidden text field called "company_website", which Chrome's
  // autofill recognised and filled — so real people using autofill were
  // silently classified as bots and their enquiries dropped. Autofill writes
  // values; it does not tick boxes.
  //
  // Logged, because this branch throws away what someone typed. Discarding a
  // submission with no record anywhere is how the previous version stayed
  // invisible: if genuine enquiries ever start landing here again, the Vercel
  // logs will show it instead of the enquiries simply never arriving.
  if (formData.get("acceptUpdates") != null) {
    console.warn(
      "[action] patient enquiry rejected by honeypot — discarded. campaign=%s source=%s",
      String(formData.get("campaignId") || "-"),
      String(formData.get("leadSource") || "-"),
    );
    return { ok: true };
  }

  const name = read("name");
  const email = read("email");
  const postcode = read("postcode");
  const description = read("description");

  // Every answer given, echoed back on any rejection so nothing is retyped.
  // Built once, before the first check, so no branch can forget it.
  const values: Record<string, string> = {
    name,
    email,
    phone: read("phone"),
    postcode,
    description,
    enquiryFor: String(formData.get("enquiryFor") || ""),
    ageRange: String(formData.get("ageRange") || ""),
    specialtyArea: String(formData.get("specialtyArea") || ""),
    destinationPreference: String(formData.get("destinationPreference") || ""),
    fundingType: String(formData.get("fundingType") || ""),
    budgetBand: String(formData.get("budgetBand") || ""),
    timeframe: String(formData.get("timeframe") || ""),
    consentToContact: formData.get("consentToContact") === "on" ? "on" : "",
  };
  const attempt = (prev?.attempt ?? 0) + 1;
  const reject = (error: string, field?: string): EnquiryState => ({ error, field, values, attempt });

  if (!name) return reject("Please give your name.", "name");
  if (!email) return reject("Please give your email address.", "email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reject("That email address doesn't look right.", "email");
  }
  if (postcode && !UK_POSTCODE.test(postcode)) {
    return reject(
      "That postcode doesn't look like a UK one. You can also leave it blank.",
      "postcode",
    );
  }
  // Who the enquiry is for. Checked here and not only in the browser, because
  // the consent below means something different depending on the answer.
  const enquiryFor = validOption("enquiryFor", String(formData.get("enquiryFor") || ""));
  if (!enquiryFor) {
    return reject("Please tell us whether this enquiry is for you or someone else.", "enquiryFor");
  }
  // Area of care and budget are required as of the 29 Sep change scope. Both
  // are enforced here as well as with `required` on the select: the form posts
  // to a public endpoint, so a browser attribute is a convenience, never the
  // rule. Each list contains a catch-all ("Other specialist care", "Prefer not
  // to say / insurance-funded"), so nobody is forced to state something they
  // do not want to.
  const specialtyArea = validOption("specialtyArea", String(formData.get("specialtyArea") || ""));
  if (!specialtyArea) return reject("Please choose an area of care.", "specialtyArea");
  // Budget is not asked for a second opinion, because the price is fixed and
  // published. Keyed on the AREA rather than on a hidden "came from the
  // second-opinion page" flag: the form drops the question whenever that area
  // is chosen, including by someone who picks it from the dropdown directly,
  // so the rule that decides whether an answer is missing has to be the same
  // one that decided whether to ask. A hidden flag would also be a field a
  // caller could set for themselves to skip a required question.
  const budgetBand = validOption("budgetBand", String(formData.get("budgetBand") || ""));
  if (!budgetBand && specialtyArea !== SECOND_OPINION_AREA) {
    return reject("Please choose a rough budget.", "budgetBand");
  }
  // Consent is the lawful basis for contacting them at all, so it is a hard
  // requirement rather than a preference stored alongside the enquiry.
  if (formData.get("consentToContact") !== "on") {
    return reject("Please tick the box to say we may contact you about this.", "consentToContact");
  }

  try {
    await insertInterest({
      name,
      email,
      phone: read("phone"),
      postcode,
      description,
      enquiryFor,
      ageRange: validOption("ageRange", String(formData.get("ageRange") || "")),
      specialtyArea,
      // Checked against what is published right now, not a static list — the
      // same list the form was rendered from. A destination that has since
      // been unpublished is dropped rather than stored.
      destinationPreference: validDestination(
        String(formData.get("destinationPreference") || ""),
        await getDestinationOptions(),
      ),
      fundingType: validOption("fundingType", String(formData.get("fundingType") || "")),
      budgetBand,
      timeframe: validOption("timeframe", String(formData.get("timeframe") || "")),
      consentToContact: true,
      campaignId: read("campaignId"),
      leadSource: read("leadSource"),
    });
  } catch (e) {
    if (isMissingTable(e)) {
      return reject(
        "We can't record enquiries just yet. Please email hello@libamed.com and we'll pick it up from there.",
      );
    }
    console.warn("[action] patient enquiry failed:", (e as Error)?.message);
    return reject("Something went wrong saving that. Please try again in a moment.");
  }

  // Stored first, announced second: a mail outage costs a notification, never
  // the enquiry. The email carries NO health detail — just that one arrived and
  // where to read it. Whoever runs the inbox is not necessarily clinical.
  const to = staffInbox("enquiry");
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
