import Link from "next/link";
import { Card } from "@/components/ui/Card";

// Auth layout (design spec §6): centered card on the calm page surface —
// logo, single column, no decoration.

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="flex min-h-dvh flex-1 flex-col items-center justify-center p-4">
      <Link
        href={`/${locale}`}
        className="mb-6 flex items-center gap-2.5 text-xl font-semibold text-ink"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-accent text-base font-semibold text-white">
          L
        </span>
        LibaMed
      </Link>

      <Card className="w-full max-w-md p-6 sm:p-8">{children}</Card>

      <p className="mt-6 max-w-md text-center text-xs text-ink-muted">
        Clinician-to-clinician referrals only. Patient data is encrypted in
        transit and at rest, and every access is logged.
      </p>
    </div>
  );
}
