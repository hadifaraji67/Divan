import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/backup/filesystem.ts';
let src = readFileSync(file, 'utf8');
const log = [];

// افزودن path اختیاری به interface
if (src.includes('export interface StoredBackup {') && !src.includes('path?: string')) {
  src = src.replace(
    /export interface StoredBackup \{[\s\S]*?\}/,
    `export interface StoredBackup {
  name: string;
  uri: string;
  size: number;
  mtime: number;
  path?: string;
}`
  );
  log.push('✅ path? به StoredBackup اضافه شد');
}

// در listBackups — افزودن path
src = src.replace(
  /result\.push\(\{[\s\S]*?mtime: f\.mtime \|\| 0,[\s\S]*?\}\);/,
  `result.push({
          name: f.name,
          uri,
          size: f.size || 0,
          mtime: f.mtime || 0,
          path: DIR_NAME[dir] || String(dir),
        });`
);

// اطمینان
if (src.includes('DIR_NAME[dir]')) {
  log.push('✅ path در push اضافه شد');
}

writeFileSync(file, src);
console.log(log.join('\n'));
