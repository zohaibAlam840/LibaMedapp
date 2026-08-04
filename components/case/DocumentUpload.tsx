"use client";

import { useActionState, useEffect, useRef } from "react";
import { CloudUpload } from "lucide-react";
import Button from "@/components/ui/Button";
import { uploadDocumentAction, type ActionState } from "@/lib/referralActions";

/**
 * "Upload more" control on a case. Sends the chosen file to region Storage via
 * uploadDocumentAction (which inserts the document row + audit entry and
 * revalidates). Renders as a compact button that opens the file picker; the
 * upload fires on selection.
 */
export default function DocumentUpload({
  caseRef,
  locale,
  side,
}: {
  caseRef: string;
  locale: string;
  side: "referring" | "receiving";
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(uploadDocumentAction, {});
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.ok && inputRef.current) inputRef.current.value = "";
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="ref" value={caseRef} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="side" value={side} />
      <input type="hidden" name="docType" value="Uploaded document" />
      <input
        ref={inputRef}
        type="file"
        name="file"
        className="sr-only"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        loading={pending}
        onClick={() => inputRef.current?.click()}
      >
        <CloudUpload aria-hidden className="size-4" />
        Upload more
      </Button>
      {state.error && <span className="text-[12px] text-danger-text">{state.error}</span>}
    </form>
  );
}
