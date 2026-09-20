import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/invoice-share.ts';
let src = readFileSync(file, 'utf8');

// formatNum از theme-context می‌آید نه format
src = src.replace(
  "import { formatNum } from './format';",
  "import { formatNum } from './theme-context';"
);

writeFileSync(file, src);
console.log('✅ invoice-share.ts — formatNum اصلاح شد');
