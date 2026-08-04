"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Icon-only submit button that swaps to a spinner while its form is pending.
 * Used for compact row actions (approve, feature, remove) where a full button
 * would crowd the table.
 *
 * Must be rendered inside the <form> it submits — useFormStatus() reads the
 * nearest form ancestor.
 */
export default function IconSubmit({
  label,
  danger,
  children,
}: {
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      title={label}
      aria-label={label}
      disabled={pending}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-full transition-colors disabled:opacity-60",
        danger
          ? "text-danger-text hover:bg-danger-bg"
          : "text-ink-secondary hover:bg-subtle hover:text-ink",
      )}
    >
      {pending ? <Loader2 aria-hidden className="size-4 animate-spin" /> : children}
    </button>
  );
}
