import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

// import اضافه کن
if (!src.includes("from '@capawesome/capacitor-live-update'")) {
  src = "import { LiveUpdate } from '@capawesome/capacitor-live-update';\nimport { Capacitor } from '@capacitor/core';\n" + src;
}

// جایگزینی applyOtaUpdate
const start = src.indexOf('export async function applyOtaUpdate');
if (start === -1) { console.log('❌ پیدا نشد'); process.exit(1); }

let depth = 0, end = start, started = false;
for (let i = start; i < src.length; i++) {
  if (src[i] === '{') { depth++; started = true; }
  else if (src[i] === '}') { depth--; if (started && depth === 0) { end = i + 1; break; } }
}

const newFn = `export async function applyOtaUpdate(url: string): Promise<{ success: boolean; error?: string }> {
  if (!Capacitor.isNativePlatform()) {
    return { success: false, error: 'OTA فقط در APK' };
  }
  try {
    const bundleId = \`ota-\${Date.now()}\`;
    console.log('[OTA] دانلود با bundleId:', bundleId);
    await LiveUpdate.downloadBundle({ url, bundleId });
    await LiveUpdate.setNextBundle({ bundleId });
    await LiveUpdate.reload();
    return { success: true };
  } catch (err: any) {
    console.error('[OTA] خطا:', err);
    return { success: false, error: err?.message || 'خطا در OTA' };
  }
}`;

src = src.slice(0, start) + newFn + src.slice(end);
writeFileSync(file, src);
console.log('✅ applyOtaUpdate با import مستقیم');
