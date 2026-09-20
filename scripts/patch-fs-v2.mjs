import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/backup/filesystem.ts';
let src = readFileSync(file, 'utf8');

if (!src.includes("from '../error-logger'")) {
  src = "import { logError, logWarn } from '../error-logger';\n\n" + src;
}

src = src.replace(/console\.error\('\[FS\] saveToDevice error:', err\);/g, "logError('backup', 'saveToDevice', { filename }, err);");
src = src.replace(/console\.error\('\[FS\] external failed[^;]+;/g, "logWarn('backup', 'Directory.External fail');");
src = src.replace(/console\.error\('\[FS\] read error:', err\);/g, "logError('backup', 'read fail', {}, err);");
src = src.replace(/console\.error\('\[FS\] readBackupFile error:', err\);/g, "logError('backup', 'readBackupFile', { filename }, err);");
src = src.replace(/console\.error\('\[FS\] list error:', err\);/g, "logError('backup', 'list', {}, err);");
src = src.replace(/console\.error\('\[FS\] delete error:', err\);/g, "logError('backup', 'delete', { path }, err);");

writeFileSync(file, src);
console.log('✅ filesystem logging');
