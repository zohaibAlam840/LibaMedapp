"use client";

import { Download } from "lucide-react";
import Button from "@/components/ui/Button";

/**
 * Triggers the browser's print/save-as-PDF dialog. Real server-side PDF/A
 * generation is a backend concern (NHS-safeguard item 2); this gives the GP an
 * immediate, self-served copy. The app chrome is hidden via `print:hidden`.
 */
export default function PrintButton({ label = "Export PDF" }: { label?: string }) {
  return (
    <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
      <Download aria-hidden className="size-4" />
      {label}
    </Button>
  );
}
