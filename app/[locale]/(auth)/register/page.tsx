import RegisterForm from "@/components/auth/RegisterForm";

// 9B · Register — two entry points: referring clinician (GMC-verified) and
// introducer / insurance case manager (no GMC; routed via a UK clinician
// co-sign). The clinician path is unchanged; the toggle lives in RegisterForm.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RegisterForm locale={locale} />;
}
