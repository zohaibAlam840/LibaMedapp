import { LogOut } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { signOutAction } from "@/lib/authActions";

// App header user cluster: name + role + sign-out. Replaces the demo role
// switcher now that auth is real.
export default function UserMenu({
  locale,
  name,
  roleLabel,
}: {
  locale: string;
  name: string;
  roleLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="hidden text-end sm:block">
        <p className="text-[13px] font-medium leading-tight text-ink">{name}</p>
        <p className="text-[11px] leading-tight text-ink-secondary">{roleLabel}</p>
      </div>
      <Avatar name={name} size="sm" />
      <form action={signOutAction}>
        <input type="hidden" name="locale" value={locale} />
        <button
          type="submit"
          title="Sign out"
          aria-label="Sign out"
          className="flex size-9 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-subtle hover:text-ink"
        >
          <LogOut aria-hidden className="size-4 rtl:-scale-x-100" />
        </button>
      </form>
    </div>
  );
}
