import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/setup/BackupDiscoveryScreen.tsx';
let src = readFileSync(file, 'utf8');
const log = [];

// حذف interface FoundBackup (چون از StoredBackup استفاده می‌کنیم)
src = src.replace(
  /interface FoundBackup \{[\s\S]*?\}\s*\n/,
  ''
);

// import StoredBackup
if (!src.includes('StoredBackup')) {
  src = src.replace(
    "import { listBackups, readBackupFile } from '../../lib/backup/filesystem';",
    "import { listBackups, readBackupFile, type StoredBackup } from '../../lib/backup/filesystem';"
  );
}

// جایگزینی FoundBackup[] با StoredBackup[]
src = src.replace(/FoundBackup\[\]/g, 'StoredBackup[]');
src = src.replace(/useState<StoredBackup\[\]>/g, 'useState<StoredBackup[]>([])');

// جایگزینی FoundBackup در پارامترها
src = src.replace(/backup:\s*FoundBackup/g, 'backup: StoredBackup');
src = src.replace(/\bFoundBackup\b/g, 'StoredBackup');

// fix push دستی — چون path اجباری بود
src = src.replace(
  /found\.push\(\{[\s\S]*?path: 'Documents',[\s\S]*?\}\);/,
  `found.push({
                  name: f.name,
                  uri: uriR.uri,
                  size: f.size || 0,
                  mtime: f.mtime || 0,
                  path: 'Documents',
                });`
);

writeFileSync(file, src);
console.log('✅ BackupDiscoveryScreen fix شد');
