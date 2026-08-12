import { Card, CardTitle } from "@/components/ui/Card";
import MfaChallenge from "@/components/auth/MfaChallenge";

// 9B · Second-factor prompt at sign-in.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  // Only ever redirect to a path inside this app.
  const target = next && next.startsWith("/") ? next : `/${locale}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <Card className="p-7">
        <CardTitle className="mb-1">Two-step verification</CardTitle>
        <p className="mb-5 text-[15px] text-ink-secondary">
          One more step to protect patient data.
        </p>
        <MfaChallenge locale={locale} next={target} />
      </Card>
    </div>
  );
}
