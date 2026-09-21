import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/shared/UpdateBanner.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

// چک قبلی
if (src.includes('// BANNER_INTERVAL_REMOVED')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// ─── حذف useEffect interval ───
const intervalRegex = /useEffect\(\(\)\s*=>\s*\{\s*\n\s*const interval = setInterval\(doCheck,\s*[^)]+\);\s*\n\s*return \(\) => clearInterval\(interval\);\s*\n\s*\},\s*\[doCheck\]\);/;

if (intervalRegex.test(src)) {
  src = src.replace(
    intervalRegex,
    `// BANNER_INTERVAL_REMOVED — چک دوره‌ای حذف شد (فقط یک بار در session کافیست)`
  );
  writeFileSync(file, src);
  console.log('✅ interval ساعتی حذف شد');
} else {
  console.log('⚠️ interval پیدا نشد — ساختار متفاوت');
  
  // نمایش خطوط مربوطه
  const intervalMatch = src.match(/setInterval[\s\S]*?\}/);
  if (intervalMatch) {
    console.log('نمایش:');
    console.log(intervalMatch[0].slice(0, 200));
  }
}
