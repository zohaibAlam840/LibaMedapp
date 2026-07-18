/** Tiny class-name joiner (clsx-compatible call shape for simple cases). */
export function cn(
  ...parts: Array<string | false | null | undefined>
): string {
  return parts.filter(Boolean).join(" ");
}
