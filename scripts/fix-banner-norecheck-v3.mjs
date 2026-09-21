import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/shared/UpdateBanner.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('divan_banner_checked')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const patterns = [
  /useEffect\(\(\)\s*=>\s*\{\s*doCheck\(\);\s*\},\s*\[doCheck,\s*forceCheck\]\);/,
  /useEffect\(\(\)\s*=>\s*\{\s*doCheck\(\);\s*\},\s*\[doCheck\]\);/,
];

for (const re of patterns) {
  if (re.test(src)) {
    src = src.replace(
      re,
      `useEffect(() => {
    if (sessionStorage.getItem('divan_banner_checked')) return;
    sessionStorage.setItem('divan_banner_checked', '1');
    doCheck();
  }, []);`
    );
    writeFileSync(file, src);
    console.log('✅ UpdateBanner: یک بار در session');
    process.exit(0);
  }
}

console.log('⚠️ useEffect پیدا نشد');
