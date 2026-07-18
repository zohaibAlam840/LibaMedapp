import { cn } from "@/lib/cn";

const CONTROL =
  "w-full rounded-inner border border-line bg-card px-4 text-[15px] text-ink placeholder:text-ink-muted transition-colors focus:border-accent focus:outline-none disabled:bg-subtle disabled:text-ink-muted";

/** Label + control + hint wrapper for form fields. */
export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[13px] font-medium text-ink-secondary">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, "h-11", className)} {...rest} />;
}

export function Textarea({
  className,
  rows = 4,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={rows} className={cn(CONTROL, "py-3", className)} {...rest} />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(CONTROL, "h-11", className)} {...rest}>
      {children}
    </select>
  );
}
