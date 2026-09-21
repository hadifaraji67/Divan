import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('<RBACGate')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

// چک import
if (!src.includes("import { RBACGate }")) {
  // پیدا کردن آخرین import
  const imports = src.match(/^import[\s\S]*?;$/gm);
  if (imports && imports.length > 0) {
    const last = imports[imports.length - 1];
    src = src.replace(last, last + "\nimport { RBACGate } from '../shared/RBACGate';");
  }
}

// ─── روش درست: `{...}` در یک خط ───
// دکمه حذف
src = src.replace(
  /<button onClick=\{\(\) => remove\(p\.id\)\}([\s\S]*?)<\/button>/,
  '<RBACGate permission="product.delete">{<button onClick={() => remove(p.id)}$1</button>}</RBACGate>'
);

// دکمه افزودن
src = src.replace(
  /<button onClick=\{openNew\}([\s\S]*?)<\/button>/,
  '<RBACGate permission="product.create">{<button onClick={openNew}$1</button>}</RBACGate>'
);

writeFileSync(file, src);
console.log('✅ RBACGate در Products (روش درست)');
