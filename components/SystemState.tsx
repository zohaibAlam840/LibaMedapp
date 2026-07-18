import type { LucideIcon } from "lucide-react";
import EmptyState from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";

/** Full-page system/state screen (9F): centered card + EmptyState + one action. */
export default function SystemState({
  icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[70dvh] flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <EmptyState icon={icon} title={title} description={description} className="py-2">
          {children}
        </EmptyState>
      </Card>
    </div>
  );
}
