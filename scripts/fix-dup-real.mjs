import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');

// پیدا کردن همه `<div className="flex gap-2">` که شامل setShowScanner(true) هستند
const blockRegex = /<div className="flex gap-2">[\s\S]*?setShowScanner\(true\)[\s\S]*?<\/div>/g;
const blocks = src.match(blockRegex);

console.log(`بلوک‌های پیدا شده: ${blocks ? blocks.length : 0}`);

if (blocks && blocks.length > 1) {
  // نگه‌داشتن اولین، حذف بقیه
  let kept = false;
  src = src.replace(blockRegex, (match) => {
    if (!kept) {
      kept = true;
      return match;
    }
    return '';
  });
  writeFileSync(file, src);
  console.log(`✅ ${blocks.length - 1} بلوک تکراری حذف شد`);
} else if (blocks && blocks.length === 1) {
  console.log('✅ فقط یک بلوک هست — درست است');
} else {
  console.log('⚠️ الگو پیدا نشد — لطفاً کد را بررسی کن');
}
