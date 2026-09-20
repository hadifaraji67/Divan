import type { CapacitorConfig } from "@capacitor/cli";

const mlkitMode = process.env.MLKIT_MODE || "full";
const isLight = mlkitMode === "light";
console.log(`[Capacitor] MLKit mode: ${mlkitMode}`);

const config: CapacitorConfig = {
  appId: "ir.divan.app",
  appName: "دیوان",
  webDir: "dist",
  server: {
    hostname: "localhost",
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  android: { allowMixedContent: true },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#1b3654",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
