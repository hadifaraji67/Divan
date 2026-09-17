import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// پیدا کردن فایل‌هایی که APP_VERSION را نمایش می‌دهند
const files = [
  'src/components/settings/UpdateSettings.tsx',
  'src/components/shared/UpdateBanner.tsx',
  'src/components/shared/UpdateChoiceDialog.tsx',
];

let changed = 0;

for (const file of files) {
  try {
    let src = readFileSync(file, 'utf8');
    const before = src;

    // APP_VERSION را با dir="ltr" نمایش بده
    // {APP_VERSION} → <span dir="ltr">{APP_VERSION}</span>
    src = src.replace(/\{APP_VERSION\}/g, '<span dir="ltr" className="inline-block">{APP_VERSION}</span>');
    src = src.replace(/\{info\.currentVersion\}/g, '<span dir="ltr" className="inline-block">{info.currentVersion}</span>');
    src = src.replace(/\{info\.latestVersion\}/g, '<span dir="ltr" className="inline-block">{info.latestVersion}</span>');

    if (src !== before) {
      writeFileSync(file, src);
      console.log(`✅ ${file}`);
      changed++;
    } else {
      console.log(`⏭ ${file} — تغییری لازم نیست`);
    }
  } catch (e) {
    console.log(`⏭ ${file} — یافت نشد`);
  }
}

console.log('');
console.log(`🎉 ${changed} فایل patch شد`);
