import { cn } from "@/lib/cn";

/** Loading placeholder block. */
export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-inner bg-subtle", className)}
    />
  );
}
