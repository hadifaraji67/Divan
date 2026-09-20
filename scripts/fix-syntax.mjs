import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');
const original = src;

// پاک کردن الگوی `}> {` که اشتباه مانده
src = src.replace(/\}> \{\s*\n/g, '}\n');

if (src !== original) {
  writeFileSync(file, src);
  console.log('✅ الگوی }> { حذف شد');
} else {
  console.log('⏭ الگوی }> { پیدا نشد');
}
