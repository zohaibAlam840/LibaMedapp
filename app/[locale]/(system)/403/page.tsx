import { ShieldOff } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · 403 access denied — least-privilege RBAC means this is a normal screen.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <SystemState
      icon={ShieldOff}
      title="You don't have access to this"
      description="Your role doesn't include this page. If you believe you should have access, ask your LibaMed administrator."
    >
      <Button variant="secondary" size="sm" href={`/${locale}`}>
        Back to home
      </Button>
    </SystemState>
  );
}
