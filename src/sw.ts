/// <reference lib="webworker" />

import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

// Precache static assets injected by workbox-build
precacheAndRoute(self.__WB_MANIFEST);

// SSR pages: network-first with 24h cache fallback
const navigationHandler = new NetworkFirst({
	cacheName: "pages-cache",
	plugins: [
		new ExpirationPlugin({
			maxAgeSeconds: 24 * 60 * 60,
		}),
	],
});
registerRoute(new NavigationRoute(navigationHandler));

// Static assets (JS, CSS, fonts): cache-first with 7-day expiry
registerRoute(
	({ request }) =>
		request.destination === "script" ||
		request.destination === "style" ||
		request.destination === "font",
	new CacheFirst({
		cacheName: "static-assets-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 7 * 24 * 60 * 60,
			}),
		],
	}),
);

// Images: cache-first with 30-day expiry
registerRoute(
	({ request }) => request.destination === "image",
	new CacheFirst({
		cacheName: "images-cache",
		plugins: [
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 30 * 24 * 60 * 60,
			}),
		],
	}),
);

// Push notifications
self.addEventListener("push", (event) => {
	let title = "Buzzthing";
	let options: NotificationOptions = {};

	if (event.data) {
		try {
			const payload = event.data.json() as {
				title?: string;
				body?: string;
				icon?: string;
				data?: Record<string, unknown>;
			};
			title = payload.title ?? title;
			options = {
				body: payload.body,
				icon: payload.icon ?? "/icon-192x192.png",
				data: payload.data,
			};
		} catch {
			options = { body: event.data.text(), icon: "/icon-192x192.png" };
		}
	}

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const url =
		(event.notification.data as { url?: string } | undefined)?.url ?? "/";

	event.waitUntil(
		self.clients.matchAll({ type: "window" }).then((windowClients) => {
			for (const client of windowClients) {
				if ("focus" in client) {
					client.focus();
					client.navigate(url);
					return;
				}
			}
			self.clients.openWindow(url);
		}),
	);
});
