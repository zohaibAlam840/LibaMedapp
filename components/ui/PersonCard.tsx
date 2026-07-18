import { Star } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";

interface PersonCardProps {
  name: string;
  role: string;
  /** e.g. "4.9" — rendered with the accent star (reference pattern). */
  rating?: string;
  /** Radio-group name → selectable card (native input, no JS). */
  selectName?: string;
  value?: string;
  defaultSelected?: boolean;
  /** Static selected display (when not using selectName). */
  selected?: boolean;
  className?: string;
}

/** Person/provider card: avatar + name + role (+ rating). Selectable variant for wizard steps. */
export default function PersonCard({
  name,
  role,
  rating,
  selectName,
  value,
  defaultSelected,
  selected = false,
  className,
}: PersonCardProps) {
  const body = (
    <>
      <Avatar name={name} size="md" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-ink">
          {name}
        </span>
        <span className="block truncate text-[13px] text-ink-secondary">
          {role}
        </span>
      </span>
      {rating && (
        <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
          <Star aria-hidden className="size-4 fill-accent text-accent" />
          {rating}
        </span>
      )}
    </>
  );

  const base =
    "flex w-full items-center gap-3 rounded-card border bg-card p-3 text-start transition-colors";

  if (selectName) {
    return (
      <label
        className={cn(
          base,
          "cursor-pointer border-line hover:border-line-strong",
          "has-[:checked]:border-accent-border has-[:checked]:bg-accent-soft",
          className,
        )}
      >
        <input
          type="radio"
          name={selectName}
          value={value ?? name}
          defaultChecked={defaultSelected}
          className="sr-only"
        />
        {body}
      </label>
    );
  }

  return (
    <div
      className={cn(
        base,
        selected ? "border-accent-border bg-accent-soft" : "border-line",
        className,
      )}
    >
      {body}
    </div>
  );
}
