import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/main.tsx';
let src = readFileSync(file, 'utf8');

if (src.includes('notifyAppReady')) {
  console.log('⏭ notifyAppReady قبلاً هست');
} else {
  const before = "const rootElement = document.getElementById('root')!;";
  const after = `// ⚠️ اطلاع به LiveUpdate که اپ با موفقیت لود شد
(async () => {
  const w = window as any;
  if (w.Capacitor?.isNativePlatform?.() && w.Capacitor?.Plugins?.LiveUpdate) {
    try {
      await w.Capacitor.Plugins.LiveUpdate.notifyAppReady();
      console.log('[LiveUpdate] notifyAppReady ✓');
    } catch (e) {
      console.warn('[LiveUpdate] notifyAppReady خطا:', e);
    }
  }
  // لاگ پلتفرم
  console.log('[Diwan] platform:', w.Capacitor?.platform, '| native:', w.Capacitor?.isNativePlatform?.());
})();

const rootElement = document.getElementById('root')!;`;

  if (src.includes(before)) {
    src = src.replace(before, after);
    writeFileSync(file, src);
    console.log('✅ notifyAppReady به main.tsx اضافه شد');
  } else {
    console.log('❌ anchor پیدا نشد');
    process.exit(1);
  }
}
