import { Download, HardDriveDownload, ScanLine } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { notFound } from "next/navigation";
import { getCase } from "@/lib/db/referrals";

// 9D · DICOM download view (#44). V1 = secure download only — the embedded
// viewer is deferred to V2 (evaluate OHIF; C2C spec §2.5/§16).
const SERIES = [
  { name: "MRI thorax — T1 axial", images: 224, size: "128 MB" },
  { name: "MRI thorax — T2 axial", images: 224, size: "126 MB" },
  { name: "MRI thorax — contrast", images: 112, size: "58 MB" },
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; caseId: string }>;
}) {
  const { caseId } = await params;
  const c = await getCase(caseId);
  if (!c) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <p className="text-[13px] font-medium text-ink-secondary">Case {c.ref}</p>
        <h1 className="mt-0.5 text-[28px] font-semibold text-ink">Imaging — DICOM</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Download the series into your own PACS/viewer. An embedded viewer is
          planned for a later release.
        </p>
      </div>

      <Card>
        <CardTitle
          action={
            <Button size="sm">
              <HardDriveDownload aria-hidden className="size-4" />
              Download all (312 MB)
            </Button>
          }
        >
          MRI thorax · 13 Jul 2026
        </CardTitle>
        <ul className="flex flex-col gap-2">
          {SERIES.map((s) => (
            <li
              key={s.name}
              className="flex items-center gap-3 rounded-inner border border-line px-3.5 py-3"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <ScanLine aria-hidden className="size-4.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium text-ink">
                  {s.name}
                </span>
                <span className="block text-[13px] text-ink-secondary">
                  {s.images} images · {s.size}
                </span>
              </span>
              <Button variant="ghost" size="sm" aria-label={`Download ${s.name}`}>
                <Download aria-hidden className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink-muted">
          Transfers are encrypted and resume automatically if interrupted. Every
          download is logged to the case audit trail.
        </p>
      </Card>
    </div>
  );
}
