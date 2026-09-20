import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes("from '../../lib/export'")) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { exportToCSV } from '../../lib/export';\nimport { Download } from 'lucide-react';"
  );
  log.push('✅ import');
}

// افزودن تابع
if (!src.includes('handleExport')) {
  const before = "  const lowStock = items.filter(p => p.stock <= p.minStock).length;";
  const after = `  const handleExport = async () => {
    await exportToCSV('کالاها', filtered, [
      { key: 'sku', label: 'کد' },
      { key: 'barcode', label: 'بارکد' },
      { key: 'name', label: 'نام کالا' },
      { key: 'category', label: 'دسته' },
      { key: 'brand', label: 'برند' },
      { key: 'unit', label: 'واحد' },
      { key: 'stock', label: 'موجودی' },
      { key: 'minStock', label: 'حد بحرانی' },
      { key: 'buyPrice', label: 'قیمت خرید' },
      { key: 'sellPrice', label: 'قیمت فروش' },
      { key: 'wholesalePrice', label: 'عمده' },
      { key: 'taxPercent', label: 'مالیات %' },
      { key: 'location', label: 'محل' },
      { key: 'warehouseName', label: 'انبار' },
    ]);
  };

  const lowStock = items.filter(p => p.stock <= p.minStock).length;`;

  if (src.includes(before)) {
    src = src.replace(before, after);
    log.push('✅ handleExport');
  }
}

// افزودن دکمه
if (!src.includes('onClick={handleExport}')) {
  const before = `<button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">`;
  const after = `<button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
            <Download className="w-4 h-4" />
            خروجی Excel
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg">`;

  if (src.includes(before)) {
    src = src.replace(before, after);
    log.push('✅ دکمه Export');
  }
}

writeFileSync(file, src);
console.log(log.join('\n') || '⏭ تغییری نبود');
