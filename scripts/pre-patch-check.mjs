/**
 * چک قبل از patch — جلوگیری از import تکراری
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const SRC_DIR = 'src';

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) walk(full, files);
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) files.push(full);
  }
  return files;
}

console.log('🔍 بررسی importهای تکراری...\n');

let issues = 0;

const files = walk(SRC_DIR);

for (const file of files) {
  const src = readFileSync(file, 'utf8');

  const lucideRegex = /import \{([^}]*)\} from ['"]lucide-react['"];/g;
  const imports = [];
  let match;

  while ((match = lucideRegex.exec(src)) !== null) {
    imports.push(match[1].split(',').map((s) => s.trim()).filter(Boolean));
  }

  if (imports.length > 1) {
    const allIcons = imports.flat();
    const dupes = allIcons.filter((icon, i) => allIcons.indexOf(icon) !== i);
    const uniques = [...new Set(dupes)];

    if (uniques.length > 0) {
      console.log(`❌ ${file}`);
      console.log(`   ${imports.length} import، تکراری: ${uniques.join(', ')}`);
      issues++;
    }
  }
}

if (issues === 0) {
  console.log('✅ هیچ import تکراری نیست');
  process.exit(0);
} else {
  console.log(`\n⚠️  ${issues} فایل مشکل دارد`);
  console.log('');
  console.log('برای fix:');
  console.log('  node scripts/fix-dup-imports.mjs');
  process.exit(1);
}
