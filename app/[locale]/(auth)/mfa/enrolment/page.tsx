import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MfaEnrolment from "@/components/auth/MfaEnrolment";
import { getSessionUser } from "@/lib/auth";

// 9B · Two-factor enrolment (TOTP). Real Supabase MFA — the secret is issued
// straight to the browser and never passes through our server.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Enrolment acts on the signed-in account, so there must be one.
  if (!(await getSessionUser())) redirect(`/${locale}/login`);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-10">
      <Link
        href={`/${locale}/account`}
        className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4 rtl:-scale-x-100" />
        Back to settings
      </Link>
      <MfaEnrolment locale={locale} />
    </div>
  );
}
