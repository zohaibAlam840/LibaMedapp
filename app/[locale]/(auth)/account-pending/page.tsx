import { Hourglass } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// 9B · Account pending / under review (e.g. manual GMC verification).
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <EmptyState
      icon={Hourglass}
      title="Your account is under review"
      description="Your GMC verification needs a manual check. We'll email you within one working day — no action is needed from you."
      className="py-4"
    >
      <Button variant="secondary" size="sm" href={`/${locale}`}>
        Back to home
      </Button>
    </EmptyState>
  );
}
