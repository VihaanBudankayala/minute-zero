/*
 * sw.js — Minute Zero's service worker (offline support).
 *
 * A service worker is a script the browser keeps running in the background
 * for this website. The first time someone opens Minute Zero, it saves
 * (caches) every file the app needs. After that, the app opens even with no
 * signal: in a basement, a stairwell, or a rural area.
 *
 * Strategy: "cache first, update in the background". In an emergency we never
 * want to wait for the network, so we answer from the saved copy right away
 * and quietly fetch a fresh copy for next time.
 *
 * When you change any file, change CACHE_VERSION (v1 -> v2) so phones throw
 * away the old saved copy and save the new files.
 */
const CACHE_VERSION = "minutezero-v3";

// Every file the app needs to work offline.
const FILES = [
  "./",
  "index.html",
  "styles.css",
  "content.js",
  "app.js",
  "manifest.webmanifest",
  "images/icon-192.png",
  "images/icon-512.png",
  "images/aed-pad-placement.webp",
  "images/arm-weakness.webp",
  "images/balance-loss.webp",
  "images/cpr-hand-placement.webp",
  "images/direct-pressure.webp",
  "images/face-drooping.webp",
  "images/speech-difficulty.webp",
  "images/time-call-911.webp",
  "images/tourniquet.webp",
  "images/vision-changes.webp",
  "images/wound-packing.webp",
];

// 1) Install: save every file. If one is missing, installing fails (on purpose),
//    so we never end up with a half-saved app.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(FILES))
  );
  self.skipWaiting(); // start using the new version right away
});

// 2) Activate: delete saved copies from older versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_VERSION).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim(); // control pages that are already open
});

// 3) Fetch: answer from the saved copy first; update it in the background.
self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Only handle normal page loads from our own site (not tel:, sms:, or other sites).
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      const saved = await cache.match(request, { ignoreSearch: true });
      const fresh = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => null); // offline: no fresh copy, that's fine

      if (saved) return saved;              // fast path: saved copy
      const response = await fresh;         // not saved yet: try the network
      if (response) return response;
      // Offline and never saved (e.g. an unusual URL): fall back to the app's page.
      return cache.match("index.html");
    })
  );
});
