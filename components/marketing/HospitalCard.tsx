import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import Avatar from "@/components/ui/Avatar";
import Chip from "@/components/ui/Chip";
import type { DemoHospital } from "@/lib/demo";
import { getPartnerImages } from "@/lib/partnerImages";

// Partner hospital card — the directory listing and the home page band render
// the same card, so a partner looks identical wherever a clinician meets it.
// Lifted out of the directory page when the home page gained a partners band;
// two copies would have drifted the moment either gained a field.
export default function HospitalCard({
  hospital: h,
  locale,
}: {
  hospital: DemoHospital;
  locale: string;
}) {
  const { card } = getPartnerImages(h.id);

  return (
    <Link href={`/${locale}/hospitals/${h.id}`} className="group">
      <Card
        className={`flex h-full flex-col gap-4 transition-all duration-150 group-hover:-translate-y-0.5 group-hover:shadow-elevated ${
          // With a photograph the card's padding moves inside, so the image can
          // run to the card's rounded edge instead of floating in a margin.
          card ? "overflow-hidden p-0" : "p-6"
        }`}
      >
        {card && (
          <div className="relative h-36 w-full overflow-hidden bg-page">
            {/* eslint-disable-next-line @next/next/no-img-element -- static
                partner asset; next/image would add a loader for one file. */}
            <img
              src={card.src}
              alt={card.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
            />
          </div>
        )}
        <div className={`flex flex-1 flex-col gap-4 ${card ? "px-6 pb-6" : ""}`}>
        <div className="flex items-center gap-3">
          <Avatar name={h.name} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-semibold text-ink">{h.name}</p>
            <p className="flex items-center gap-1 text-[13px] text-ink-secondary">
              <MapPin aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">
                {h.city}, {h.country} · {h.corridorLabel}
              </span>
            </p>
            {/* A centre that operates under a larger group says so here — the
                affiliation is part of its identity, not a footnote. */}
            {h.affiliation && (
              <p className="truncate text-[13px] text-ink-muted">{h.affiliation}</p>
            )}
          </div>
          <ArrowRight
            aria-hidden
            className="size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
          />
        </div>
        <p className="text-sm leading-relaxed text-ink-secondary">{h.intro}</p>
        <div className="mt-auto flex flex-wrap gap-2 border-t border-line pt-4">
          {h.accreditation.map((a) => (
            <Chip key={a.name} selected size="sm">
              <BadgeCheck aria-hidden className="size-3.5" />
              {a.name}
            </Chip>
          ))}
          {h.specialties.slice(0, 3).map((s) => (
            <Chip key={s} size="sm">
              {s}
            </Chip>
          ))}
        </div>
        </div>
      </Card>
    </Link>
  );
}
