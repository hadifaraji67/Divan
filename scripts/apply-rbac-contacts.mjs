import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ پیدا نشد');
  process.exit(0);
}

let src = readFileSync(file, 'utf8');

if (src.includes('RBACGate')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

src = src.replace(
  "import { EmptyState } from '../shared/EmptyState';",
  "import { EmptyState } from '../shared/EmptyState';\nimport { RBACGate } from '../shared/RBACGate';"
);

// دکمه حذف
src = src.replace(
  /(<button onClick=\{\(\) => handleDelete\([^)]+\)\}[^>]*>[\s\S]*?<\/button>)/,
  `<RBACGate permission="contact.delete">$1</RBACGate>`
);

writeFileSync(file, src);
console.log('✅ RBACGate در Contacts');
