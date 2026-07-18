import { cn } from "@/lib/cn";

interface SegmentedControlProps {
  /** Radio-group name (unique per control on the page). */
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  className?: string;
}

/**
 * 2–4 option segmented control (Day/Week/Month pattern). Native radios inside
 * labels — active pill styled via has-[:checked], works without client JS.
 */
export default function SegmentedControl({
  name,
  options,
  defaultValue,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-subtle p-1",
        className,
      )}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "flex h-9 cursor-pointer select-none items-center rounded-full px-4 text-sm text-ink-secondary transition-colors",
            "has-[:checked]:bg-card has-[:checked]:font-medium has-[:checked]:text-ink has-[:checked]:shadow-card",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            defaultChecked={
              defaultValue ? option.value === defaultValue : undefined
            }
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
