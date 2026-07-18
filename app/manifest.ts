import type { MetadataRoute } from "next";

// PWA web app manifest (Next 16 metadata route → served at /manifest.webmanifest).
// TODO: replace placeholder icons with real maskable PNG icon sets (192/512).
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
    theme_color: "#0f172a",
    icons: [
      // Placeholder — swap for real app icons before launch.
      { src: "/globe.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
