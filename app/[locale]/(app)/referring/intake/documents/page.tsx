import DocumentsStep from "@/components/intake/DocumentsStep";

// 9C · Intake step 5 — documents & imaging (acceptance §14.3).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <DocumentsStep locale={locale} />;
}
