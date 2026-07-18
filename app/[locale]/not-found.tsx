import { SearchX } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · 404 not found (Next special file — notFound() + unmatched URLs).
export default function NotFound() {
  return (
    <SystemState
      icon={SearchX}
      title="Page not found"
      description="This page doesn't exist or has moved. Check the address, or head back to safety."
    >
      <Button variant="secondary" size="sm" href="/en">
        Back to home
      </Button>
    </SystemState>
  );
}
