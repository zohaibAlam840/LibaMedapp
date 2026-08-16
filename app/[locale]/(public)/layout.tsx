import PublicHeader from "@/components/shell/PublicHeader";
import PublicFooter from "@/components/shell/PublicFooter";
import { getDictionary } from "@/lib/dictionaries";

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

  const nav = [
    { href: "/how-it-works", label: t.nav.howItWorks },
    { href: "/specialties", label: t.nav.specialties },
    { href: "/hospitals", label: t.nav.hospitals },
    { href: "/corridors", label: t.nav.corridors },
    { href: "/pledge", label: t.nav.pledge },
    { href: "/for-clinicians", label: t.nav.forClinicians },
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
