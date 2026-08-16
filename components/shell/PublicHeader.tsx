"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Button from "@/components/ui/Button";
import LocaleSwitcher from "@/components/shell/LocaleSwitcher";
import { cn } from "@/lib/cn";

// Marketing-site header.
//
// On the home page it floats inside the dark hero with no background of its
// own, then turns into the normal solid bar once you scroll past the hero's
// top. Every other public page is a light surface, so it stays solid there —
// the route check is the whole reason this is a client component.
//
// It remains `sticky` in both states so it never stops being reachable; the
// hero pulls itself up by the header's height (`-mt-16 pt-16`) to sit
// underneath it.

export interface PublicNavItem {
  href: string;
  label: string;
}

export default function PublicHeader({
  locale,
  nav,
  loginLabel,
  registerLabel,
}: {
  locale: string;
  nav: PublicNavItem[];
  loginLabel: string;
  registerLabel: string;
}) {
  const base = `/${locale}`;
  const pathname = usePathname() ?? "";
  const overHero = pathname === base || pathname === `${base}/`;
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // a reload part-way down the page must not start transparent
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  // Navigating with the sheet open would otherwise leave it covering the new
  // page. Adjusted during render rather than in an effect — React's documented
  // pattern for state that has to follow a changing input, and it covers
  // back/forward too, which a click handler on each link would miss.
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    setMenuPath(pathname);
    setMenuOpen(false);
  }

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    // Stop the page behind the sheet from scrolling under the finger.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // While the sheet is open the bar needs its own background, or the sheet
  // appears to hang off nothing over the hero.
  const clear = overHero && !scrolled && !menuOpen;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b transition-colors duration-200",
        clear ? "border-transparent bg-transparent" : "border-line bg-card",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        {/* Logo and links are one cluster on the left rather than logo-left /
            nav-centred. Centred, the links land on the hero's gutter, where the
            page background shows through and cuts words in half. */}
        <div className="flex items-center gap-6">
          <Link
            href={base}
            className={cn(
              "flex items-center gap-2.5 font-semibold transition-colors",
              clear ? "text-white" : "text-ink",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white">
              LM
            </span>
            LibaMed
          </Link>

          {/* Compact, and shown from 1152px rather than at a stock breakpoint.
              The links must finish before the hero's gutter, but the gutter is a
              percentage of the VIEWPORT while this nav is pinned by the
              max-w-6xl container, so the two converge as the window narrows.
              Measured clearance between the last link and the gutter:
                1024px -51   1152px +29   1280px +46   1440px +66
              1024 is the only width that actually collides, so `lg` (1024) is
              too early and `xl` (1280) hides the nav for no reason. Below 1152
              the sheet takes over. */}
          <nav aria-label="Site" className="hidden items-center gap-0.5 min-[1152px]:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={`${base}${item.href}`}
                className={cn(
                  "rounded-full px-2.5 py-2 text-[13px] whitespace-nowrap transition-colors",
                  clear
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-ink-secondary hover:bg-subtle hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} inverse={clear} />
          {/* Wrapper, not `hidden sm:inline-flex` on the Button: `hidden` would
              collide with the Button's own base `inline-flex`, and which one
              wins depends on stylesheet order — it lost, so the link showed
              (and wrapped) on narrow phones. */}
          <span className="hidden sm:block">
            <Button
              variant={clear ? "inverse" : "ghost"}
              size="sm"
              href={`${base}/login`}
            >
              {loginLabel}
            </Button>
          </span>
          <Button variant={clear ? "accent" : "primary"} size="sm" href={`${base}/register`}>
            {registerLabel}
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="public-menu"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className={cn(
              "flex size-9 items-center justify-center rounded-full transition-colors min-[1152px]:hidden",
              clear
                ? "text-white hover:bg-white/10"
                : "text-ink-secondary hover:bg-subtle hover:text-ink",
            )}
          >
            {menuOpen ? (
              <X aria-hidden className="size-5" />
            ) : (
              <Menu aria-hidden className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet sheet. The inline links are hidden below 1152px (the
          hero's gutter would slice them), so without this there is no way to
          reach the rest of the site on a phone. */}
      {menuOpen && (
        <div id="public-menu" className="fixed inset-x-0 bottom-0 top-16 z-20 min-[1152px]:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-black/40"
          />
          <nav
            aria-label="Site"
            className="relative max-h-full overflow-y-auto border-b border-line bg-card px-4 pb-6 pt-2 shadow-elevated md:px-8"
          >
            <div className="mx-auto flex max-w-6xl flex-col">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={`${base}${item.href}`}
                  className="border-b border-line py-3.5 text-[15px] font-medium text-ink last:border-0"
                >
                  {item.label}
                </Link>
              ))}
              {/* Sign-in lives here too: its header button is hidden below `sm`. */}
              <Button variant="secondary" href={`${base}/login`} className="mt-5">
                {loginLabel}
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
