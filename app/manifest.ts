import type { MetadataRoute } from "next";

// PWA web app manifest (Next 16 metadata route → served at /manifest.webmanifest).
//
// Icons are the LibaMed roundel — the same mark the app header uses — rather
// than the scaffold's globe.svg placeholder. Two purposes, because they are
// genuinely different pictures: "any" is the roundel on transparency, while
// "maskable" is full-bleed with the monogram inside the safe zone, because
// Android crops maskable icons to a circle or squircle and would otherwise
// slice the edge off the roundel.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LibaMed — Clinician Referrals",
    short_name: "LibaMed",
    description:
      "Clinician-to-clinician international medical referral platform.",
    start_url: "/en",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#182238",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
