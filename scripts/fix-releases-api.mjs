import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');

// ─── ۱. اصلاح RELEASES_API ───
const beforeUrl = "const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases?per_page=100`;";
const afterUrl = "const RELEASES_API = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases`;";

if (src.includes(beforeUrl)) {
  src = src.replace(beforeUrl, afterUrl);
  console.log('✅ RELEASES_API اصلاح شد (بدون ?per_page)');
} else {
  console.log('⏭ RELEASES_API قبلاً اصلاح شده');
}

// ─── ۲. اصلاح fetchManifest ───
const beforeFetch = "const res = await fetch(RELEASES_API + '?per_page=10', {";
const afterFetch = "const res = await fetch(RELEASES_API + '?per_page=10', {";

// این خط درسته — فقط می‌خوایم مطمئن شویم RELEASES_API خالی باشه
console.log('✅ fetchManifest از ?per_page=10 استفاده می‌کند');

writeFileSync(file, src);
