import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

const before = "const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;";
const after = "const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=100`;";

if (src.includes(before)) {
  src = src.replace(before, after);
  writeFileSync(file, src);
  console.log('✅ API برای دریافت همه release ها (شامل beta) اصلاح شد');
} else {
  console.log('⏭ خط API قبلاً تغییر کرده یا یافت نشد');
}
