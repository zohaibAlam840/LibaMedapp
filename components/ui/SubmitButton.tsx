"use client";

import { useFormStatus } from "react-dom";
import Button from "@/components/ui/Button";

/**
 * Submit button that reflects its form's pending state — spinner + disabled
 * while the server action runs, so a save never looks like it did nothing.
 *
 * Must be rendered INSIDE the <form> it submits: useFormStatus() reads the
 * nearest form ancestor, and returns pending=false if lifted out of it.
 */
export default function SubmitButton({
  children,
  pendingLabel,
  variant,
  size,
  className,
  disabled,
}: {
  children: React.ReactNode;
  /** Optional label swap while submitting, e.g. "Saving…". */
  pendingLabel?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      loading={pending}
      disabled={pending || disabled}
    >
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  );
}
