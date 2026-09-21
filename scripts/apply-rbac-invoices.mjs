import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/InvoicesModule.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('RBACGate')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
const importAnchor = src.match(/^import .* from ['"]lucide-react['"];$/m);
if (importAnchor) {
  src = src.replace(
    importAnchor[0],
    importAnchor[0] + "\nimport { RBACGate } from '../shared/RBACGate';"
  );
}

// دکمه حذف فاکتور
src = src.replace(
  /(<button[^>]*onClick=\{[^}]*handleDelete[^}]*\}[^>]*>[\s\S]*?<\/button>)/,
  `<RBACGate permission="invoice.delete">$1</RBACGate>`
);

writeFileSync(file, src);
console.log('✅ RBACGate در Invoices');
