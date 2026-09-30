"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, FileX2, TriangleAlert } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";
import Checkbox from "@/components/ui/Checkbox";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { submitPatientEnquiryAction, type EnquiryState } from "@/lib/patientEnquiryActions";
import {
  AGE_RANGES,
  BUDGET_BANDS,
  ENQUIRY_FOR,
  FUNDING_TYPES,
  SPECIALTY_AREAS,
  TIMEFRAMES,
  type DestinationOption,
} from "@/lib/patientInterest";

/**
 * Patient enquiry form.
 *
 * This is the first place on the platform where a member of the public gives us
 * information about their own health, so two things are said plainly rather
 * than buried: that this is not a medical referral, and what happens to what
 * they write.
 *
 * There is no file input, deliberately — someone who can attach a document will
 * attach their whole medical record to a marketing form.
 */
export default function PatientEnquiryForm({
  destinations,
  presetArea,
}: {
  /**
   * Passed in rather than imported: the list is whatever is published right
   * now, which only the server knows. See lib/db/destinations.ts.
   */
  destinations: DestinationOption[];
  /**
   * Preselects "Area of care" — how the second-opinion page's call to action
   * arrives here. Still a normal select the person can change: arriving from a
   * page about liver cancer is a strong hint, not an answer they gave.
   */
  presetArea?: string;
}) {
  const [state, action] = useActionState<EnquiryState, FormData>(submitPatientEnquiryAction, {});

  /**
   * Put the person on the field that was rejected.
   *
   * The error is rendered above the button, at the bottom of a long form. The
   * postcode box is near the top, so "that postcode doesn't look like a UK
   * one" appeared a screen away from the thing it was talking about. Focusing
   * the field scrolls it into view and tells a screen reader the same thing.
   *
   * Keyed on the whole state object, not on `field`: two rejections of the
   * same field in a row are different events and should both move focus.
   */
  useEffect(() => {
    if (!state.field) return;
    const el = document.querySelector<HTMLElement>(`[name="${state.field}"]`);
    el?.focus({ preventScroll: true });
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  // What was typed, handed back by the action so a rejection does not empty
  // the form.
  const v = state.values ?? {};


  /**
   * Campaign attribution, read at SUBMIT time rather than held in state.
   *
   * Reading it in the server render would make the page uncacheable for the
   * sake of two hidden fields; reading it into state on mount means a render
   * pass and a hydration mismatch between the empty server value and the real
   * client one. Doing it here is neither: the URL is whatever it is at the
   * moment someone presses send.
   */
  function submit(formData: FormData) {
    const q = new URLSearchParams(window.location.search);
    formData.set("campaignId", q.get("campaign_id") ?? q.get("utm_campaign") ?? "");
    formData.set(
      "leadSource",
      q.get("lead_source") ?? q.get("utm_source") ?? document.referrer.slice(0, 120),
    );
    return action(formData);
  }

  if (state.ok) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-inner border border-success-bg bg-success-bg/40 p-5">
        <p className="flex items-center gap-2 text-[15px] font-medium text-ink">
          <CheckCircle2 aria-hidden className="size-5 text-success-text" />
          Thank you &mdash; we have your enquiry.
        </p>
        <p className="text-[13px] leading-relaxed text-ink-secondary">
          Someone from our team will read it and come back to you, usually within two
          working days. If your situation is urgent, please speak to your GP or call 111
          &mdash; this form is not monitored for emergencies.
        </p>
      </div>
    );
  }

  return (
    <form key={state.attempt ?? 0} action={submit} className="flex flex-col gap-5">
      {/*
        Honeypot — a CHECKBOX, not a text field.

        This was a text input named "company_website". Chrome's autofill
        matches that name against its own organization/website heuristics and
        fills it, and Chrome has ignored autocomplete="off" on ordinary fields
        for years. A signed-in Chrome user with autofill on therefore tripped
        the bot check, got the thank-you panel, and had their enquiry silently
        discarded — the single worst failure this form can have, because
        nothing anywhere said it happened.

        Browsers and password managers fill values; they do not TICK things.
        A checkbox is invisible to autofill while still catching the bots that
        submit every field, which is what the honeypot is actually for.

        Off-screen rather than display:none, which some bots skip.
      */}
      <div className="absolute -left-[9999px] size-0 overflow-hidden" aria-hidden>
        <label htmlFor="lm-accept-updates">Do not tick this box</label>
        <input
          id="lm-accept-updates"
          type="checkbox"
          name="acceptUpdates"
          tabIndex={-1}
          autoComplete="off"
          defaultChecked={false}
        />
      </div>

      <p className="flex items-start gap-2 rounded-inner bg-subtle px-3.5 py-3 text-[13px] leading-relaxed text-ink-secondary">
        <FileX2 aria-hidden className="mt-0.5 size-4 shrink-0" />
        <span>
          <b className="font-medium text-ink">This is an enquiry, not a medical referral.</b>{" "}
          Please don&rsquo;t upload or send medical records here. Tell us roughly what
          you&rsquo;re looking for and we&rsquo;ll take it from there.
        </span>
      </p>

      {/* Asked first, and on its own, because the answer changes what the
          consent at the bottom of the form actually means. */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[13px] font-medium uppercase tracking-wide text-ink-muted">
          Who is this enquiry for?
        </legend>
        <div className="flex flex-wrap gap-2">
          {ENQUIRY_FOR.map((o) => (
            <label
              key={o.value}
              className="flex cursor-pointer items-center gap-2 rounded-inner border border-line px-3.5 py-2.5 text-[15px] text-ink has-[:checked]:border-accent has-[:checked]:bg-accent-soft"
            >
              <input
                type="radio"
                name="enquiryFor"
                value={o.value}
                required
                defaultChecked={v.enquiryFor === o.value}
                className="size-4 accent-[var(--accent)]"
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="mb-1 text-[13px] font-medium uppercase tracking-wide text-ink-muted">
          About you
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" htmlFor="p-name">
            <Input id="p-name" name="name" autoComplete="name" required maxLength={120} defaultValue={v.name ?? ""} />
          </Field>
          <Field label="Email" htmlFor="p-email">
            <Input
              id="p-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={200}
              defaultValue={v.email ?? ""}
            />
          </Field>
          <Field label="Phone" htmlFor="p-phone" hint="Optional.">
            <Input id="p-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} defaultValue={v.phone ?? ""} />
          </Field>
          <Field label="Postcode" htmlFor="p-postcode" hint="So we know where you are in the UK.">
            <Input
              id="p-postcode"
              name="postcode"
              autoComplete="postal-code"
              maxLength={12}
              placeholder="SW1A 1AA"
              defaultValue={v.postcode ?? ""}
            />
          </Field>
          <Field
            label="Patient’s age range"
            htmlFor="p-age"
            hint="If you’re asking on behalf of someone else, give their age, not yours."
          >
            <Select id="p-age" name="ageRange" defaultValue={v.ageRange ?? ""}>
              <option value="">Prefer not to say</option>
              {AGE_RANGES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-4">
        <legend className="mb-1 text-[13px] font-medium uppercase tracking-wide text-ink-muted">
          What you&rsquo;re looking for
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Area of care" htmlFor="p-specialty">
            <Select
              id="p-specialty"
              name="specialtyArea"
              defaultValue={
                v.specialtyArea ??
                (presetArea && SPECIALTY_AREAS.includes(presetArea as never) ? presetArea : "")
              }
              required
            >
              <option value="">Select…</option>
              {SPECIALTY_AREAS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Where would you prefer to be treated?" htmlFor="p-dest">
            <Select id="p-dest" name="destinationPreference" defaultValue={v.destinationPreference || "none"}>
              {destinations.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          label="Tell us a little about it"
          htmlFor="p-desc"
          hint="In your own words. No medical records, please — just the outline."
        >
          <Textarea id="p-desc" name="description" rows={5} maxLength={4000} defaultValue={v.description ?? ""} />
        </Field>
      </fieldset>

      <fieldset className="flex flex-col gap-4 border-t border-line pt-4">
        <legend className="mb-1 text-[13px] font-medium uppercase tracking-wide text-ink-muted">
          Practicalities
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="How would it be paid for?" htmlFor="p-funding">
            <Select id="p-funding" name="fundingType" defaultValue={v.fundingType || "unknown"}>
              {FUNDING_TYPES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Rough budget"
            htmlFor="p-budget"
            hint="A range is fine — it helps us point you sensibly."
          >
            <Select id="p-budget" name="budgetBand" defaultValue={v.budgetBand ?? ""} required>
              <option value="">Select…</option>
              {BUDGET_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="When are you hoping to go?" htmlFor="p-time">
            <Select id="p-time" name="timeframe" defaultValue={v.timeframe ?? ""}>
              <option value="">Not sure</option>
              {TIMEFRAMES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </fieldset>

      <div className="border-t border-line pt-4">
        {/* Client's wording, supplied 29 Sep 2026 (change scope, Appendix B),
            used verbatim: it is the lawful basis for holding health
            information about someone who did not fill the form in themselves,
            so it is not ours to paraphrase. */}
        <Checkbox
          name="consentToContact"
          required
          defaultChecked={v.consentToContact === "on"}
          label="I agree that LibaMed may hold what I've written here, including anything about health, and contact me about this enquiry. If I'm writing for someone else, they know and agree, or I'm their parent or legal guardian."
          description="We'll use your details only to reply to you about this. We won't add you to a mailing list or pass them to anyone else."
        />
        <p className="mt-3 text-[12px] leading-relaxed text-ink-muted">
          What you write here is held securely and kept for 24 months, then deleted. It is
          not a medical record, and it is not sent to a hospital unless a clinician later
          makes a referral for you. You can ask us to delete it at any time by emailing{" "}
          <a href="mailto:privacy@libamed.com" className="underline">
            privacy@libamed.com
          </a>
          .
        </p>
      </div>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <div>
        <SubmitButton pendingLabel="Sending…">Send my enquiry</SubmitButton>
      </div>
    </form>
  );
}
