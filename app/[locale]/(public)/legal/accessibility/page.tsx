import LegalLayout from "@/components/legal/LegalLayout";

// 9A · Accessibility statement. DRAFT copy — pending review.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <LegalLayout
      locale={locale}
      title="Accessibility statement"
      updated="18 Jul 2026"
      version="0.2 (draft)"
      sections={[
        {
          id: "commitment",
          heading: "Our commitment",
          children: (
            <p>
              LibaMed is built to <strong>WCAG 2.2 level AA</strong> as a floor,
              across phone, tablet, and desktop, in all four launch languages —
              including full right-to-left support for Hebrew.
            </p>
          ),
        },
        {
          id: "measures",
          heading: "What that means in practice",
          children: (
            <>
              <p>
                Text contrast of at least 4.5:1 (3:1 for large text), visible
                keyboard focus everywhere, touch targets of at least 44×44px,
                status conveyed by label as well as colour, real form labels,
                and a heading structure screen readers can navigate.
              </p>
              <p>
                Motion is minimal and respects the reduced-motion preference.
                No content flashes, autoplays, or traps focus.
              </p>
            </>
          ),
        },
        {
          id: "known-limitations",
          heading: "Known limitations",
          children: (
            <p>
              DICOM imaging is downloaded for viewing in your own PACS
              software, whose accessibility we don&rsquo;t control. Some legal
              documents are long; each carries an in-page table of contents to
              aid navigation.
            </p>
          ),
        },
        {
          id: "feedback",
          heading: "Feedback and enforcement",
          children: (
            <p>
              If any part of the platform is difficult to use with assistive
              technology, contact us via the contact page — accessibility
              reports are triaged with the same priority as functional defects.
              This statement is reviewed at every major release.
            </p>
          ),
        },
      ]}
    />
  );
}
