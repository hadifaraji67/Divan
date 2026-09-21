import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/settings/BackupSettings.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// import
if (!src.includes('share-helper')) {
  src = src.replace(
    "import { notify } from '../../lib/toast';",
    "import { notify } from '../../lib/toast';\nimport { shareBackupFile } from '../../lib/backup/share-helper';"
  );
  log.push('✅ import shareBackupFile');
}

// جایگزینی handleShare
const oldShareRegex = /const handleShare\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\n\s*\};/;
const match = src.match(oldShareRegex);

if (match && !src.includes('shareBackupFile(backup.uri')) {
  const newShare = `const handleShare = async (backup: StoredBackup) => {
    setBusy(true);
    try {
      const ok = await shareBackupFile(backup.uri, backup.name);
      if (!ok) notify.error('اشتراک‌گذاری ناموفق');
    } catch (err: any) {
      notify.error(err?.message || 'خطا');
    } finally {
      setBusy(false);
    }
  };`;

  src = src.replace(match[0], newShare);
  log.push('✅ handleShare جدید');
}

writeFileSync(file, src);
console.log(log.join('\n'));
