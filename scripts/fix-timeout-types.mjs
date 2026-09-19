import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/backup/filesystem.ts';
let src = readFileSync(file, 'utf8');

// جایگزینی withTimeout با نسخه درست type-safe
const before = `/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(\`timeout: \${name}\`)), ms)),
  ]);
}`;

const after = `/** wrapper با timeout برای جلوگیری از hang */
function withTimeout<T>(p: Promise<T>, ms: number, name: string): Promise<T> {
  return Promise.race<T>([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(\`timeout: \${name}\`)), ms)
    ),
  ]);
}`;

if (src.includes(before)) {
  src = src.replace(before, after);
  console.log('✅ withTimeout اصلاح شد');
} else {
  console.log('❌ withTimeout پیدا نشد');
  process.exit(1);
}

writeFileSync(file, src);
