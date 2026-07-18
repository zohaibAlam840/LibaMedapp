/*
 * LibaMed service worker — APP SHELL ONLY.
 *
 * ⚠️ NEVER cache PHI / patient data offline (PROJECT_CONTEXT.md §2.3).
 * This worker caches only the static app shell + an offline fallback page.
 * All navigations are network-first; anything that could contain patient data
 * (API calls, case/document responses) is passed straight to the network and is
 * NEVER written to the cache.
 *
 * This is a structure-only stub. A production build should use a vetted
 * precache/runtime strategy (e.g. Serwist) with an explicit PHI denylist.
 */

const SHELL_CACHE = "libamed-shell-v1";
const OFFLINE_URL = "/offline.html";

// Static shell assets that are safe to precache (no patient data).
const SHELL_ASSETS = [OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== SHELL_CACHE).map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Cache-first ONLY for immutable static build assets. Nothing else.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Navigations: network-first, fall back to the offline shell page.
  // Responses are NOT cached — they may contain PHI.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then((res) => res ?? Response.error()),
      ),
    );
    return;
  }

  // Everything else (API/data/PHI): network-only, never cached.
});
