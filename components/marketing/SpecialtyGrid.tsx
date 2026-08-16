import { Activity, Microscope, Sparkles, Stethoscope } from "lucide-react";
import { cn } from "@/lib/cn";

// The four specialty categories, shared by the home page's band and the
// Specialties page so the two can't drift. Deliberately generic: the exhaustive
// list changes per partner hospital, so we describe the breadth rather than
// enumerate it — the per-corridor pages carry the real, checkable lists.
//
// `tone="dark"` is for the navy band; everything the tone changes is colour, so
// the two renderings stay structurally identical.

const ICONS = [Activity, Stethoscope, Microscope, Sparkles];

export default function SpecialtyGrid({
  items,
  tone = "light",
  className,
}: {
  items: { title: string; text: string }[];
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((cat, i) => {
        const Icon = ICONS[i] ?? Stethoscope;
        return (
          <div
            key={cat.title}
            className={cn(
              "flex flex-col gap-3 rounded-card border p-5 transition-all duration-150 ease-out hover:-translate-y-1",
              dark
                ? "border-white/10 bg-white/[0.06] hover:border-white/25 hover:bg-white/[0.1]"
                : "border-line bg-card hover:border-accent-border hover:shadow-elevated",
            )}
          >
            <span
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl",
                dark ? "bg-white/10 text-white" : "bg-accent-soft text-accent",
              )}
            >
              <Icon aria-hidden className="size-5" />
            </span>
            <h3 className={cn("text-[15px] font-semibold", dark ? "text-white" : "text-ink")}>
              {cat.title}
            </h3>
            <p
              className={cn(
                "text-[13px] leading-relaxed",
                dark ? "text-white/65" : "text-ink-secondary",
              )}
            >
              {cat.text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
