import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/InvoicesModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes("from '../../lib/export'")) {
  // اضافه کردن import
  const importPatterns = [
    "import { notify } from '../../lib/toast';",
    "import { notify } from '@/lib/toast';",
  ];
  for (const p of importPatterns) {
    if (src.includes(p)) {
      src = src.replace(p, p + "\nimport { exportToCSV } from '../../lib/export';\nimport { Download } from 'lucide-react';");
      log.push('✅ import');
      break;
    }
  }
}

// تابع export
if (!src.includes('handleExportInvoices')) {
  // پیدا کردن آخرین useMemo یا آخرین const قبل از return
  const match = src.match(/(\n\s*return \(\s*<div)/);
  if (match && match.index) {
    const insertion = `
  const handleExportInvoices = async () => {
    const { invoiceTotal } = await import('../../types/models');
    await exportToCSV('فاکتورها', filtered || items, [
      { key: 'number', label: 'شماره' },
      { key: 'date', label: 'تاریخ' },
      { key: 'type', label: 'نوع' },
      { key: 'contactName', label: 'مشتری' },
      { key: 'items', label: 'تعداد اقلام', format: (v) => Array.isArray(v) ? v.length : 0 },
      { key: 'total', label: 'مبلغ کل', format: (v, row) => invoiceTotal(row.items || [], row.discountPercent || 0, row.taxPercent || 0, row.shippingCost || 0) },
      { key: 'status', label: 'وضعیت' },
    ]);
  };
`;
    src = src.slice(0, match.index) + insertion + src.slice(match.index);
    log.push('✅ handleExportInvoices');
  }
}

// دکمه — کنار دکمه «فاکتور جدید»
if (!src.includes('onClick={handleExportInvoices}')) {
  const before = /(<button[^>]*onClick={openNew}[^>]*>[\s\S]*?<\/button>)/;
  const match = src.match(before);
  if (match) {
    const btn = `<button onClick={handleExportInvoices} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
            <Download className="w-4 h-4" /> خروجی Excel
          </button>
          ${match[1]}`;
    src = src.replace(match[1], btn);
    log.push('✅ دکمه Export');
  }
}

writeFileSync(file, src);
console.log(log.join('\n') || '⏭ تغییری نبود');
