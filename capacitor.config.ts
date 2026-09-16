import type { CapacitorConfig } from "@capacitor/cli";

// ⚠️ مهم: این config برای APK مستقل است.
// فایل‌های بیلد شده (dist/) داخل APK بسته‌بندی می‌شوند.
// به همین دلیل بدون اینترنت هم کار می‌کند.
const config: CapacitorConfig = {
  appId: "ir.divan.app",
  appName: "دیوان",
  webDir: "dist",
  android: {
    allowMixedContent: true,
  },
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
