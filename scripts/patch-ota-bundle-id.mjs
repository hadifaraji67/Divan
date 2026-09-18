import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');
const log = [];

const before = `export async function applyOtaUpdate(url: string): Promise<{ success: boolean; error?: string }> {
  const w = window as any;
  if (!w.Capacitor?.isNativePlatform?.()) {
    return { success: false, error: 'OTA فقط در APK' };
  }

  try {
    const { LiveUpdate } = w.Capacitor.Plugins;
    if (!LiveUpdate) return { success: false, error: 'پلاگین LiveUpdate یافت نشد' };

    // دانلود و اعمال
    await LiveUpdate.downloadBundle({ url, bundleId: \`v\${Date.now()}\` });
    await LiveUpdate.setNextBundle({ bundleId: \`v\${Date.now()}\` });
    await LiveUpdate.reload();

    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    return { success: false, error: err?.message || 'خطا در OTA' };
  }
}`;

const after = `export async function applyOtaUpdate(url: string): Promise<{ success: boolean; error?: string }> {
  const w = window as any;
  if (!w.Capacitor?.isNativePlatform?.()) {
    return { success: false, error: 'OTA فقط در APK' };
  }

  try {
    const { LiveUpdate } = w.Capacitor.Plugins;
    if (!LiveUpdate) return { success: false, error: 'پلاگین LiveUpdate یافت نشد' };

    // ⚠️ مهم: bundleId باید یکسان باشد بین download و setNext
    const bundleId = \`ota-\${Date.now()}\`;
    console.log('[OTA] شروع دانلود با bundleId:', bundleId);

    // ۱. دانلود bundle
    await LiveUpdate.downloadBundle({ url, bundleId });
    console.log('[OTA] دانلود موفق');

    // ۲. تنظیم به عنوان bundle بعدی
    await LiveUpdate.setNextBundle({ bundleId });
    console.log('[OTA] setNextBundle موفق');

    // ۳. ری‌استارت اپ برای اعمال
    await LiveUpdate.reload();

    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    const msg = err?.message || err?.errorMessage || 'خطا در OTA';
    return { success: false, error: msg };
  }
}`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  log.push('✅ applyOtaUpdate اصلاح شد (bundleId یکسان)');
} else if (src.includes('ota-${Date.now()}')) {
  log.push('⏭ قبلاً patch شده');
} else {
  log.push('❌ بلوک applyOtaUpdate پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
