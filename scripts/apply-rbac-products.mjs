import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ProductsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ProductsModule پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('RBACGate')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// import
src = src.replace(
  "import { EmptyState } from '../shared/EmptyState';",
  "import { EmptyState } from '../shared/EmptyState';\nimport { RBACGate } from '../shared/RBACGate';"
);

// دکمه حذف — محافظت
src = src.replace(
  /(<button onClick=\{\(\) => remove\(p\.id\)\}[^>]*>[\s\S]*?<\/button>)/,
  `<RBACGate permission="product.delete">
                        $1
                      </RBACGate>`
);

// دکمه افزودن کالا
src = src.replace(
  /(<button onClick=\{openNew\}[^>]*>)/,
  `<RBACGate permission="product.create">$1`
);
src = src.replace(
  /(<\/button>[\s\S]{0,100}?افزودن کالا)/,
  `$1</RBACGate>`
);

log.push('✅ RBACGate اعمال شد');
writeFileSync(file, src);
console.log(log.join('\n'));
