import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('BarcodeScanner')) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { BarcodeScanner } from '../shared/BarcodeScanner';\nimport { Camera, Download } from 'lucide-react';\nimport { exportToCSV } from '../../lib/export';"
  );
  log.push('✅ import');
}

// state
if (!src.includes('showScanner')) {
  const m = src.match(/const \[editing, setEditing\] = useState<Product>\(empty\(\)\);/);
  if (m) {
    src = src.replace(m[0], m[0] + "\n  const [showScanner, setShowScanner] = useState(false);");
    log.push('✅ state');
  }
}

// handleExport
if (!src.includes('handleExport')) {
  const m = src.match(/(const lowStock = items\.filter[^\n]+\n)/);
  if (m) {
    src = src.replace(m[1], m[1] + `
  const handleExport = async () => {
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
    ]);
  };
`);
    log.push('✅ handleExport');
  }
}

// دکمه Export — قبل از دکمه جدید
if (!src.includes('onClick={handleExport}')) {
  const m = src.match(/(<button onClick={openNew}[^>]*>)/);
  if (m) {
    src = src.replace(m[1], `<button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
            <Download className="w-4 h-4" /> خروجی Excel
          </button>
          ${m[1]}`);
    log.push('✅ دکمه Export');
  }
}

// input بارکد — پیدا کردن دقیق
if (!src.includes('showScanner(true)')) {
  // پیدا کردن input بارکد
  const inputRegex = /(<input[^>]*value={editing\.barcode[^>]*\/>)/;
  const m = src.match(inputRegex);
  if (m) {
    const replacement = `<div className="flex gap-2">
                  ${m[1]}
                  <button type="button" onClick={() => setShowScanner(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-xs font-bold">
                    <Camera className="w-4 h-4" /> اسکن
                  </button>
                </div>`;
    src = src.replace(m[1], replacement);
    log.push('✅ input + دکمه اسکن');
  } else {
    log.push('❌ input بارکد پیدا نشد');
  }
}

// رندر BarcodeScanner
if (!src.includes('<BarcodeScanner')) {
  const m = src.match(/(return \(\s*<div className="space-y-4" dir="rtl">)/);
  if (m) {
    src = src.replace(m[1], m[1] + `
      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => {
            setEditing({ ...editing, barcode: code });
            setShowScanner(false);
            notify.success('بارکد: ' + code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}`);
    log.push('✅ رندر BarcodeScanner');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
