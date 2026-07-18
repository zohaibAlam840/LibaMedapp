import { ScrollText } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · Consent expired notice — processing paused until consent is renewed (§7.3).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <SystemState
      icon={ScrollText}
      title="Consent has expired on this case"
      description="Processing is paused until the referring clinician records renewed patient consent. The pause and any renewal are logged immutably."
    >
      <Button variant="secondary" size="sm" href={`/${locale}/referring`}>
        Back to dashboard
      </Button>
    </SystemState>
  );
}
