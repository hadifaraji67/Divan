import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ مهم: این config برای APK مستقل است.
// فایل‌های بیلد شده (dist/) داخل APK بسته‌بندی می‌شوند.
// به همین دلیل بدون اینترنت هم کار می‌کند.
const config: CapacitorConfig = {
  appId: "ir.divan.app",
  appName: "دیوان",
  webDir: "dist",
  server: {
    hostname: "localhost",
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    LiveUpdate: {
      appId: "ir.divan.app",
      autoUpdateStrategy: "none",
      readyTimeout: 30000,
      resetWhenUpdate: false,
    },
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: "#1b3654",
      androidSplashResourceName: "splash",
      showSpinner: false,
    },
  },
};

export default config;
