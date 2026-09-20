import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/InvoicesModule.tsx';
let src = readFileSync(file, 'utf8');

// پیدا کردن نام state اصلی
grepMatch();

function grepMatch() {
  // state invoices احتمالاً
}

// جایگزینی items
src = src.replace(
  /await exportToCSV\('فاکتورها', filtered \|\| items,/g,
  "await exportToCSV('فاکتورها', filtered || invoices,"
);

// format به string
src = src.replace(
  "{ key: 'items', label: 'تعداد اقلام', format: (v) => Array.isArray(v) ? v.length : 0 },",
  "{ key: 'items', label: 'تعداد اقلام', format: (v) => String(Array.isArray(v) ? v.length : 0) },"
);

src = src.replace(
  "{ key: 'total', label: 'مبلغ کل', format: (v, row) => invoiceTotal(row.items || [], row.discountPercent || 0, row.taxPercent || 0, row.shippingCost || 0) },",
  "{ key: 'total', label: 'مبلغ کل', format: (_v, row) => String(Math.round(invoiceTotal(row.items || [], row.discountPercent || 0, row.taxPercent || 0, row.shippingCost || 0))) },"
);

writeFileSync(file, src);
console.log('✅ InvoicesModule');
