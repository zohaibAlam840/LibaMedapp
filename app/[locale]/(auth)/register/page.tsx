import Link from "next/link";
import Button from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

// 9B · Register — referring clinicians; GMC verification gates case creation.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Register</h1>
        <p className="mt-1 text-sm text-ink-secondary">
          For UK &amp; US referring clinicians. You&rsquo;ll verify your GMC
          registration before creating a case.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name" htmlFor="first-name">
          <Input id="first-name" autoComplete="given-name" />
        </Field>
        <Field label="Last name" htmlFor="last-name">
          <Input id="last-name" autoComplete="family-name" />
        </Field>
      </div>

      <Field label="Work email" htmlFor="email" hint="Use your practice or NHS email.">
        <Input id="email" type="email" autoComplete="email" placeholder="name@nhs.net" />
      </Field>

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

      <Field label="Password" htmlFor="password">
        <Input id="password" type="password" autoComplete="new-password" />
      </Field>

      <Button href={`/${locale}/register/gmc-verification`} className="w-full">
        Continue to verification
      </Button>

      <p className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        Already registered?{" "}
        <Link href={`/${locale}/login`} className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
