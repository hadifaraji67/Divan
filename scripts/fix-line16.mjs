import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/components/setup/BackupDiscoveryScreen.tsx';
let src = readFileSync(file, 'utf8');

// جایگزینی خط خراب
src = src.replace(
  /const \[backups, setBackups\] = useState<StoredBackup\[\]>\(\[\]\)\(\[\]\);/,
  'const [backups, setBackups] = useState<StoredBackup[]>([]);'
);

writeFileSync(file, src);
console.log('✅ خط ۱۶ fix شد');
