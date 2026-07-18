import type { Metadata, Viewport } from "next";
import { Rubik } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { LOCALES, isLocale, dir } from "@/lib/i18n";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

// Root layout lives under the [locale] segment (Next 16 supports a root layout
// in a dynamic segment; there is no app/layout.tsx). It sets <html lang> and
// dir="rtl" for Hebrew so RTL is structural from the start.

// Rubik: rounded humanist sans with native Hebrew (mandated RTL locale) and
// latin-ext for Turkish — one font covers EN/FR/TR/HE (design spec §2.2).
const rubik = Rubik({
  subsets: ["latin", "latin-ext", "hebrew"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "LibaMed", template: "%s · LibaMed" },
  description:
    "LibaMed — clinician-to-clinician international medical referral platform.",
  applicationName: "LibaMed",
  appleWebApp: { capable: true, title: "LibaMed", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#182238",
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} dir={dir(locale)} className={`${rubik.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
