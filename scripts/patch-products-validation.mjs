import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ProductsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');
const log = [];

if (src.includes('isValidAmount')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

if (!src.includes('lib/validation')) {
  if (src.includes("import { notify } from '../../lib/toast';")) {
    src = src.replace(
      "import { notify } from '../../lib/toast';",
      "import { notify } from '../../lib/toast';\nimport { isValidAmount } from '../../lib/validation';"
    );
    log.push('  ✅ import');
  }
}

const saveRegex = /const save\s*=\s*\(\)\s*=>\s*\{[\s\S]*?\n\s*\};/;
const match = src.match(saveRegex);

if (match) {
  const newSave = `const save = () => {
    // اعتبارسنجی
    if (!editing.name?.trim()) {
      notify.warning('نام کالا الزامی است');
      return;
    }
    if (!isValidAmount(editing.buyPrice, true)) {
      notify.warning('قیمت خرید نامعتبر');
      return;
    }
    if (!isValidAmount(editing.sellPrice, true)) {
      notify.warning('قیمت فروش نامعتبر');
      return;
    }
    if (editing.stock < 0) {
      notify.warning('موجودی نمی‌تواند منفی باشد');
      return;
    }
    if (editing.minStock < 0) {
      notify.warning('حد بحرانی نمی‌تواند منفی باشد');
      return;
    }
    if (editing.taxPercent < 0 || editing.taxPercent > 100) {
      notify.warning('درصد مالیات باید بین ۰ تا ۱۰۰ باشد');
      return;
    }
    setItems(prev => prev.find(p => p.id === editing.id)
      ? prev.map(p => p.id === editing.id ? editing : p)
      : [...prev, editing]);
    setShowForm(false);
  };`;
  src = src.replace(match[0], newSave);
  log.push('  ✅ save با اعتبارسنجی');
} else {
  log.push('  ❌ save پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
