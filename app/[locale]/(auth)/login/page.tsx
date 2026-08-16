import Link from "next/link";
import { redirect } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionUser, landingPath } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";

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

      {isSupabaseConfigured ? (
        <LoginForm locale={locale} />
      ) : (
        // No auth backend on this deployment. Say so plainly rather than
        // offering a form that can only fail.
        <p className="flex items-start gap-2 rounded-inner bg-danger-bg px-3.5 py-2.5 text-[13px] text-danger-text">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          Sign-in is unavailable on this deployment — the authentication service
          isn&rsquo;t configured. Please contact the administrator.
        </p>
      )}

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
