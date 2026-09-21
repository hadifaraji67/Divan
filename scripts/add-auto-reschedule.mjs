import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/App.tsx';

if (!existsSync(file)) {
  console.log('❌ App.tsx پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

// چک قبلی
if (src.includes('startAutoReschedule')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
if (!src.includes("from './lib/cheque-reminder'")) {
  src = src.replace(
    "import { startWatcher } from './lib/sync/watcher';",
    "import { startWatcher } from './lib/sync/watcher';\nimport { startAutoReschedule } from './lib/cheque-reminder';"
  );
}

// useEffect
const useEffectPattern = /useAutoBackup\(\);/;
if (useEffectPattern.test(src)) {
  src = src.replace(
    useEffectPattern,
    `useAutoBackup();

  // یادآوری چک‌ها
  useEffect(() => {
    const stop = startAutoReschedule();
    return () => stop();
  }, []);`
  );
  console.log('✅ auto reschedule اضافه شد');
}

writeFileSync(file, src);
