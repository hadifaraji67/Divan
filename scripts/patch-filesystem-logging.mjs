import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/backup/filesystem.ts';
let src = readFileSync(file, 'utf8');

// import
if (!src.includes("from '../error-logger'")) {
  src = "import { logError, logWarn, logInfo } from '../error-logger';\n\n" + src;
}

// جایگزینی console.error ها
src = src.replace(
  /console\.error\('\[FS\] saveToDevice error:', err\);/g,
  "logError('backup', 'saveToDevice fail', { filename }, err);"
);
src = src.replace(
  /console\.error\('\[FS\] external failed, fallback to Data:', err\);/g,
  "logWarn('backup', 'Directory.External fail → fallback', { err: err?.message });"
);
src = src.replace(
  /console\.error\('\[FS\] read error:', err\);/g,
  "logError('backup', 'readFromDevice fail', {}, err);"
);
src = src.replace(
  /console\.error\('\[FS\] readBackupFile error:', err\);/g,
  "logError('backup', 'readBackupFile fail', { filename }, err);"
);
src = src.replace(
  /console\.error\('\[FS\] list error:', err\);/g,
  "logError('backup', 'listBackups fail', {}, err);"
);
src = src.replace(
  /console\.error\('\[FS\] delete error:', err\);/g,
  "logError('backup', 'deleteBackup fail', { path }, err);"
);
src = src.replace(
  /console\.warn\('\[FS\] failed dir', dir, ':', err\?\.message\);/g,
  "logWarn('backup', `dir failed: ${dir}`, { err: err?.message });"
);

writeFileSync(file, src);
console.log('✅ خطاها به logger وصل شد');
