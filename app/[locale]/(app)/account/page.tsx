import Link from "next/link";
import { BadgeCheck, ChevronRight, KeyRound, MonitorSmartphone, Bell } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import { Field, Input, Select } from "@/components/ui/Field";
import { getSessionUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/rbac";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n";

// 9B · Profile & settings.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSessionUser();
  const name = user?.name ?? "";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-[28px] font-semibold text-ink">Profile &amp; settings</h1>

      <div className="flex flex-col gap-5">
        <Card className="flex items-center gap-4">
          <Avatar name={name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-ink">{name}</p>
            <p className="text-sm text-ink-secondary">{user ? ROLE_LABEL[user.role] : ""}</p>
          </div>
          {user?.gmcNumber && (
            <Chip selected size="sm">
              <BadgeCheck aria-hidden className="size-3.5" />
              GMC {user.gmcNumber} verified
            </Chip>
          )}
        </Card>

        <Card>
          <CardTitle>Details</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" htmlFor="name">
              <Input id="name" defaultValue={name} />
            </Field>
            <Field label="Work email" htmlFor="email">
              <Input id="email" type="email" defaultValue={user?.email ?? ""} />
            </Field>
            <Field label="Practice / trust" htmlFor="org">
              <Input id="org" defaultValue="" />
            </Field>
            <Field label="Language" htmlFor="lang">
              <Select id="lang" defaultValue={locale}>
                {LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {LOCALE_LABELS[l]}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end">
            <Button size="sm">Save changes</Button>
          </div>
        </Card>

        <Card className="p-2">
          {[
            {
              href: `/${locale}/account/sessions`,
              icon: MonitorSmartphone,
              title: "Sessions & devices",
              sub: "See where you're signed in and revoke access",
            },
            {
              href: `/${locale}/account/notifications`,
              icon: Bell,
              title: "Notification preferences",
              sub: "Email alerts for case activity",
            },
            {
              href: `/${locale}/reset-password`,
              icon: KeyRound,
              title: "Password & MFA",
              sub: "Change password or re-enrol two-factor",
            },
          ].map(({ href, icon: Icon, title, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-inner px-3 py-3 transition-colors hover:bg-subtle"
            >
              <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink-secondary">
                <Icon aria-hidden className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-ink">{title}</span>
                <span className="block text-[13px] text-ink-secondary">{sub}</span>
              </span>
              <ChevronRight aria-hidden className="size-4 text-ink-muted rtl:-scale-x-100" />
            </Link>
          ))}
        </Card>
      </div>
    </div>
  );
}
