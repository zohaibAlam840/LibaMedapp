import { CloudUpload, FileText, X } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Chip from "@/components/ui/Chip";
import IconButton from "@/components/ui/IconButton";
import { SectionLabel } from "@/components/ui/Card";
import { DEMO_DOCUMENTS } from "@/lib/demo";

// 9C · Intake step 4 — documents & DICOM (acceptance §14.3).
// Real uploads go DIRECT to region-correct object storage via presigned,
// resumable URLs (C2C spec §2.5) — never through an API route body. UI stub.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <WizardShell
      locale={locale}
      step="documents"
      lede="Attach what the specialist needs — referral letter, recent bloods, imaging. Large DICOM series upload in the background and resume if interrupted."
    >
      <div className="flex flex-col gap-5">
        {/* Dropzone stub */}
        <button
          type="button"
          className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-subtle/60 p-6 text-center transition-colors hover:border-accent hover:bg-accent-soft/40"
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <CloudUpload aria-hidden className="size-5" />
          </span>
          <span className="text-[15px] font-medium text-ink">
            Drag files here or browse
          </span>
          <span className="text-[13px] text-ink-secondary">
            PDF, DOCX, JPG, DICOM — encrypted in transit and at rest
          </span>
        </button>

        <div>
          <SectionLabel className="mb-2">Document type for next upload</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {["Referral letter", "Lab results", "Imaging — DICOM", "Histopathology", "Other"].map(
              (t, i) => (
                <Chip key={t} name="doc-type" value={t} defaultSelected={i === 0}>
                  {t}
                </Chip>
              ),
            )}
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2">Attached to this case</SectionLabel>
          <ul className="flex flex-col gap-2">
            {DEMO_DOCUMENTS.map((doc) => (
              <li
                key={doc.name}
                className="flex items-center gap-3 rounded-inner border border-line bg-card px-3.5 py-2.5"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <FileText aria-hidden className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {doc.name}
                  </span>
                  <span className="block text-xs text-ink-muted">
                    {doc.type} · {doc.size}
                  </span>
                </span>
                <IconButton aria-label={`Remove ${doc.name}`} size="sm">
                  <X aria-hidden className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </WizardShell>
  );
}
