import { Laptop, Smartphone } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";

// 9B · Session & device management — view + revoke (§7.4). Design-only.
const SESSIONS = [
  {
    icon: Laptop,
    device: "Windows · Chrome",
    where: "London, UK",
    last: "Active now",
    current: true,
  },
  {
    icon: Smartphone,
    device: "iPhone · LibaMed PWA",
    where: "London, UK",
    last: "2 hours ago",
    current: false,
  },
  {
    icon: Laptop,
    device: "Windows · Edge",
    where: "Manchester, UK",
    last: "3 days ago",
    current: false,
  },
];

export default async function Page() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-[28px] font-semibold text-ink">Sessions &amp; devices</h1>
      <p className="mb-6 text-[15px] text-ink-secondary">
        You can revoke any session. Sessions also time out automatically after
        inactivity.
      </p>

      <Card className="p-2">
        {SESSIONS.map(({ icon: Icon, device, where, last, current }) => (
          <div
            key={device + where}
            className="flex items-center gap-3 rounded-inner px-3 py-3.5"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink-secondary">
              <Icon aria-hidden className="size-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[15px] font-medium text-ink">
                {device}
                {current && (
                  <Chip selected size="sm">
                    This device
                  </Chip>
                )}
              </span>
              <span className="block text-[13px] text-ink-secondary">
                {where} · {last}
              </span>
            </span>
            {!current && (
              <Button variant="danger" size="sm">
                Revoke
              </Button>
            )}
          </div>
        ))}
      </Card>

      <Card className="mt-4 flex items-center justify-between gap-4">
        <div>
          <CardTitle className="mb-1">Sign out everywhere</CardTitle>
          <p className="text-sm text-ink-secondary">
            Ends every session except this one. You&rsquo;ll need to log in and
            pass MFA again on other devices.
          </p>
        </div>
        <Button variant="secondary" size="sm" className="shrink-0">
          Sign out all
        </Button>
      </Card>
    </div>
  );
}
