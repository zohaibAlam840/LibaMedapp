"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Briefcase, Check, ShieldCheck, Stethoscope, TriangleAlert } from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { Field, Input, Select } from "@/components/ui/Field";
import { SectionLabel } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { signUpAction, type AuthState } from "@/lib/authActions";

// 9B · Register — two entry points behind one screen:
//  · "clinician"  — referring doctor; GMC-verified (kept EXACTLY as before).
//  · "introducer" — insurance case manager / broker; NO GMC. Verification here
//    routes to review, never a hard reject (they aren't making a clinical
//    referral). Every case they originate is still co-signed by a UK clinician.
//
// Verification LOOKUP + account state machine (verified/pending/declined) are
// backend concerns; this screen collects the fields and reflects the intent.

type Mode = "clinician" | "introducer";
type RegStatus = "" | "fca" | "employer";

const TABS: { id: Mode; label: string; icon: typeof Stethoscope }[] = [
  { id: "clinician", label: "Referring clinician", icon: Stethoscope },
  { id: "introducer", label: "Others", icon: Briefcase },
];

const REG_OPTIONS: { id: Exclude<RegStatus, "">; title: string; desc: string }[] = [
  {
    id: "fca",
    title: "FCA-regulated intermediary",
    desc: "We check your authorisation number against the public FCA register.",
  },
  {
    id: "employer",
    title: "Not FCA-regulated (employer-verified)",
    desc: "Your company name and job title go to manual review.",
  },
];

export default function RegisterForm({ locale }: { locale: string }) {
  const [mode, setMode] = useState<Mode>("clinician");
  const [regStatus, setRegStatus] = useState<RegStatus>("");
  const [fca, setFca] = useState("");
  const [attested, setAttested] = useState(false);
  const introducer = mode === "introducer";

  const fcaValid = /^\d{6}$/.test(fca);
  const fcaError = regStatus === "fca" && fca !== "" && !fcaValid;
  // Submit gate: attestation is mandatory, a regulatory status must be chosen,
  // and if FCA-regulated the number must be a valid 6 digits.
  const introReady = attested && regStatus !== "" && (regStatus === "employer" || fcaValid);
  const [state, action, pending] = useActionState<AuthState, FormData>(signUpAction, {});

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="regStatus" value={regStatus} />
      <input type="hidden" name="attested" value={String(attested)} />

      {/* Entry-point toggle */}
      <div
        role="tablist"
        aria-label="Registration type"
        className="grid grid-cols-2 gap-1 rounded-full bg-subtle p-1"
      >
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(id)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition-colors",
                active ? "bg-card text-ink shadow-card" : "text-ink-secondary hover:text-ink",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-ink">Register</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          {introducer
            ? "For non-clinician introducers — insurance case managers, brokers, and others. No GMC needed; you originate a case, and a UK clinician co-signs before anything proceeds."
            : "For UK & US referring clinicians. You’ll verify your GMC registration before creating a case."}
        </p>
      </div>

      {/* Shared identity fields */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="first-name">
          <Input id="first-name" name="firstName" autoComplete="given-name" required />
        </Field>
        <Field label="Last name" htmlFor="last-name">
          <Input id="last-name" name="lastName" autoComplete="family-name" required />
        </Field>
      </div>

      <Field
        label="Work email"
        htmlFor="email"
        hint={introducer ? "The email you use at work." : "Use your practice or NHS email."}
      >
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={introducer ? "name@company.com" : "name@nhs.net"}
        />
      </Field>

      {introducer ? (
        <>
          <Field label="Company / organisation name" htmlFor="org">
            <Input id="org" name="org" autoComplete="organization" required placeholder="e.g. Meridian Health Partners" />
          </Field>

          <Field label="Job title" htmlFor="job-title" hint="Helps our reviewers where there’s no register to check.">
            <Input id="job-title" name="jobTitle" autoComplete="organization-title" required placeholder="e.g. Senior case manager" />
          </Field>

          {/* Regulatory status — drives which verification path fires */}
          <div className="flex flex-col gap-1.5">
            <SectionLabel>Regulatory status</SectionLabel>
            <div className="grid gap-2">
              {REG_OPTIONS.map((opt) => {
                const active = regStatus === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setRegStatus(opt.id)}
                    className={cn(
                      "flex items-start gap-3 rounded-inner border p-3 text-start transition-colors",
                      active ? "border-accent-border bg-accent-soft" : "border-line bg-card hover:border-line-strong",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-accent bg-accent text-white" : "border-line-strong",
                      )}
                    >
                      {active && <Check aria-hidden className="size-3.5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium text-ink">{opt.title}</span>
                      <span className="block text-[13px] text-ink-secondary">{opt.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {regStatus === "fca" && (
            <Field
              label="FCA authorisation number"
              htmlFor="fca"
              hint={fcaError ? "Must be 6 digits." : "6 digits — checked against the public FCA register."}
            >
              <Input
                id="fca"
                name="fca"
                inputMode="numeric"
                maxLength={6}
                value={fca}
                onChange={(e) => setFca(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="123456"
                className={fcaError ? "border-danger-text" : undefined}
                aria-invalid={fcaError || undefined}
              />
            </Field>
          )}

          <div className="flex items-start gap-2.5 rounded-inner border border-accent-border bg-accent-soft/60 p-3.5 text-[13px] text-ink">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
            <span>
              Cases you originate are routed to a UK clinician for co-sign before
              anything proceeds. You are a <b className="font-medium">case originator</b>,
              not the referring clinician — the clinical decision stays with the doctor.
            </span>
          </div>

          <div className="rounded-inner border border-line px-4">
            <Checkbox
              label="I confirm I am not making a clinical referral, only facilitating case coordination."
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
            />
          </div>
        </>
      ) : (
        <>
          <Field label="Registration body" htmlFor="body">
            <Select id="body" name="body" defaultValue="gmc">
              <option value="gmc">GMC (United Kingdom)</option>
              <option value="us" disabled>
                US state medical board — coming soon
              </option>
            </Select>
          </Field>

          <Field label="GMC number" htmlFor="gmc" hint="7 digits — checked against the public GMC register.">
            <Input id="gmc" name="gmc" inputMode="numeric" placeholder="1234567" />
          </Field>
        </>
      )}

      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
      </Field>

      {state.error && (
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {state.error}
        </p>
      )}

      {introducer ? (
        <Button type="submit" disabled={!introReady} loading={pending} className="w-full">
          Create introducer account
        </Button>
      ) : (
        <Button type="submit" loading={pending} className="w-full">
          Create account
        </Button>
      )}

      <p className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        Already registered?{" "}
        <Link href={`/${locale}/login`} className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
