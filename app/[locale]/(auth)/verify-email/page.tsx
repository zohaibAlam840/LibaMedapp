import { MailCheck } from "lucide-react";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

// 9B · Email verification.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <EmptyState
      icon={MailCheck}
      title="Check your inbox"
      description="We've sent a verification link to your work email. It expires in 24 hours."
      className="py-4"
    >
      <Button variant="secondary" size="sm">
        Resend email
      </Button>
      <Button size="sm" href={`/${locale}/login`}>
        Back to log in
      </Button>
    </EmptyState>
  );
}
