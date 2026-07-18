import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";

// 9C · Case created confirmation (#36) — acceptance §14.2.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <div className="mx-auto max-w-xl">
      <Card className="p-8">
        <EmptyState
          icon={CheckCircle2}
          title="Referral submitted"
          description="Your case has been created and routed to the named specialist. You'll be emailed when it moves."
          className="py-2"
        />
        <div className="mt-2 flex flex-col items-center gap-3">
          <p className="rounded-full bg-subtle px-4 py-2 font-mono text-sm text-ink">
            Case reference: LM-2026-0147
          </p>
          <StatusChip status="submitted" />
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="secondary" href={`/${locale}/referring`}>
            Back to dashboard
          </Button>
          <Button href={`/${locale}/referring/cases/LM-2026-0142`}>
            View case
          </Button>
        </div>
      </Card>
    </div>
  );
}
