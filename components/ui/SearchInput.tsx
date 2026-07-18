import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/** Pill search field with leading icon (list/inbox headers). */
export default function SearchInput({
  className,
  placeholder = "Search",
  "aria-label": ariaLabel,
  ...rest
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-muted"
      />
      <input
        type="search"
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-11 w-full rounded-full border border-transparent bg-subtle ps-10 pe-4 text-[15px] text-ink placeholder:text-ink-muted focus:border-accent focus:bg-card focus:outline-none"
        {...rest}
      />
    </div>
  );
}
