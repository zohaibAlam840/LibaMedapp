"use client";

import { TriangleAlert } from "lucide-react";
import SystemState from "@/components/SystemState";
import Button from "@/components/ui/Button";

// 9F · 500 / error (Next special file — client component; `unstable_retry`
// re-renders the segment, Next 16.2+).
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <SystemState
      icon={TriangleAlert}
      title="Something went wrong"
      description={
        error?.digest
          ? `An unexpected error occurred. Reference: ${error.digest}`
          : "An unexpected error occurred. No patient data was affected."
      }
    >
      <Button size="sm" onClick={() => unstable_retry()}>
        Try again
      </Button>
    </SystemState>
  );
}
