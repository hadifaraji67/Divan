import { readFileSync, writeFileSync } from 'node:fs';
const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');

// حذف خط cp light
src = src.replace(
  /          cp android\/app\/build\/outputs\/apk\/release\/app-release\.apk "release\/divan-\$\{VERSION\}-light\.apk"\s*\n/g,
  ''
);

// حذف هر بلوک ذخیره سبک/light که باقی مانده
const lightBlocks = [
  /      - name: [^\n]*[Ll]ight[^\n]*\n[\s\S]*?(?=      - name:|$)/g,
];

for (const re of lightBlocks) {
  const before = src.length;
  src = src.replace(re, '');
  if (src.length < before) {
    console.log(`✅ بلوک light حذف شد (${before - src.length} char)`);
  }
}

writeFileSync(file, src);
console.log('✅ workflow پاک‌سازی شد');
