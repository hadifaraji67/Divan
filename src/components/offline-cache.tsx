/**
 * Registers the offline service worker (public/sw.js) once, client-side
 * only. After the first successful online visit, the app shell is cached
 * so it keeps working with no network — e.g. airplane mode. Mounted once
 * in `__root.tsx`, same pattern as PreviewHostBridge.
 */
import { useEffect } from "react";

export function OfflineCache() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline caching is a progressive enhancement — never block the app.
    });
  }, []);

  return null;
}
