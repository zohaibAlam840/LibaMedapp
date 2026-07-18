import Link from "next/link";
import { Info } from "lucide-react";
import DemoRolePicker from "@/components/auth/DemoRolePicker";

// 9B · Login — presented as a DEMO launcher. There is no real authentication
// yet, so instead of a non-functional credential form we let reviewers open the
// app as any of the five roles (Vol III §0.1: one login for all roles). The
// designed sign-in / GMC / MFA screens still exist at their own routes.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
          Demo mode
        </span>
        <h1 className="text-2xl font-semibold text-ink">Explore LibaMed</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
          This is a working UI preview — no real accounts, passwords, or patient
          data. Choose a role to open the app as that person and see their
          sidebar, dashboard, and what they can access.
        </p>
      </div>

      <DemoRolePicker locale={locale} />

      <p className="flex items-start gap-2 rounded-inner bg-subtle px-3.5 py-2.5 text-[13px] text-ink-secondary">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        Use the <ExternalHint /> icon to open a role in a new tab. Once inside,
        you can switch roles anytime from the avatar menu, top-right.
      </p>

      <div className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        <p>
          In production this is one GMC-verified sign-in with mandatory MFA.
        </p>
        <p className="mt-1.5 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[13px]">
          <span className="text-ink-muted">Preview those screens:</span>
          <Link href={`/${locale}/register`} className="font-medium text-accent hover:underline">
            Register
          </Link>
          <Link href={`/${locale}/register/gmc-verification`} className="font-medium text-accent hover:underline">
            GMC check
          </Link>
          <Link href={`/${locale}/mfa/challenge`} className="font-medium text-accent hover:underline">
            MFA
          </Link>
        </p>
      </div>
    </div>
  );
}

function ExternalHint() {
  return (
    <span className="mx-0.5 inline-flex size-5 items-center justify-center rounded border border-line align-text-bottom text-ink-muted">
      {/* simple external-link glyph to match the row action */}
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3"
      >
        <path d="M15 3h6v6" />
        <path d="M10 14 21 3" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </svg>
    </span>
  );
}
