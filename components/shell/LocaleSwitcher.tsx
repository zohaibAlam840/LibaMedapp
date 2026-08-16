"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, Globe } from "lucide-react";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

// Language switcher — swaps the [locale] segment in the current path (EN / FR /
// TR / HE) and preserves the rest. Hebrew flips the whole shell to RTL via the
// root layout's dir attribute. Copy is English placeholder in every locale for
// now; translation dictionaries are the next step.

export default function LocaleSwitcher({
  current,
  className,
  inverse = false,
}: {
  current: string;
  className?: string;
  /** Trigger styling for dark grounds (the home hero's floating nav). */
  inverse?: boolean;
}) {
  const pathname = usePathname() ?? `/${current}`;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", onClick);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function switchTo(locale: Locale) {
    const parts = pathname.split("/");
    // parts[0] = "" ; parts[1] = current locale segment
    parts[1] = locale;
    const next = parts.join("/") || `/${locale}`;
    setOpen(false);
    router.push(next);
    router.refresh();
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        className={cn(
          "flex h-9 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium transition-colors",
          inverse
            ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
            : "border-line bg-card text-ink-secondary hover:bg-subtle hover:text-ink",
        )}
      >
        <Globe aria-hidden className="size-4" />
        <span className="uppercase">{current}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-50 mt-2 w-44 rounded-card bg-card p-1.5 shadow-elevated ring-1 ring-line"
        >
          {LOCALES.map((loc) => {
            const active = loc === current;
            return (
              <button
                key={loc}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => switchTo(loc)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-inner px-2.5 py-2 text-start text-[14px] transition-colors",
                  active ? "bg-accent-soft text-accent" : "text-ink hover:bg-subtle",
                )}
              >
                <span className="w-6 shrink-0 text-[11px] font-semibold uppercase text-ink-muted">
                  {loc}
                </span>
                <span className="flex-1">{LOCALE_LABELS[loc]}</span>
                {active && <Check aria-hidden className="size-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
