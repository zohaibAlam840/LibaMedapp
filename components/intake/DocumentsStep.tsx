"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileText, X } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import IconButton from "@/components/ui/IconButton";
import { SectionLabel } from "@/components/ui/Card";
import { useIntake } from "@/lib/intakeStore";
import { cn } from "@/lib/cn";

const DOC_TYPES = ["Referral letter", "Lab results", "Imaging — DICOM", "Histopathology", "Other"];

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Intake step 5 — documents. Files are selected here and their metadata staged
// in the draft; document rows are written when the referral is created. (Real
// byte transfer goes direct to region-correct storage via presigned URLs — see
// the case-detail "Upload more" action for the storage-backed path.)
export default function DocumentsStep({ locale }: { locale: string }) {
  const { data, set } = useIntake();
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).map((f) => ({
      name: f.name,
      type: docType,
      size: humanSize(f.size),
    }));
    set({ documents: [...data.documents, ...added] });
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(name: string) {
    set({ documents: data.documents.filter((d) => d.name !== name) });
  }

  return (
    <WizardShell
      locale={locale}
      step="documents"
      lede="Attach what the specialist needs — referral letter, recent bloods, imaging. Large DICOM series upload in the background and resume if interrupted."
    >
      <div className="flex flex-col gap-5">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-subtle/60 p-6 text-center transition-colors hover:border-accent hover:bg-accent-soft/40"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CloudUpload aria-hidden className="size-5" />
          </span>
          <span className="text-[15px] font-medium text-ink">Drag files here or browse</span>
          <span className="text-[13px] text-ink-secondary">
            PDF, DOCX, JPG, DICOM — encrypted in transit and at rest
          </span>
        </button>

        <div>
          <SectionLabel className="mb-2">Document type for next upload</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {DOC_TYPES.map((t) => {
              const active = t === docType;
              return (
                <button
                  key={t}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setDocType(t)}
                  className={cn(
                    "inline-flex h-[34px] items-center rounded-full border px-4 text-sm transition-colors",
                    active
                      ? "border-accent-border bg-accent-soft font-medium text-accent"
                      : "border-transparent bg-subtle text-ink hover:border-line-strong",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2">Attached to this case</SectionLabel>
          {data.documents.length === 0 ? (
            <p className="rounded-inner bg-subtle px-3.5 py-3 text-[13px] text-ink-muted">
              No documents attached yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.documents.map((doc) => (
                <li
                  key={doc.name}
                  className="flex items-center gap-3 rounded-inner border border-line bg-card px-3.5 py-2.5"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <FileText aria-hidden className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{doc.name}</span>
                    <span className="block text-xs text-ink-muted">
                      {doc.type} · {doc.size}
                    </span>
                  </span>
                  <IconButton aria-label={`Remove ${doc.name}`} size="sm" onClick={() => remove(doc.name)}>
                    <X aria-hidden className="size-4" />
                  </IconButton>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </WizardShell>
  );
}
