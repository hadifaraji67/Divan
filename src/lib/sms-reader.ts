import { registerPlugin } from "@capacitor/core";

export interface SmsMessage {
  address: string;
  body: string;
  date: number;
}

interface SmsReaderPlugin {
  requestSmsPermission(): Promise<{ granted: boolean }>;
  readMessages(options?: { limit?: number }): Promise<{ messages: SmsMessage[] }>;
}

// Backed by the custom native plugin registered in MainActivity.java
// (android/app/src/main/java/ir/divan/app/SmsReaderPlugin.java). Only
// works inside the native Android shell — resolves to undefined methods
// in a plain browser, so callers should check `Capacitor.isNativePlatform()`
// first.
const SmsReader = registerPlugin<SmsReaderPlugin>("SmsReader");

export default SmsReader;
