import { Check, FileText, ScanLine, ShieldCheck } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import StatusChip from "@/components/ui/StatusChip";

// A believable snapshot of the product for the marketing hero — a real
// referral case as it looks inside the app. Built from the design tokens, no
// screenshots. This is what makes the page read as a product, not a template.
export default function HeroPreview() {
  return (
    <div className="relative select-none" aria-hidden>
      {/* Main app window */}
      <div className="overflow-hidden rounded-panel border border-line bg-card shadow-elevated">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white">
              LM
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-semibold text-ink">Case LM-2026-0142</p>
              <p className="text-[11px] text-ink-muted">Patient P-4821 · Oncology</p>
            </div>
          </div>
          <StatusChip status="under-review" />
        </div>

        <div className="flex flex-col gap-3 p-5">
          {/* Mini status tracker */}
          <div className="flex items-center">
            {["Submitted", "Under review", "Plan", "Complete"].map((label, i) => (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <span
                  className={`flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                    i === 0
                      ? "bg-navy text-white"
                      : i === 1
                        ? "bg-accent text-white ring-4 ring-accent-soft"
                        : "bg-subtle text-ink-muted"
                  }`}
                >
                  {i === 0 ? <Check className="size-3" /> : i + 1}
                </span>
                {i < 3 && (
                  <span className={`h-0.5 flex-1 ${i === 0 ? "bg-accent" : "bg-line"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Meta tiles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-inner bg-subtle p-3">
              <p className="text-[11px] text-ink-muted">Corridor</p>
              <p className="text-[13px] font-semibold text-ink">UK → Israel</p>
            </div>
            <div className="rounded-inner bg-subtle p-3">
              <p className="text-[11px] text-ink-muted">Data residency</p>
              <p className="text-[13px] font-semibold text-ink">UK · London</p>
            </div>
          </div>

          {/* Specialist */}
          <div className="flex items-center gap-3 rounded-inner border border-line p-2.5">
            <Avatar name="Dr. Noa Peretz" size="sm" dot />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-ink">Dr. Noa Peretz</p>
              <p className="truncate text-[11px] text-ink-secondary">
                Consultant oncologist · Sheba
              </p>
            </div>
          </div>

          {/* Documents */}
          {[
            { icon: FileText, name: "Referral letter.pdf", size: "240 KB" },
            { icon: ScanLine, name: "MRI thorax (DICOM)", size: "312 MB" },
          ].map(({ icon: Icon, name, size }) => (
            <div key={name} className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon className="size-4" />
              </span>
              <span className="flex-1 text-[13px] text-ink">{name}</span>
              <span className="text-[11px] text-ink-muted">{size}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating consent chip */}
      <div className="absolute -bottom-5 -start-5 flex items-center gap-2 rounded-card border border-line bg-card px-3.5 py-2.5 shadow-elevated">
        <span className="flex size-8 items-center justify-center rounded-full bg-success-bg text-success-text">
          <ShieldCheck className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[12px] font-semibold text-ink">Consent captured</p>
          <p className="text-[11px] text-ink-muted">Itemised · v2 · logged</p>
        </div>
      </div>

      {/* Floating summary chip */}
      <div className="absolute -end-4 -top-4 rounded-full border border-line bg-card px-3.5 py-2 text-[12px] font-medium text-ink shadow-elevated">
        <span className="me-1.5 inline-block size-1.5 rounded-full bg-success-text align-middle" />
        Summary in 5 working days
      </div>
    </div>
  );
}
