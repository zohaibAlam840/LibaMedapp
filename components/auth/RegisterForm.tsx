"use client";

import { useState } from "react";
import Link from "next/link";
import { Briefcase, ShieldCheck, Stethoscope } from "lucide-react";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { Field, Input, Select } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

// 9B · Register — two entry points behind a single screen:
//  · "clinician"  — referring doctor; GMC-verified (path kept EXACTLY as before).
//  · "introducer" — insurance case manager / broker; NO GMC. They originate a
//    case; a UK clinician co-signs before anything proceeds, so the clinical
//    safeguard stays intact — the introducer is a case originator, not a referrer.

type Mode = "clinician" | "introducer";

const TABS: { id: Mode; label: string; icon: typeof Stethoscope }[] = [
  { id: "clinician", label: "Referring clinician", icon: Stethoscope },
  { id: "introducer", label: "Insurance / broker", icon: Briefcase },
];

export default function RegisterForm({ locale }: { locale: string }) {
  const [mode, setMode] = useState<Mode>("clinician");
  const [attested, setAttested] = useState(false);
  const introducer = mode === "introducer";

  return (
    <div className="flex flex-col gap-5">
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
                active
                  ? "bg-card text-ink shadow-card"
                  : "text-ink-secondary hover:text-ink",
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
            ? "For insurance case managers and brokers. No GMC needed — you originate a case, and a UK clinician co-signs before anything proceeds."
            : "For UK & US referring clinicians. You’ll verify your GMC registration before creating a case."}
        </p>
      </div>

      {/* Shared identity fields */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="first-name">
          <Input id="first-name" autoComplete="given-name" />
        </Field>
        <Field label="Last name" htmlFor="last-name">
          <Input id="last-name" autoComplete="family-name" />
        </Field>
      </div>

      <Field
        label="Work email"
        htmlFor="email"
        hint={introducer ? "Use your company email." : "Use your practice or NHS email."}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={introducer ? "name@company.com" : "name@nhs.net"}
        />
      </Field>

      {introducer ? (
        <>
          <Field label="Company or employer name" htmlFor="org">
            <Input id="org" autoComplete="organization" placeholder="e.g. Meridian Health Partners" />
          </Field>

          <Field
            label="FCA authorisation number"
            htmlFor="fca"
            hint="If you’re an FCA-regulated intermediary. Leave blank if registering under an employer."
          >
            <Input id="fca" inputMode="numeric" placeholder="e.g. 123456" />
          </Field>

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
              label="I am not making a clinical referral"
              description="I confirm I am only facilitating case coordination, not providing clinical judgement."
              checked={attested}
              onChange={(e) => setAttested(e.target.checked)}
            />
          </div>
        </>
      ) : (
        <>
          <Field label="Registration body" htmlFor="body">
            <Select id="body" defaultValue="gmc">
              <option value="gmc">GMC (United Kingdom)</option>
              <option value="us" disabled>
                US state medical board — coming soon
              </option>
            </Select>
          </Field>

          <Field label="GMC number" htmlFor="gmc" hint="7 digits — checked against the public GMC register.">
            <Input id="gmc" inputMode="numeric" placeholder="1234567" />
          </Field>
        </>
      )}

      <Field label="Password" htmlFor="password">
        <Input id="password" type="password" autoComplete="new-password" />
      </Field>

      {introducer ? (
        attested ? (
          <Button href={`/${locale}/login`} className="w-full">
            Create introducer account
          </Button>
        ) : (
          <Button disabled className="w-full">
            Create introducer account
          </Button>
        )
      ) : (
        <Button href={`/${locale}/register/gmc-verification`} className="w-full">
          Continue to verification
        </Button>
      )}

      <p className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        Already registered?{" "}
        <Link href={`/${locale}/login`} className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
