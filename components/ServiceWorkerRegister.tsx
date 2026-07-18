"use client";

import { useEffect } from "react";

/**
 * Registers the app-shell service worker (public/sw.js).
 *
 * The service worker caches the STATIC APP SHELL ONLY. It must never cache
 * patient data / PHI offline (see PROJECT_CONTEXT.md §2.3). This component only
 * handles registration; the caching policy lives in public/sw.js.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  }, []);

  return null;
}
