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
  //
  // The second test is not redundant: "//evil.com" and "/\evil.com" both start
  // with a slash but are protocol-relative URLs, so a lone startsWith("/")
  // check let ?next= send a clinician off-site immediately after they passed
  // their second factor — the most credible possible moment to phish one.
  const isInternal = (p: string) => p.startsWith("/") && !/^[/\\]{2}/.test(p);
  const target = next && isInternal(next) ? next : `/${locale}`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-10">
      <Card className="p-7">
        <CardTitle className="mb-1">Two-step verification</CardTitle>
        <p className="mb-5 text-[15px] text-ink-secondary">
          One more step to protect patient data.
        </p>
        <MfaChallenge next={target} />
      </Card>
    </div>
  );
}
