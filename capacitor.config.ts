import type { CapacitorConfig } from "@capacitor/cli";

// The native shell loads the already-deployed app instead of bundling a
// static copy — this keeps one source of truth (Vercel) and Capacitor
// only adds the native container + permissions (SMS, etc.) around it.
// Update `server.url` if the Vercel domain ever changes.
const config: CapacitorConfig = {
  appId: "ir.divan.app",
  appName: "دیوان",
  webDir: "dist",
  server: {
    url: "https://divan-one.vercel.app",
    cleartext: false,
  },
};

export default config;
