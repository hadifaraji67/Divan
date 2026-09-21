import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';

if (!existsSync(file)) {
  console.log('❌ ContactsModule پیدا نشد');
  process.exit(1);
}

let src = readFileSync(file, 'utf8');

if (src.includes('ImportDialog')) {
  console.log('⏭ قبلاً اعمال شده');
  process.exit(0);
}

const log = [];

// import
src = src.replace(
  "import { useUndoableDelete } from '../../lib/use-undoable-delete';",
  "import { useUndoableDelete } from '../../lib/use-undoable-delete';\nimport { ImportDialog } from '../shared/ImportDialog';\nimport { CONTACT_COLUMNS } from '../../lib/import';\nimport { Upload } from 'lucide-react';"
);

// state
const stateRegex = /const \[showForm, setShowForm\] = useState\(false\);/;
if (stateRegex.test(src)) {
  src = src.replace(
    stateRegex,
    `const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);`
  );
  log.push('✅ state');
}

// دکمه import
const newBtnRegex = /(<button onClick=\{openNew\}[^>]*>)/;
if (newBtnRegex.test(src)) {
  src = src.replace(
    newBtnRegex,
    `<button onClick={() => setShowImport(true)} className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold rounded-lg">
            <Upload className="w-4 h-4" /> ورود از Excel
          </button>
          $1`
  );
  log.push('✅ دکمه import');
}

// رندر ImportDialog
const returnRegex = /(return \(\s*<div className="space-y-4" dir="rtl">)/;
if (returnRegex.test(src)) {
  src = src.replace(
    returnRegex,
    `$1
      {showImport && (
        <ImportDialog
          title="ورود مشتریان از Excel"
          columns={CONTACT_COLUMNS}
          templateName="divan-contacts-template.csv"
          onImported={(rows) => {
            setContacts(prev => {
              const existing = new Set(prev.map(c => c.id));
              const newItems = rows.map((r: any) => ({
                ...r,
                id: genId(),
                type: r.type || 'حقیقی',
                code: '',
                isActive: true,
                createdAt: new Date().toISOString(),
                balance: 0,
              })).filter((r: any) => !existing.has(r.id));
              return [...prev, ...newItems];
            });
            setShowImport(false);
          }}
          onClose={() => setShowImport(false)}
        />
      )}`
  );
  log.push('✅ رندر ImportDialog');
} else {
  log.push('⚠️ return پیدا نشد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
