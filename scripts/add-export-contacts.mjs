import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/modules/ContactsModule.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

if (!src.includes("from '../../lib/export'")) {
  const p = "import { notify } from '../../lib/toast';";
  if (src.includes(p)) {
    src = src.replace(p, p + "\nimport { exportToCSV } from '../../lib/export';\nimport { Download } from 'lucide-react';");
    log.push('✅ import');
  }
}

if (!src.includes('handleExportContacts')) {
  const match = src.match(/(\n\s*return \(\s*<div)/);
  if (match && match.index) {
    const insertion = `
  const handleExportContacts = async () => {
    await exportToCSV('مشتریان', filtered || items, [
      { key: 'name', label: 'نام' },
      { key: 'phone', label: 'تلفن' },
      { key: 'mobile', label: 'موبایل' },
      { key: 'email', label: 'ایمیل' },
      { key: 'address', label: 'آدرس' },
      { key: 'type', label: 'نوع' },
      { key: 'balance', label: 'مانده' },
    ]);
  };
`;
    src = src.slice(0, match.index) + insertion + src.slice(match.index);
    log.push('✅ handleExportContacts');
  }
}

if (!src.includes('onClick={handleExportContacts}')) {
  const match = src.match(/(<button[^>]*onClick={openNew}[^>]*>[\s\S]*?<\/button>)/);
  if (match) {
    const btn = `<button onClick={handleExportContacts} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg">
            <Download className="w-4 h-4" /> خروجی Excel
          </button>
          ${match[1]}`;
    src = src.replace(match[1], btn);
    log.push('✅ دکمه Export');
  }
}

writeFileSync(file, src);
console.log(log.join('\n') || '⏭ تغییری نبود');
