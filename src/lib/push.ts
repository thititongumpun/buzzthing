function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

export async function subscribeToPush({
  jobId,
  userId,
  vapidPublicKey,
}: {
  jobId: string;
  userId: string;
  vapidPublicKey: string;
}) {
  console.log("[push] starting subscribe flow");

  if (!navigator.serviceWorker.controller) {
    console.log("[push] no active SW, registering...");
    const swUrl = import.meta.env.DEV
      ? "/dev-sw.js?dev-sw"
      : "/sw.js";
    await navigator.serviceWorker.register(swUrl, {
      type: import.meta.env.DEV ? "module" : "classic",
    });
  }

  console.log("[push] waiting for service worker ready...");
  const registration = await navigator.serviceWorker.ready;
  console.log("[push] service worker ready", registration);

  console.log("[push] requesting notification permission...");
  const permission = await Notification.requestPermission();
  console.log("[push] permission:", permission);
  if (permission !== "granted") {
    throw new Error("Notification permission denied");
  }

  console.log("[push] subscribing to push manager...");
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer,
  });
  console.log("[push] push subscription:", subscription.toJSON());

  console.log("[push] posting to API...");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/subscription/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, userId, subscription: subscription.toJSON() }),
    },
  );
  console.log("[push] API response status:", response.status);

  if (!response.ok) {
    throw new Error("Failed to subscribe on server");
  }

  return response.json();
}
