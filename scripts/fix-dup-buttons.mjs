import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');

// حذف دکمه‌های تکراری — فقط یکی نگه دار
// الگو: چند بار `<div className="flex gap-2">...<button ...onClick={() => setShowScanner(true)}...`

const pattern = /<div className="flex gap-2">\s*<input value={editing\.barcode[^]*?<\/button>\s*<\/div>/g;
const matches = src.match(pattern);

console.log(`تعداد بلوک‌های پیدا شده: ${matches ? matches.length : 0}`);

if (matches && matches.length > 1) {
  // نگه‌داشتن اولین، حذف بقیه
  let count = 0;
  src = src.replace(pattern, (match) => {
    count++;
    return count === 1 ? match : '';
  });
  writeFileSync(file, src);
  console.log(`✅ ${count - 1} بلوک تکراری حذف شد`);
} else {
  console.log('⏭ نیازی به حذف نبود');
}
