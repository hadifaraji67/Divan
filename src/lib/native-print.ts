import { registerPlugin } from "@capacitor/core";

interface NativePrintPlugin {
  printPage(): Promise<{ started: boolean }>;
}

// Backed by NativePrintPlugin.java — only meaningful inside the native
// Android shell; see invoice-app.tsx for the Capacitor.isNativePlatform()
// branch that picks this over window.print().
const NativePrint = registerPlugin<NativePrintPlugin>("NativePrint");

export default NativePrint;
