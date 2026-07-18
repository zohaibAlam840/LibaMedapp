import { Globe2 } from "lucide-react";
import WizardShell from "@/components/wizard/WizardShell";
import Chip from "@/components/ui/Chip";
import PersonCard from "@/components/ui/PersonCard";
import { SectionLabel } from "@/components/ui/Card";
import { DEMO_HOSPITALS } from "@/lib/demo";

// 9C · Intake step 3 — corridor + specialty (acceptance §14.2/§14.4).
// Choosing the corridor sets the case's data-residency region automatically
// (C2C spec §2.1/§7.1) — surfaced to the clinician in plain language.
export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <WizardShell
      locale={locale}
      step="corridor"
      lede="Pick the specialty, then a destination. Records are routed to a named specialist — never a general inbox."
      summary={
        <>
          <span className="text-[13px] text-ink-secondary">So far:</span>
          <Chip selected size="sm">Oncology</Chip>
          <Chip selected size="sm">UK → Israel</Chip>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <SectionLabel className="mb-2">Specialty</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {["Oncology", "Orthopedics", "Fertility", "Cardiology", "Neurosurgery", "Transplantation", "Reconstructive"].map(
              (s, i) => (
                <Chip key={s} name="specialty" value={s} defaultSelected={i === 0}>
                  {s}
                </Chip>
              ),
            )}
          </div>
        </div>

        <div>
          <SectionLabel className="mb-2">Destination hospital</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {DEMO_HOSPITALS.map((h, i) => (
              <PersonCard
                key={h.id}
                selectName="hospital"
                value={h.id}
                defaultSelected={i === 0}
                name={h.name}
                role={`${h.city}, ${h.country} · ${h.corridorLabel}`}
              />
            ))}
          </div>
        </div>

        <p className="flex items-start gap-2.5 rounded-inner bg-accent-soft p-3.5 text-[13px] text-ink">
          <Globe2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
          The destination decides where this patient&rsquo;s records are stored.
          For France, records are held on HDS-certified EEA infrastructure; the
          right rule is applied automatically.
        </p>
      </div>
    </WizardShell>
  );
}
