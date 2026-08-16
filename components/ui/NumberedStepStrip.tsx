import { cn } from "@/lib/cn";

interface Step {
  title: string;
  description: string;
}

// Wave geometry, in the SVG's 1000x200 viewBox. Nodes alternate between the
// crest and the trough; each pair is joined by a cubic whose control points sit
// on the midpoint, which is what makes the curve leave and enter every node
// horizontally and read as one continuous wave.
const CREST = 60;
const TROUGH = 140;

function waveNodeY(i: number) {
  return i % 2 === 0 ? CREST : TROUGH;
}

function wavePath(count: number) {
  const x = (i: number) => ((i + 0.5) / count) * 1000;
  let d = `M0,${waveNodeY(0)} L${x(0)},${waveNodeY(0)}`;
  for (let i = 1; i < count; i++) {
    const mid = (x(i - 1) + x(i)) / 2;
    d += ` C${mid},${waveNodeY(i - 1)} ${mid},${waveNodeY(i)} ${x(i)},${waveNodeY(i)}`;
  }
  return `${d} L1000,${waveNodeY(count - 1)}`;
}

/**
 * NumberedStepStrip (design spec V2 §2.23): the referral pathway for marketing
 * pages.
 *
 * Desktop is a serpentine — the numbered badges alternate above and below a
 * wave that threads through them, with the copy in a straight row beneath.
 * Mobile collapses to a vertical list with a start-side connector; a wave is
 * meaningless in one column.
 *
 * Everything is derived from `steps.length` (the home page passes 5,
 * for-clinicians passes 4), so the wave always ends on a real badge.
 *
 * How the badges land exactly on the wave:
 *  · the grid has NO column gap, so column centres are exactly (i + 0.5) / n of
 *    the width — the same fractions the wave's node x-coordinates use. A gap
 *    would shift them ~9px and the badges would visibly miss the line, so the
 *    breathing room is padding inside each item instead.
 *  · the SVG is `preserveAspectRatio="none"`, so those fractions hold at any
 *    width, and `vector-effect="non-scaling-stroke"` stops the non-uniform
 *    scale from distorting the stroke.
 *
 * The gradient's id is fixed rather than generated, so render at most one strip
 * per page — which is the case today.
 */
export default function NumberedStepStrip({
  steps,
  className,
}: {
  steps: Step[];
  className?: string;
}) {
  return (
    <ol
      className={cn("relative flex flex-col gap-8 md:grid md:gap-0", className)}
      style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
    >
      {/* 168px tall; crest and trough sit at 50.4px and 117.6px down. */}
      <svg
        aria-hidden
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-[168px] w-full md:block"
      >
        <defs>
          <linearGradient id="step-wave" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.2" />
            <stop offset="0.5" stopColor="var(--color-accent)" stopOpacity="0.85" />
            <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <path
          d={wavePath(steps.length)}
          fill="none"
          stroke="url(#step-wave)"
          strokeWidth="2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Mobile connector */}
      <span aria-hidden className="absolute bottom-4 start-5 top-4 w-px bg-line md:hidden" />

      {steps.map((step, i) => (
        <li key={step.title} className="relative flex gap-4 md:block md:px-3">
          <span
            className={cn(
              // `text-ink` rather than `text-accent`: the badge has to stay
              // legible on the navy band too, and both tokens flip together.
              "z-[1] flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[15px] font-semibold text-ink ring-4 ring-page",
              // Desktop: centred in its column, dropped onto the wave's crest
              // or trough — node centre minus half the badge.
              "md:absolute md:left-1/2 md:-translate-x-1/2",
              i % 2 === 0 ? "md:top-[30px]" : "md:top-[98px]",
            )}
          >
            {i + 1}
          </span>
          <span className="md:block md:pt-[184px]">
            <span className="block text-[16px] font-semibold text-ink">{step.title}</span>
            <span className="mt-1 block max-w-[36ch] text-sm leading-relaxed text-ink-secondary">
              {step.description}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}
