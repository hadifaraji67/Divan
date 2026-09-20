import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';
let src = readFileSync(file, 'utf8');

// پیدا کردن نام state داده اصلی
const stateMatch = src.match(/useState<Contact\[\]>\(\[\]\)|useState<Contact\[\]>\(\)/);
console.log('State:', stateMatch ? 'ok' : 'not found');

// جایگزینی items با contacts یا هر نام دیگری
src = src.replace(
  /await exportToCSV\('مشتریان', filtered \|\| items,/g,
  "await exportToCSV('مشتریان', filtered || (typeof contacts !== 'undefined' ? contacts : []),"
);

writeFileSync(file, src);
console.log('✅ ContactsModule');
