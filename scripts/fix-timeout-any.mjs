import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/backup/filesystem.ts';
let src = readFileSync(file, 'utf8');

// جایگزینی withTimeout با نسخه any (ساده‌تر)
const before = `/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race<T>([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(\`timeout: \${name}\`)), ms)
    ),
  ]);
}`;

const after = `/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<any> {
  return Promise.race([
    p as Promise<any>,
    new Promise<any>((_, reject) =>
      setTimeout(() => reject(new Error(\`timeout: \${name}\`)), ms)
    ),
  ]);
}`;

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ withTimeout با any اصلاح شد');
} else {
  console.log('❌ withTimeout پیدا نشد');
  process.exit(1);
}
