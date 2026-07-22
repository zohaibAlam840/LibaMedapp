import NonSubstitutionStep from "@/components/intake/NonSubstitutionStep";

// 9C · Intake step 4 — NHS non-substitution declaration (NHS-safeguard item 1).
// A required, audited gate before the referral can proceed.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <NonSubstitutionStep locale={locale} nextHref="/referring/intake/documents" />
  );
}
