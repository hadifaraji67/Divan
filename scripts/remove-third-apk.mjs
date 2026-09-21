import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');

// حذف خط تولید APK سوم
const lines = src.split('\n');
const filtered = lines.filter((line) => {
  return !line.includes('cp android/app/build/outputs/apk/release/app-release.apk "release/divan-${VERSION}.apk"');
});

src = filtered.join('\n');
writeFileSync(file, src);
console.log('✅ APK سوم حذف شد');
