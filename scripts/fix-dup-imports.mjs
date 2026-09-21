import { readFileSync, writeFileSync, existsSync } from 'node:fs';

function fixFile(file) {
  if (!existsSync(file)) return false;
  let src = readFileSync(file, 'utf8');
  const original = src;

  // ─── پیدا کردن همه import های lucide-react ───
  const lucideRegex = /import \{([^}]*)\} from ['"]lucide-react['"];\s*\n/g;
  const allImports = [];
  let match;

  while ((match = lucideRegex.exec(src)) !== null) {
    allImports.push({
      fullMatch: match[0],
      icons: match[1].split(',').map(s => s.trim()).filter(Boolean),
    });
  }

  if (allImports.length <= 1) {
    return false; // فقط یک import، مشکلی نیست
  }

  console.log(`  پیدا شد: ${allImports.length} import lucide-react`);

  // ─── ادغام همه ───
  const allIcons = new Set();
  for (const imp of allImports) {
    for (const icon of imp.icons) {
      allIcons.add(icon);
    }
  }

  const mergedIcons = [...allIcons].sort();
  const mergedImport = `import { ${mergedIcons.join(', ')} } from 'lucide-react';\n`;

  // ─── حذف همه importهای lucide-react ───
  src = src.replace(lucideRegex, '');

  // ─── اضافه کردن import ادغام‌شده در ابتدای فایل ───
  // اگر قبلاً import react هست، بعدش
  const reactImportMatch = src.match(/^import React[^;]*;\s*\n/m);
  if (reactImportMatch) {
    src = src.replace(reactImportMatch[0], reactImportMatch[0] + mergedImport);
  } else {
    src = mergedImport + src;
  }

  if (src !== original) {
    writeFileSync(file, src);
    console.log(`  ✅ ${file} — ${allImports.length} import ادغام شد`);
    return true;
  }
  return false;
}

// اجرا روی همه ماژول‌ها
const files = [
  'src/components/modules/ContactsModule.tsx',
  'src/components/modules/ProductsModule.tsx',
  'src/components/modules/InvoicesModule.tsx',
  'src/components/modules/PaymentsModule.tsx',
  'src/components/modules/ChequesModule.tsx',
  'src/components/modules/InstallmentsModule.tsx',
  'src/components/modules/CashBox.tsx',
  'src/components/modules/DashboardModule.tsx',
];

let fixed = 0;
for (const f of files) {
  if (fixFile(f)) fixed++;
}

console.log('');
console.log(`🎉 ${fixed} فایل fix شد`);
