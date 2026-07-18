import { WifiOff } from "lucide-react";
import SystemState from "@/components/SystemState";

// 9F · Offline (PWA shell). The service worker also serves a static
// public/offline.html fallback; this is the in-app route version.
// Patient data is never cached offline (§2.3).
export default async function Page() {
  return (
    <SystemState
      icon={WifiOff}
      title="You're offline"
      description="LibaMed needs a connection to load securely. Patient data is never stored on this device — please reconnect and try again."
    />
  );
}
