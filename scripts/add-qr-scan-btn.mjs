import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// ─── اول چک کن ساختار InvoicesModule ───
const file = 'src/components/modules/InvoicesModule.tsx';

if (!existsSync(file)) {
  console.log('❌ InvoicesModule پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('InvoiceQRScanner')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// ─── import ───
if (!src.includes("from '../print/InvoiceQRScanner'")) {
  const importAnchor = src.match(/^import .* from ['"]lucide-react['"];$/m);
  if (importAnchor) {
    src = src.replace(
      importAnchor[0],
      importAnchor[0] + "\nimport { InvoiceQRScanner } from '../print/InvoiceQRScanner';"
    );
    log.push('✅ import InvoiceQRScanner');
  }
}

// ─── QrCode icon ───
const lucideImport = src.match(/import \{([^}]*)\} from ['"]lucide-react['"];/);
if (lucideImport && !lucideImport[1].includes('QrCode')) {
  const content = lucideImport[1].trim();
  src = src.replace(
    lucideImport[0],
    `import {${content}, QrCode } from 'lucide-react';`
  );
  log.push('✅ QrCode icon');
}

// ─── state ───
const stateRegex = /const \[showImport, setShowImport\] = useState\(false\);/;
const stateRegex2 = /const \[showForm, setShowForm\] = useState\(false\);/;

if (stateRegex.test(src)) {
  src = src.replace(
    stateRegex,
    `const [showImport, setShowImport] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);`
  );
  log.push('✅ state (بعد از showImport)');
} else if (stateRegex2.test(src)) {
  src = src.replace(
    stateRegex2,
    `const [showForm, setShowForm] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);`
  );
  log.push('✅ state (بعد از showForm)');
}

// ─── دکمه QR — قبل از «فاکتور جدید» ───
const newBtnRegex = /(<button onClick=\{openNew\}[^>]*>)/;
if (newBtnRegex.test(src) && !src.includes('setShowQRScan(true)')) {
  src = src.replace(
    newBtnRegex,
    `<button onClick={() => setShowQRScan(true)} className="flex items-center gap-2 px-3 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg">
            <QrCode className="w-4 h-4" /> تأیید QR
          </button>
          $1`
  );
  log.push('✅ دکمه QR');
}

// ─── رندر InvoiceQRScanner ───
const returnRegex = /(return \(\s*<div className="space-y-4" dir="rtl">)/;
if (returnRegex.test(src) && !src.includes('<InvoiceQRScanner')) {
  src = src.replace(
    returnRegex,
    `$1
      {showQRScan && (
        <InvoiceQRScanner onClose={() => setShowQRScan(false)} />
      )}`
  );
  log.push('✅ رندر InvoiceQRScanner');
}

writeFileSync(file, src);
console.log(log.join('\n'));
