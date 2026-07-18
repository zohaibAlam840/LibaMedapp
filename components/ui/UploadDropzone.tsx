import { CloudUpload, FileText, ScanLine, X, Check } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import Chip from "@/components/ui/Chip";
import ProgressBar from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";

/**
 * UploadDropzone (design spec V2 §2.16). Design-only: real uploads go direct
 * to region-correct object storage via presigned resumable URLs (C2C §2.5).
 */
export function UploadDropzone({
  accepted = "PDF, DOCX, JPG, DICOM — encrypted in transit and at rest",
  className,
}: {
  accepted?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed border-line-strong bg-subtle/60 p-8 text-center transition-colors",
        "hover:border-accent hover:bg-accent-soft/40",
        className,
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
        <CloudUpload aria-hidden className="size-5" />
      </span>
      <span className="text-[15px] font-semibold text-ink">
        Drag files here or browse
      </span>
      <span className="text-[13px] text-ink-secondary">{accepted}</span>
    </button>
  );
}

export interface UploadFile {
  name: string;
  type: string;
  size: string;
  uploaded?: string;
  /** 0–100 while uploading; omit when complete. */
  progress?: number;
  dicom?: boolean;
}

/** File row: type icon, name, size/meta, progress or ✓, remove. DICOM gets a chip. */
export function UploadFileRow({ file }: { file: UploadFile }) {
  const uploading = file.progress !== undefined;
  return (
    <div className="flex items-center gap-3 rounded-inner border border-line bg-card px-3.5 py-2.5">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
        {file.dicom ? (
          <ScanLine aria-hidden className="size-4" />
        ) : (
          <FileText aria-hidden className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-ink">{file.name}</span>
          {file.dicom && <Chip size="sm">DICOM</Chip>}
        </span>
        {uploading ? (
          <ProgressBar
            value={file.progress ?? 0}
            label={`Uploading ${file.name}`}
            showValue
            className="mt-1.5"
          />
        ) : (
          <span className="block text-xs text-ink-muted">
            {file.type} · {file.size}
            {file.uploaded ? ` · uploaded ${file.uploaded}` : ""}
          </span>
        )}
      </span>
      {!uploading && (
        <Check aria-label="Uploaded" className="size-4 shrink-0 text-success-text" />
      )}
      <IconButton aria-label={`Remove ${file.name}`} size="sm">
        <X aria-hidden className="size-4" />
      </IconButton>
    </div>
  );
}
