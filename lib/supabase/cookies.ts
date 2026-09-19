import "server-only";
import { cookies } from "next/headers";

/**
 * Belt and braces: delete any leftover `sb-*` auth cookies directly.
 *
 * If signOut() threw before its own cookie writes, a stale token would survive
 * and the next page would sign the person straight back in — which is exactly
 * the bounce-back bug sign-out had originally.
 *
 * Lives here rather than in a "use server" module so both sign-out actions can
 * share it: every export of a "use server" file becomes a callable endpoint,
 * and this helper has no business being one.
 */
export async function clearSupabaseCookies(): Promise<void> {
  try {
    const store = await cookies();
    for (const { name } of store.getAll()) {
      if (name.startsWith("sb-")) store.delete(name);
    }
  } catch {
    /* read-only cookie store (not a Server Action) — nothing to clear */
  }
}
