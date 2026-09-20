import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('BarcodeScanner')) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { BarcodeScanner } from '../shared/BarcodeScanner';\nimport { Camera } from 'lucide-react';"
  );
  log.push('✅ import');
}

// state
if (!src.includes('showScanner')) {
  src = src.replace(
    "const [editing, setEditing] = useState<Product>(empty());",
    "const [editing, setEditing] = useState<Product>(empty());\n  const [showScanner, setShowScanner] = useState(false);"
  );
  log.push('✅ state');
}

// جایگزینی input بارکد
const oldInput = `<input value={editing.barcode || ''} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })}`;
if (src.includes(oldInput)) {
  const startIdx = src.indexOf(oldInput);
  const endIdx = src.indexOf('/>', startIdx) + 2;
  const newInput = `<div className="flex gap-2">
                  <input value={editing.barcode || ''} onChange={(e) => setEditing({ ...editing, barcode: e.target.value })}
                    className="flex-1 p-2 border rounded-lg text-sm font-mono" dir="ltr" placeholder="مثلاً: 6260123456789" />
                  <button type="button" onClick={() => setShowScanner(true)}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 text-xs font-bold whitespace-nowrap">
                    <Camera className="w-4 h-4" /> اسکن
                  </button>
                </div>`;
  src = src.slice(0, startIdx) + newInput + src.slice(endIdx);
  log.push('✅ دکمه اسکن');
}

// رندر scanner
if (!src.includes('<BarcodeScanner')) {
  const pattern = /(return \(\s*<div className="space-y-4" dir="rtl">)/;
  if (pattern.test(src)) {
    src = src.replace(pattern, `$1
      {showScanner && (
        <BarcodeScanner
          onDetected={(code) => {
            setEditing({ ...editing, barcode: code });
            setShowScanner(false);
            notify.success('بارکد اسکن شد: ' + code);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}`);
    log.push('✅ رندر');
  }
}

writeFileSync(file, src);
console.log(log.join('\n'));
