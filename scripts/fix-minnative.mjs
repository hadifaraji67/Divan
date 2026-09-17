import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

const before = `  const otaAvailable = isNative
    && manifest.ota.available
    && !manifest.requiresNativeUpdate
    && !!manifest.ota.url;`;

const after = `  // چک minNativeVersion — اگر اپ فعلی از حداقل نسخه native قدیمی‌تر است، OTA کار نمی‌کند
  const minNative = manifest.ota.minNativeVersion;
  const nativeOk = !minNative || compareVersions(APP_VERSION, minNative) >= 0;

  const otaAvailable = isNative
    && manifest.ota.available
    && !manifest.requiresNativeUpdate
    && !!manifest.ota.url
    && nativeOk;`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ چک minNativeVersion اضافه شد');
} else {
  console.log('❌ بلوک پیدا نشد');
  process.exit(1);
}
