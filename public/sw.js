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

// Bump this version whenever the caching logic changes. `activate` deletes every
// cache that isn't the current one, which also purges any cache poisoned by an
// earlier build (see the response.ok guard below).
const SHELL_CACHE = "libamed-shell-v2";
const OFFLINE_URL = "/offline.html";

// Static shell assets that are safe to precache (no patient data).
const SHELL_ASSETS = [OFFLINE_URL, "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Precache best-effort: a single missing asset (e.g. during a deploy)
      // must not abort the whole install and leave the old worker in charge.
      Promise.allSettled(SHELL_ASSETS.map((asset) => cache.add(asset))),
    ),
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

  // Cache-first ONLY for immutable static build assets (/_next/static/*, which
  // are content-hashed). These are safe to serve from cache indefinitely.
  if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const response = await fetch(request);
          // CRITICAL: only cache a complete, successful, same-origin response.
          // Caching a 404/error/opaque response here would make cache-first
          // serve it forever — e.g. a CSS chunk that 404s during a redeploy
          // would leave the page permanently unstyled until the cache cleared.
          if (response.ok && response.type === "basic") {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Network failed and we have nothing cached — surface the error
          // instead of writing a bad entry into the cache.
          return Response.error();
        }
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
