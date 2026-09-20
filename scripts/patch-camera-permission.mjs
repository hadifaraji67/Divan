import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/shared/BarcodeScanner.tsx';
let src = readFileSync(file, 'utf8');

// جایگزینی getUserMedia با درخواست مجوز Capacitor
const oldStart = `const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });`;

const newStart = `// ─── درخواست مجوز در APK ───
        const w = window as any;
        if (w.Capacitor?.isNativePlatform?.()) {
          try {
            const { Camera } = w.Capacitor.Plugins;
            if (Camera?.requestPermissions) {
              const perm = await Camera.requestPermissions({ permissions: ['camera'] });
              if (perm?.camera !== 'granted') {
                throw new Error('دسترسی به دوربین رد شد — از تنظیمات گوشی اجازه بده');
              }
            }
          } catch (permErr: any) {
            console.warn('[Barcode] permission request:', permErr);
          }
        }

        // ─── درخواست stream ───
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });`;

if (src.includes(oldStart) && !src.includes('requestPermissions')) {
  src = src.replace(oldStart, newStart);
  writeFileSync(file, src);
  console.log('✅ درخواست مجوز runtime اضافه شد');
} else {
  console.log('⏭ نیازی نبود');
}
