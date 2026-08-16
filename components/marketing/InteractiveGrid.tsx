"use client";

import { useEffect, useRef } from "react";

/**
 * Interactive dot grid for the hero. A static grid sits underneath; a brighter
 * accent-coloured copy is revealed through a soft radial mask that follows the
 * pointer, so the surface feels alive without anything moving on its own.
 *
 * Implementation notes:
 *  · position is written straight to CSS custom properties on the element, not
 *    React state — a pointermove listener firing setState would re-render the
 *    whole hero on every mouse pixel.
 *  · updates are throttled to one per animation frame.
 *  · listeners attach to the PARENT section, so the whole hero is the hit area
 *    while this layer stays pointer-events-none.
 *  · honours prefers-reduced-motion: the spotlight simply never fades in.
 */
export default function InteractiveGrid({
  tone = "accent",
}: {
  /** "light" for dark grounds (the navy CTA band), where accent-on-navy reads muddy. */
  tone?: "accent" | "light";
} = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const dot =
    tone === "light"
      ? "rgba(255,255,255,0.55)"
      : "color-mix(in srgb, var(--color-accent) 70%, transparent)";
  const wash =
    tone === "light"
      ? "rgba(255,255,255,0.10)"
      : "color-mix(in srgb, var(--color-accent) 10%, transparent)";

  useEffect(() => {
    const el = ref.current;
    const host = el?.parentElement;
    if (!el || !host) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Coarse pointers have no hover to follow — leave the static grid alone.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    const apply = () => {
      frame = 0;
      el.style.setProperty("--mx", `${x}px`);
      el.style.setProperty("--my", `${y}px`);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      x = e.clientX - r.left;
      y = e.clientY - r.top;
      // Also reveal here, not just on pointerenter: if the page loads with the
      // cursor already inside the hero, enter never fires and the grid would
      // stay dark until the pointer left and came back.
      el.style.setProperty("--spot", "1");
      if (!frame) frame = requestAnimationFrame(apply);
    };
    const onEnter = () => el.style.setProperty("--spot", "1");
    const onLeave = () => el.style.setProperty("--spot", "0");

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      // Opacity comes from --spot alone. An `opacity-0` class alongside the
      // arbitrary value would be the same specificity and the winner would
      // depend on stylesheet order.
      className="pointer-events-none absolute inset-0 transition-opacity duration-500 [opacity:var(--spot,0)]"
      style={
        {
          "--mx": "50%",
          "--my": "40%",
          // Accent dots on the same 22px rhythm as the static grid beneath, so
          // the two align exactly and it reads as one surface lighting up.
          backgroundImage: `radial-gradient(${dot} 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(240px circle at var(--mx) var(--my), black 0%, rgba(0,0,0,0.35) 45%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(240px circle at var(--mx) var(--my), black 0%, rgba(0,0,0,0.35) 45%, transparent 72%)",
        } as React.CSSProperties
      }
    >
      {/* Soft wash under the dots so the lit area feels warm rather than speckled */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(300px circle at var(--mx) var(--my), ${wash}, transparent 70%)`,
        }}
      />
    </div>
  );
}
