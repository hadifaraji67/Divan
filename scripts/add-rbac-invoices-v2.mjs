import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/InvoicesModule.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('<RBACGate')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// import
if (!src.includes("import { RBACGate }")) {
  const imports = src.match(/^import[\s\S]*?;$/gm);
  if (imports && imports.length > 0) {
    const last = imports[imports.length - 1];
    src = src.replace(last, last + "\nimport { RBACGate } from '../shared/RBACGate';");
  }
}

// دکمه حذف/void
src = src.replace(
  /<button[^>]*onClick=\{\(\) => setVoidTarget\([^)]+\)\}([\s\S]*?)<\/button>/,
  '<RBACGate permission="invoice.void">{<button onClick={() => setVoidTarget(inv)}$1</button>}</RBACGate>'
);

writeFileSync(file, src);
console.log('✅ RBACGate در Invoices');
