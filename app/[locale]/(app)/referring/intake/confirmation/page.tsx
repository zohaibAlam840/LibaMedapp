import { CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import StatusChip from "@/components/ui/StatusChip";

// 9C · Case created confirmation (#36) — acceptance §14.2. The new case
// reference is passed through as ?ref= by the review-step submit.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { locale } = await params;
  const { ref } = await searchParams;
  const caseRef = ref || "LM-2026-0147";

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
            Case reference: {caseRef}
          </p>
          <StatusChip status="submitted" />
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button variant="secondary" href={`/${locale}/referring`}>
            Back to dashboard
          </Button>
          <Button href={`/${locale}/referring/cases/${caseRef}`}>View case</Button>
        </div>
      </Card>
    </div>
  );
}
