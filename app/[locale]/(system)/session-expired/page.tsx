import { TimerOff } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · Session expired — inactivity timeout (§7.4).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <SystemState
      icon={TimerOff}
      title="Your session has expired"
      description="For security, sessions end after a period of inactivity. Log in again to continue — your drafts are saved."
    >
      <Button size="sm" href={`/${locale}/login`}>
        Log in again
      </Button>
    </SystemState>
  );
}
