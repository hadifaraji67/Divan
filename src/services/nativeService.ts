import { registerPlugin } from '@capacitor/core';

export interface SmsReaderPluginInterface {
  startVerificationListener(): Promise<{ status: string }>;
  addListener(
    eventName: 'onSmsReceived',
    listenerFunc: (data: { message: string; sender: string }) => void
  ): Promise<any>;
}

export interface NativePrintPluginInterface {
  printText(options: { macAddress: string; text: string }): Promise<{ success: boolean }>;
}

export const SmsReader = registerPlugin<SmsReaderPluginInterface>('SmsReader');
export const NativePrint = registerPlugin<NativePrintPluginInterface>('NativePrint');

export const extractOtpCode = (message: string): string | null => {
  const match = message.match(/\b\d{4,6}\b/);
  return match ? match[0] : null;
};
