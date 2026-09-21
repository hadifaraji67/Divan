import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/settings/UpdateSettings.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('// AUTO_CHECK_REMOVED')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// ─── پیدا کردن useEffect که doCheck را صدا می‌زند ───
const effectRegex = /useEffect\(\(\)\s*=>\s*\{[\s\S]*?doCheck[\s\S]*?\},\s*\[\s*\]\s*\);/g;

const matches = src.match(effectRegex);

if (matches && matches.length > 0) {
  // جایگزینی با کامنت
  src = src.replace(
    effectRegex,
    `// AUTO_CHECK_REMOVED — چک خودکار حذف شد. فقط با دکمه «بررسی به‌روزرسانی» چک کن
  // useEffect(() => {
  //   const t = setTimeout(() => doCheck(), 500);
  //   return () => clearTimeout(t);
  // }, []);`
  );
  writeFileSync(file, src);
  console.log('✅ چک خودکار حذف شد');
} else {
  console.log('⚠️ useEffect خودکار پیدا نشد');
  
  // چک کن useEffect هست ولی ساختار متفاوته
  const anyEffect = src.match(/useEffect\([\s\S]*?\},\s*\[[^\]]*\]\);/);
  if (anyEffect) {
    console.log('نمایش اولین useEffect:');
    console.log(anyEffect[0].slice(0, 300));
  }
}
