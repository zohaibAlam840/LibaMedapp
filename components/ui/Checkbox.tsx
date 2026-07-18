import { cn } from "@/lib/cn";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

/** Labelled checkbox row (native input, accent via CSS `accent-color`). */
export default function Checkbox({
  label,
  description,
  className,
  ...rest
}: CheckboxProps) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-start gap-3 py-1.5",
        rest.disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <input type="checkbox" className="mt-0.5 size-5 shrink-0 rounded" {...rest} />
      <span className="flex flex-col gap-0.5">
        <span className="text-[15px] text-ink">{label}</span>
        {description && (
          <span className="text-[13px] text-ink-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}
