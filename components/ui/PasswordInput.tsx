"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

// Password field with a show/hide toggle. Its own client component so the rest
// of Field.tsx stays server-renderable.
//
// The toggle is a button, not an input, so it never lands in the submitted form
// data, and `end-`/`pe-` keep it on the correct side under RTL (he).
export default function PasswordInput({
  className,
  ...rest
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [shown, setShown] = useState(false);
  const hintId = useId();

  return (
    <div className="relative">
      <Input
        type={shown ? "text" : "password"}
        className={cn("pe-11", className)}
        aria-describedby={hintId}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        aria-label={shown ? "Hide password" : "Show password"}
        aria-pressed={shown}
        title={shown ? "Hide password" : "Show password"}
        className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-inner text-ink-muted transition-colors hover:text-ink focus:outline-none focus-visible:text-ink"
      >
        {shown ? (
          <EyeOff aria-hidden className="size-[18px]" />
        ) : (
          <Eye aria-hidden className="size-[18px]" />
        )}
      </button>
      <span id={hintId} className="sr-only">
        {shown ? "Password is visible" : "Password is hidden"}
      </span>
    </div>
  );
}
