import LegalLayout from "@/components/legal/LegalLayout";
import ResponsiveTable from "@/components/ui/ResponsiveTable";
import Button from "@/components/ui/Button";

// 9A · Cookie policy. DRAFT copy — pending legal review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Cookie policy"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "what-we-use",
          heading: "What we use",
          children: (
            <p>
              LibaMed uses only the cookies needed to run a secure clinical
              platform. We do not use advertising or cross-site tracking
              cookies. Patient data is never placed in a cookie.
            </p>
          ),
        },
        {
          id: "categories",
          heading: "Categories",
          children: (
            <ResponsiveTable
              columns={[
                { key: "name", label: "Cookie" },
                { key: "category", label: "Category" },
                { key: "purpose", label: "Purpose" },
                { key: "duration", label: "Duration" },
              ]}
              rows={[
                { id: "session", cells: { name: "libamed_session", category: "Essential", purpose: "Keeps you signed in securely", duration: "Session" } },
                { id: "csrf", cells: { name: "libamed_csrf", category: "Essential", purpose: "Protects forms against forgery", duration: "Session" } },
                { id: "locale", cells: { name: "libamed_locale", category: "Essential", purpose: "Remembers your language", duration: "1 year" } },
                { id: "analytics", cells: { name: "libamed_metrics", category: "Analytics (optional)", purpose: "Anonymous usage counts — no patient data, no third-party sharing", duration: "6 months" } },
              ]}
            />
          ),
        },
        {
          id: "preferences",
          heading: "Managing preferences",
          children: (
            <>
              <p>
                Essential cookies can&rsquo;t be switched off — the platform
                doesn&rsquo;t work without them. Optional analytics can be
                declined in the consent banner or changed here at any time.
              </p>
              <Button variant="secondary" size="sm">
                Manage cookie preferences
              </Button>
            </>
          ),
        },
      ]}
    />
  );
}
