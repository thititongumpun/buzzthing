/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute, NavigationRoute } from 'workbox-routing'
import { NetworkFirst, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

declare const self: ServiceWorkerGlobalScope

// Precache static assets injected by workbox-build
precacheAndRoute(self.__WB_MANIFEST)

// SSR pages: network-first with 24h cache fallback
const navigationHandler = new NetworkFirst({
  cacheName: 'pages-cache',
  plugins: [
    new ExpirationPlugin({
      maxAgeSeconds: 24 * 60 * 60,
    }),
  ],
})
registerRoute(new NavigationRoute(navigationHandler))

// Static assets (JS, CSS, fonts): cache-first with 7-day expiry
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new CacheFirst({
    cacheName: 'static-assets-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60,
      }),
    ],
  }),
)

// Images: cache-first with 30-day expiry
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  }),
)
