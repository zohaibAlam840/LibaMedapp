import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionUser, landingPath } from "@/lib/auth";

// 9B · Sign in — real email + password (Supabase Auth). Already-authenticated
// users are sent straight to their landing page.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const user = await getSessionUser();
  if (user) redirect(landingPath(locale, user));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
          Clinician-to-clinician access. Use your work email and password.
        </p>
      </div>

      <LoginForm locale={locale} />

      <div className="border-t border-line pt-4 text-center text-sm text-ink-secondary">
        <p>
          New here?{" "}
          <Link href={`/${locale}/register`} className="font-medium text-accent hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          MFA is added before go-live with real patient data.
        </p>
      </div>
    </div>
  );
}
