import PublicHeader from "@/components/shell/PublicHeader";
import PublicFooter from "@/components/shell/PublicFooter";
import { getDictionary } from "@/lib/dictionaries";
import { getPublishedCorridors } from "@/lib/db/corridors";

// Public site layout: clean header + footer on the calm surface.
// Nav + footer labels come from the locale dictionary.

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = getDictionary(locale);

  // With every corridor withdrawn, /corridors is an empty page — so the link
  // to it comes out of the nav rather than sending visitors to nothing. It
  // returns by itself the moment a corridor is published again, which a
  // deleted nav entry would not. The cost is one read of a four-row table on
  // each public page; being wrong in the navigation costs more.
  const corridorsPublished = (await getPublishedCorridors()).length > 0;

  const nav = [
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/specialties", label: t.nav.specialties },
    { href: "/hospitals", label: t.nav.hospitals },
    ...(corridorsPublished ? [{ href: "/corridors", label: t.nav.corridors }] : []),
    { href: "/pledge", label: t.nav.pledge },
    { href: "/for-clinicians", label: t.nav.forClinicians },
    { href: "/contact", label: t.footer.contact },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader
        locale={locale}
        nav={nav}
        loginLabel={t.nav.login}
        registerLabel={t.nav.register}
      />

      <main className="flex-1">{children}</main>

      <PublicFooter locale={locale} />
    </div>
  );
}
