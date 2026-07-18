import { FolderLock } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · Case access expired — 90-day receiving-clinician inactivity rule (§5/§7.2).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <SystemState
      icon={FolderLock}
      title="Access to this case has expired"
      description="Case access ends after 90 days of inactivity. You can request renewal — the case owner and LibaMed will be notified, and the request is logged."
    >
      <Button variant="secondary" size="sm" href={`/${locale}/receiving`}>
        Back to queue
      </Button>
      <Button size="sm">Request renewal</Button>
    </SystemState>
  );
}
