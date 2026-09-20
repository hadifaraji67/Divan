import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// ─── حذف همه بلوک‌های div>input+button اسکن ───
// الگو: <div className="flex gap-2">...<input barcode/>...<button setShowScanner>...</button>...</div>
let before = src.length;
const regex = /<div className="flex gap-2">\s*<input value={editing\.barcode[\s\S]*?setShowScanner\(true\)[\s\S]*?<\/button>\s*<\/div>/g;

let count = 0;
src = src.replace(regex, (match) => {
  count++;
  // فقط اولین رو نگه‌دار، بقیه رو حذف کن
  if (count === 1) return match;
  return '';
});
log.push(`✅ حذف تکراری: ${count - 1} بلوک`);

// ─── حذف دکمه‌های اسکن بدون div والد ───
const oldBtnRegex = /<button[^>]*onClick={\(\) => setShowScanner\(true\)}[^>]*>[\s\S]*?<\/button>/g;
const oldBtns = src.match(oldBtnRegex);
if (oldBtns && oldBtns.length > 1) {
  let kept = false;
  src = src.replace(oldBtnRegex, (m) => {
    if (!kept) { kept = true; return m; }
    return '';
  });
  log.push(`✅ حذف دکمه‌های اضافی: ${oldBtns.length - 1}`);
}

// ─── حذف رندرهای تکراری BarcodeScanner ───
const renderRegex = /\{showScanner && \([\s\S]*?<BarcodeScanner[\s\S]*?\/>\s*\)\}/g;
const renders = src.match(renderRegex);
if (renders && renders.length > 1) {
  let kept = false;
  src = src.replace(renderRegex, (m) => {
    if (!kept) { kept = true; return m; }
    return '';
  });
  log.push(`✅ حذف رندرهای تکراری: ${renders.length - 1}`);
}

writeFileSync(file, src);

// شمارش نهایی
const finalCount = (src.match(/setShowScanner\(true\)/g) || []).length;
log.push(`📊 تعداد نهایی setShowScanner(true): ${finalCount}`);

console.log(log.join('\n'));
