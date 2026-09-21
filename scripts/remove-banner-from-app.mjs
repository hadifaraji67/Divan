import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/App.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// حذف import
src = src.replace(
  /import \{ UpdateBanner \} from '\.\/components\/shared\/UpdateBanner';\s*\n/g,
  ''
);
log.push('✅ import حذف شد');

// حذف رندر
src = src.replace(
  /\s*<UpdateBanner\s*\/>\s*\n/g,
  '\n'
);
log.push('✅ رندر حذف شد');

writeFileSync(file, src);
console.log(log.join('\n'));
