"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll(); // a reload part-way down the page must not start transparent
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);

  const clear = overHero && !scrolled;

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

          {/* Compact, fixed-size, and `xl` rather than `lg`. The links have to
              finish before the hero's gutter, but the gutter is a percentage of
              the VIEWPORT while this nav is pinned by the max-w-6xl container —
              so they diverge as the window narrows. Measured: the links end at
              759px regardless of width, and the gutter reaches that point at
              about 1240px. (Below `lg` this nav was already hidden with no
              replacement, so this widens an existing gap rather than making a
              new one.) */}
          <nav aria-label="Site" className="hidden items-center gap-0.5 xl:flex">
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
        </div>
      </div>
    </header>
  );
}
