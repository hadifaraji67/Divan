import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ContactsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

if (src.includes('ContactsFormAccordion')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// import
if (!src.includes('ContactsFormAccordion')) {
  src = src.replace(
    "import { EmptyState } from '../shared/EmptyState';",
    "import { EmptyState } from '../shared/EmptyState';\nimport { ContactsFormAccordion } from './ContactsFormAccordion';"
  );
  log.push('✅ import');
}

// پیدا کردن فرم
const formRegex = /(<div className="[^"]*space-y-3[^"]*">)([\s\S]*?)(<div className="flex gap-2 justify-end[^"]*">)/;

const match = src.match(formRegex);

if (match) {
  src = src.replace(
    match[0],
    `${match[1]}

                  <ContactsFormAccordion editing={editing} setEditing={setEditing} />

                ${match[3]}`
  );
  log.push('✅ فرم با Accordion جایگزین شد');
} else {
  log.push('⚠️ الگوی فرم پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
