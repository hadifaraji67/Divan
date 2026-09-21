import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/settings/UpdateSettings.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('divan_update_checked')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// ─── پیدا کردن useEffect با doCheck ───
const patterns = [
  /useEffect\(\(\)\s*=>\s*\{[\s\S]*?setTimeout\([^)]*doCheck[^)]*\)[\s\S]*?\},\s*\[\]\);/,
  /useEffect\(\(\)\s*=>\s*\{[\s\S]*?doCheck\(\)[\s\S]*?\},\s*\[\]\);/,
];

for (const re of patterns) {
  if (re.test(src)) {
    src = src.replace(
      re,
      `useEffect(() => {
    // فقط یک بار در session چک کن
    if (sessionStorage.getItem('divan_update_checked')) {
      return;
    }
    sessionStorage.setItem('divan_update_checked', '1');

    const t = setTimeout(() => doCheck(), 500);
    return () => clearTimeout(t);
  }, []);`
    );
    writeFileSync(file, src);
    console.log('✅ UpdateSettings: یک بار در session');
    process.exit(0);
  }
}

console.log('⚠️ useEffect پیدا نشد');
console.log('نمایش اولین useEffect:');
const firstEffect = src.match(/useEffect\([\s\S]*?\},\s*\[[^\]]*\]\);/);
if (firstEffect) {
  console.log(firstEffect[0].slice(0, 300));
}
