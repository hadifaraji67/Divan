import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/components/modules/DashboardModule.tsx';
let src = readFileSync(file, 'utf8');

if (src.includes("from '../../lib/jalali'")) {
  console.log('⏭ import قبلاً هست');
  process.exit(0);
}

const anchor = "import { roundRial } from '../../types/models';";
const newImport = anchor + "\nimport { formatJalaliLong, todayJalali } from '../../lib/jalali';";

if (src.includes(anchor)) {
  src = src.replace(anchor, newImport);
  writeFileSync(file, src);
  console.log('✅ import اضافه شد');
} else {
  console.log('❌ anchor پیدا نشد');
  process.exit(1);
}
