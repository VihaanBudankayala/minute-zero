/*
 * sw.js — Minute Zero's service worker (offline support).
 *
 * A service worker is a script the browser keeps running in the background
 * for this website. The first time someone opens Minute Zero, it saves
 * (caches) every file the app needs. After that, the app opens even with no
 * signal: in a basement, a stairwell, or a rural area.
 *
 * Strategy: "network first, saved copy as backup". Each request tries the
 * internet first, so a new version shows up on the very next load. If there's
 * no answer within 3 seconds, or the phone is offline, the saved copy is used
 * instead, so the app still opens in a basement or a dead zone.
 * (Our first version was "cache first": fast, but phones kept showing the OLD
 * version after an update until a second reload. See DEVLOG.)
 *
 * When you change any file, change CACHE_VERSION (v1 -> v2) so phones throw
 * away the old saved copy and save the new files.
 */
const CACHE_VERSION = "minutezero-v4";

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

// 3) Fetch: try the network first (with a 3-second limit); fall back to the saved copy.
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener("fetch", (event) => {
  const request = event.request;
  // Only handle normal loads from our own site (not tel:, sms:, or other sites).
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_VERSION).then(async (cache) => {
      // A promise that gives up after 3 seconds (a weak signal shouldn't make people wait).
      const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone()); // keep the saved copy fresh
          return response;
        })
        .catch(() => null); // offline

      // Promise.race = whichever finishes first: the network answer or the 3-second limit.
      const response = await Promise.race([network, timeout]);
      if (response) return response;

      const saved = await cache.match(request, { ignoreSearch: true });
      if (saved) return saved;
      // Not saved (unusual URL) and no network: wait for the network a bit longer,
      // then fall back to the app's page.
      return (await network) || cache.match("index.html");
    })
  );
});
