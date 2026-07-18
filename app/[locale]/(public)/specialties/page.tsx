import { Activity, Baby, Bone, Brain, HeartPulse, Scissors, Slice, Stethoscope } from "lucide-react";
import { Card, SectionLabel } from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import SearchInput from "@/components/ui/SearchInput";
import { DEMO_HOSPITALS } from "@/lib/demo";

// 9A · Specialties directory (spec V2 page 4): hero → filter bar → card grid.
// Filtering is design-only for now (no client JS yet).
const SPECIALTIES = [
  { icon: Activity, name: "Oncology", subs: ["CAR-T", "CyberKnife", "BMT", "Precision oncology"], at: ["sheba", "anadolu", "foch", "hirslanden"] },
  { icon: Bone, name: "Orthopedics", subs: ["Joint replacement", "Spine", "Sports", "Trauma"], at: ["sheba", "anadolu", "hirslanden"] },
  { icon: Baby, name: "Fertility", subs: ["IVF", "ICSI", "Egg freezing", "PGT"], at: ["sheba", "foch", "hirslanden"] },
  { icon: HeartPulse, name: "Cardiology", subs: ["Interventional", "Structural", "Electrophysiology"], at: ["sheba", "hirslanden"] },
  { icon: Brain, name: "Neurosurgery", subs: ["Tumour", "Spine", "Functional"], at: ["sheba", "anadolu", "foch", "hirslanden"] },
  { icon: Stethoscope, name: "Thoracic surgery", subs: ["Lung transplant", "Robotic resection"], at: ["foch"] },
  { icon: Slice, name: "Transplantation", subs: ["Liver", "Kidney", "BMT"], at: ["sheba", "foch"] },
  { icon: Scissors, name: "Reconstructive surgery", subs: ["Maxillofacial", "Burns", "Functional"], at: ["anadolu", "hirslanden"] },
];

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const hospitalName = (id: string) =>
    DEMO_HOSPITALS.find((h) => h.id === id)?.name.split(" ")[0] ?? id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-3xl font-semibold text-ink">Specialties</h1>
        <p className="mt-2 text-[15px] text-ink-secondary">
          A controlled directory — every specialty maps to named specialists at
          accredited partner hospitals.
        </p>
      </div>

      {/* Filter bar (design-only) */}
      <div className="mb-8 flex flex-col gap-4">
        <SearchInput placeholder="Search specialties" className="max-w-md" />
        <div>
          <SectionLabel className="mb-2">Corridor</SectionLabel>
          <div className="flex flex-wrap gap-2">
            <Chip name="sp-corridor" value="all" defaultSelected>All corridors</Chip>
            <Chip name="sp-corridor" value="il">Israel</Chip>
            <Chip name="sp-corridor" value="fr">France</Chip>
            <Chip name="sp-corridor" value="tr">Turkey</Chip>
            <Chip name="sp-corridor" value="ch">Switzerland</Chip>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SPECIALTIES.map(({ icon: Icon, name, subs, at }) => (
          <Card key={name} className="flex flex-col gap-3 p-5">
            <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Icon aria-hidden className="size-5" />
            </span>
            <h2 className="text-lg font-semibold text-ink">{name}</h2>
            <div className="flex flex-wrap gap-1.5">
              {subs.map((s) => (
                <Chip key={s} size="sm">
                  {s}
                </Chip>
              ))}
            </div>
            <p className="mt-auto pt-1 text-[13px] text-ink-secondary">
              Available at:{" "}
              <span className="font-medium text-ink">
                {at.map(hospitalName).join(" · ")}
              </span>
            </p>
          </Card>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-ink-muted">
        Not listed? Specialties expand with each partner hospital —{" "}
        <a href={`/${locale}/contact`} className="font-medium text-accent hover:underline">
          ask us about a specific case
        </a>
        .
      </p>
    </div>
  );
}
