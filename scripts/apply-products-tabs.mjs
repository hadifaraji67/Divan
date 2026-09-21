import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ProductsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

if (src.includes('ProductsFormTabs')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// ─── import ───
if (!src.includes('ProductsFormTabs')) {
  src = src.replace(
    "import { EmptyState } from '../shared/EmptyState';",
    "import { EmptyState } from '../shared/EmptyState';\nimport { ProductsFormTabs } from './ProductsFormTabs';"
  );
  log.push('✅ import ProductsFormTabs');
}

// ─── پیدا کردن بلوک فرم (بین `showForm && (` و `</div>` بستن modal) ───
// الگو: <div className="grid grid-cols-2 ..."> ... </div>  — پر از فیلدها

// روش امن: پیدا کردن اولین `<label>` تا آخرین `</label>` در modal
const formStartRegex = /(\{showForm && \([\s\S]*?<div className="[^"]*space-y-3[^"]*">)/;
const formStartMatch = src.match(formStartRegex);

if (!formStartMatch) {
  console.log('❌ محل فرم پیدا نشد');
  process.exit(1);
}

// پیدا کردن موقعیت شروع فیلدهای فرم
const startIdx = src.indexOf(formStartMatch[1]) + formStartMatch[1].length;

// پیدا کردن "دکمه ذخیره" — انتهای فرم
const saveBtnRegex = /(<div className="flex gap-2 justify-end[^"]*">[\s\S]*?ذخیره[\s\S]*?<\/div>)/;
const saveBtnMatch = src.match(saveBtnRegex);

if (!saveBtnMatch) {
  console.log('❌ دکمه ذخیره پیدا نشد');
  process.exit(1);
}

const endIdx = src.indexOf(saveBtnMatch[1]);

if (endIdx <= startIdx) {
  console.log('❌ محدوده فرم نامعتبر');
  process.exit(1);
}

// حذف فیلدهای قدیمی و جایگزینی با ProductsFormTabs
const before = src.slice(0, startIdx);
const after = src.slice(endIdx);
const replacement = '\n\n                <ProductsFormTabs editing={editing} setEditing={setEditing} />\n\n              ';

src = before + replacement + after;

log.push('✅ فرم با ProductsFormTabs جایگزین شد');
writeFileSync(file, src);
console.log(log.join('\n'));
