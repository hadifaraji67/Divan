#!/usr/bin/env node
// scripts/audit-v3.mjs — ممیزی هوشمند پروژه دیوان v3

import {
  readFileSync, readdirSync, statSync,
  existsSync, mkdirSync, writeFileSync,
} from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';

// ═══════════════ تنظیمات ═══════════════
const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const ENTRY_POINTS = new Set([
  'src/main.tsx',
  'src/routeTree.gen.ts',
  'src/router.tsx',
]);

const GENERATED = new Set(['src/routeTree.gen.ts']);

const SERVER_ONLY = [
  'pg', '@types/pg', 'nodemailer', '@types/nodemailer',
  'jose', 'better-auth', 'kysely', '@electric-sql/pglite',
  '@neondatabase/serverless',
];

const FORBIDDEN = ['@tanstack/react-start', 'nitro'];

// پکیج‌هایی که ممکن است در src استفاده نشوند ولی لازمند
const WHITELIST = [
  '@capacitor/android', '@capacitor/app', '@capacitor/core',
  '@capacitor/filesystem', '@capacitor/preferences', '@capacitor/share',
  '@capacitor/cli',
];

const DEV_ONLY = [
  'typescript', 'vite', 'eslint', 'prettier', 'tailwindcss',
  '@types/', '@vitejs/', 'lightningcss', 'globals', 'playwright',
];

const CONFIG_FILES = [
  'vite.config.ts',
  'capacitor.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
];

// ═══════════════ رنگ‌ها ═══════════════
const C = {
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m',
  magenta: '\x1b[35m', reset: '\x1b[0m',
};

const line = () => console.log('━'.repeat(55));
const header = (t) => { console.log(''); line(); console.log(`  ${C.bold}${t}${C.reset}`); line(); };
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');
const fileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

// ═══════════════ پیمایش ═══════════════
function walk(dir, files = [], skipDirs = new Set(['node_modules', '.git', 'dist', 'android', 'ios', '.trash'])) {
  if (!existsSync(dir)) return files;
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const e of entries) {
    if (skipDirs.has(e) || e.startsWith('.trash')) continue;
    const full = join(dir, e);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, files, skipDirs);
    else files.push(full);
  }
  return files;
}

const isCode = (p) => ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(p));

// ═══════════════ استخراج import ═══════════════
function extractImports(src) {
  const out = new Set();
  const patterns = [
    /(?:^|\s)import\s+(?:[\w*{},\s]+?\s+from\s+)?['"]([^'"]+)['"]/gm,
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/gm,
    /export\s+(?:[\w*{},\s]+?\s+)?from\s+['"]([^'"]+)['"]/gm,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/gm,
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(src)) !== null) out.add(m[1]);
  }
  return [...out];
}

// ═══════════════ resolve ═══════════════
function resolveImport(imp, fromFile) {
  if (!imp.startsWith('.') && !imp.startsWith('@/')) return null;
  const base = imp.startsWith('@/')
    ? join(SRC, imp.slice(2))
    : join(dirname(fromFile), imp);
  const candidates = [
    base, base + '.ts', base + '.tsx', base + '.js', base + '.jsx',
    join(base, 'index.ts'), join(base, 'index.tsx'), join(base, 'index.js'),
  ];
  for (const c of candidates) {
    try { if (existsSync(c) && statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

function pkgNameFrom(imp) {
  if (imp.startsWith('@')) return imp.split('/').slice(0, 2).join('/');
  return imp.split('/')[0];
}

// ═══════════════ چرخه‌ها ═══════════════
function findCycles(graph, files) {
  const cycles = [];
  const color = new Map(files.map((f) => [f, 0]));
  const stack = [];
  function dfs(n) {
    color.set(n, 1);
    stack.push(n);
    for (const next of graph.get(n) || []) {
      const c = color.get(next);
      if (c === 1) cycles.push(stack.slice(stack.indexOf(next)));
      else if (c === 0) dfs(next);
    }
    stack.pop();
    color.set(n, 2);
  }
  for (const f of files) if (color.get(f) === 0) dfs(f);
  return cycles;
}

// ═══════════════ تشخیص Console Logs ═══════════════
function countConsoleLogs(files) {
  const results = [];
  for (const f of files) {
    if (!isCode(f)) continue;
    let src = '';
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    const matches = src.match(/console\.(log|debug|info)\s*\(/g);
    if (matches && matches.length > 0) {
      results.push({ path: rel(f), count: matches.length });
    }
  }
  return results.sort((a, b) => b.count - a.count);
}

// ═══════════════ تشخیص TODO/FIXME ═══════════════
function countTodos(files) {
  const results = [];
  for (const f of files) {
    if (!isCode(f)) continue;
    let src = '';
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    const todos = src.match(/\/\/\s*(TODO|FIXME|HACK|XXX)/gi);
    const fixmes = src.match(/\b(TODO|FIXME|HACK|XXX)\b/g);
    const count = todos ? todos.length : 0;
    if (count > 0) {
      results.push({ path: rel(f), count });
    }
  }
  return results.sort((a, b) => b.count - a.count);
}

// ═══════════════ آنالیز Bundle ═══════════════
function analyzeBundle() {
  const distDir = join(ROOT, 'dist', 'assets');
  if (!existsSync(distDir)) return null;
  const files = [];
  try {
    for (const f of readdirSync(distDir)) {
      const full = join(distDir, f);
      const st = statSync(full);
      if (st.isFile() && f.endsWith('.js')) {
        files.push({ name: f, size: st.size });
      }
    }
  } catch {}
  return files.sort((a, b) => b.size - a.size);
}

// ═══════════════ آنالیز دیتابیس سرور ═══════════════
function checkServerFiles() {
  const results = { hasServer: false, hasEnv: false, hasConfig: false };
  if (existsSync(join(ROOT, 'server'))) {
    results.hasServer = true;
    results.hasEnv = existsSync(join(ROOT, 'server', '.env'));
    results.hasConfig = existsSync(join(ROOT, 'server', 'config.json'));
  }
  return results;
}

// ═══════════════ بررسی کش‌ها و state ═══════════════
function checkLocalStorageKeys(files) {
  const keys = new Map();
  const pattern = /localStorage\.(getItem|setItem|removeItem)\(['"]([^'"]+)['"]/g;
  for (const f of files) {
    if (!isCode(f)) continue;
    let src = '';
    try { src = readFileSync(f, 'utf8'); } catch { continue; }
    let m;
    while ((m = pattern.exec(src)) !== null) {
      const key = m[2];
      if (!keys.has(key)) keys.set(key, []);
      keys.get(key).push(rel(f));
    }
  }
  return [...keys.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

// ═══════════════ اجرای اصلی ═══════════════
const t0 = Date.now();
console.log(`${C.cyan}${C.bold}`);
console.log('═══════════════════════════════════════════════');
console.log('  ممیزی هوشمند پروژه دیوان (v3)');
console.log(`  تاریخ: ${new Date().toISOString()}`);
console.log('═══════════════════════════════════════════════');
console.log(C.reset);

// ─── پکیج ───
const pkg = (() => {
  try { return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')); }
  catch { return null; }
})();

console.log(`📦 نسخه: ${pkg?.version || '?'}`);
console.log(`📁 فایل‌های کد: `);

const allFiles = walk(SRC).filter(isCode);
console.log(`   کل: ${allFiles.length}`);

// ─── گراف ───
const imported = new Set();
const graph = new Map();
const broken = [];

for (const f of allFiles) {
  let src = '';
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  const list = [];
  for (const imp of extractImports(src)) {
    if (imp.startsWith('.') || imp.startsWith('@/')) {
      const target = resolveImport(imp, f);
      if (target) { imported.add(target); list.push(target); }
      else broken.push({ from: rel(f), to: imp });
    }
  }
  graph.set(f, list);
}

// ─── فایل‌های بلااستفاده ───
const unused = allFiles.filter((f) => {
  const r = rel(f);
  if (ENTRY_POINTS.has(r) || GENERATED.has(r)) return false;
  return !imported.has(f);
}).map(rel).sort();

// ─── پکیج‌های استفاده‌نشده ───
const used = new Set();
// ۱. اسکن src
for (const f of allFiles) {
  let src = '';
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  for (const imp of extractImports(src)) {
    if (!imp.startsWith('.') && !imp.startsWith('@/')) used.add(pkgNameFrom(imp));
  }
}
// ۲. اسکن config files
for (const cf of CONFIG_FILES) {
  const full = join(ROOT, cf);
  if (!existsSync(full)) continue;
  try {
    const src = readFileSync(full, 'utf8');
    for (const imp of extractImports(src)) {
      if (!imp.startsWith('.') && !imp.startsWith('@/')) used.add(pkgNameFrom(imp));
    }
  } catch {}
}
// ۳. اسکن scripts
const scriptFiles = existsSync(join(ROOT, 'scripts'))
  ? walk(join(ROOT, 'scripts')).filter(isCode)
  : [];
for (const f of scriptFiles) {
  let src = '';
  try { src = readFileSync(f, 'utf8'); } catch { continue; }
  for (const imp of extractImports(src)) {
    if (!imp.startsWith('.') && !imp.startsWith('@/')) used.add(pkgNameFrom(imp));
  }
}

const unusedPkgs = [];
const serverInSpa = [];
const forbiddenUsed = [];

if (pkg) {
  const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
  for (const name of Object.keys(allDeps)) {
    const isUsed = used.has(name);
    if (FORBIDDEN.some((p) => name === p || name.startsWith(p + '/'))) {
      if (isUsed) forbiddenUsed.push(name);
      else unusedPkgs.push({ name, reason: '🚫 TanStack Start' });
    } else if (SERVER_ONLY.includes(name)) {
      if (isUsed) serverInSpa.push(name);
      else unusedPkgs.push({ name, reason: '🖥 فقط سرور' });
    } else if (!isUsed && !DEV_ONLY.some((p) => name.startsWith(p))) {
      unusedPkgs.push({ name, reason: '📦 بدون استفاده' });
    }
  }
}

// ─── حجم فایل‌ها ───
const sizes = allFiles.map((f) => {
  let n = 0, bytes = 0;
  try {
    const content = readFileSync(f, 'utf8');
    n = content.split('\n').length;
    bytes = Buffer.byteLength(content, 'utf8');
  } catch {}
  return { p: rel(f), n, bytes };
}).sort((a, b) => b.n - a.n);

// ─── Console logs ───
const consoleLogs = countConsoleLogs(allFiles);

// ─── TODO/FIXME ───
const todos = countTodos(allFiles);

// ─── Bundle ───
const bundle = analyzeBundle();

// ─── سرور ───
const serverInfo = checkServerFiles();

// ─── localStorage keys ───
const lsKeys = checkLocalStorageKeys(allFiles);

// ═══════════════ چاپ نتایج ═══════════════

header('🗑  فایل‌های بلااستفاده');
if (unused.length === 0) {
  console.log(`   ${C.green}✅ هیچ فایل بلااستفاده‌ای نیست${C.reset}`);
} else {
  console.log(`   تعداد: ${C.bold}${unused.length}${C.reset}\n`);
  for (const f of unused) console.log(`   ${C.red}🗑${C.reset}  ${f}`);
}

header('📦  پکیج‌های مسئله‌دار');
if (!unusedPkgs.length && !serverInSpa.length && !forbiddenUsed.length) {
  console.log(`   ${C.green}✅ همه پکیج‌ها سالم${C.reset}`);
} else {
  for (const { name, reason } of unusedPkgs) {
    console.log(`   ${C.red}✗${C.reset}  ${name.padEnd(35)} ${C.gray}${reason}${C.reset}`);
  }
  for (const name of serverInSpa) {
    console.log(`   ${C.yellow}!${C.reset}  ${name.padEnd(35)} ${C.gray}سرور در SPA${C.reset}`);
  }
  for (const name of forbiddenUsed) {
    console.log(`   ${C.red}!!${C.reset} ${name.padEnd(35)} ${C.gray}TanStack Start${C.reset}`);
  }
}

header('✗  import های شکسته');
if (!broken.length) {
  console.log(`   ${C.green}✅ هیچ import شکسته‌ای نیست${C.reset}`);
} else {
  for (const b of broken) {
    console.log(`   ${C.red}✗${C.reset} ${b.from} ${C.gray}→ ${b.to}${C.reset}`);
  }
}

header('🔄  وابستگی دایره‌ای');
const cycles = findCycles(graph, allFiles);
if (!cycles.length) {
  console.log(`   ${C.green}✅ هیچ وابستگی دایره‌ای نیست${C.reset}`);
} else {
  for (const c of cycles.slice(0, 5)) {
    console.log(`   ${C.yellow}↻${C.reset} ${c.map(rel).join(' → ')}`);
  }
}

header('📈  بزرگ‌ترین فایل‌ها (top 10)');
for (const { p, n, bytes } of sizes.slice(0, 10)) {
  const mark = n > 500 ? '🔴' : n > 300 ? '🟡' : '  ';
  console.log(`   ${mark} ${String(n).padStart(4)} خط  ${C.gray}${fileSize(bytes).padStart(8)}${C.reset}  ${p}`);
}

header('🧹  console.log های باقی‌مانده');
if (consoleLogs.length === 0) {
  console.log(`   ${C.green}✅ هیچ console.log اضافی نیست${C.reset}`);
} else {
  console.log(`   تعداد فایل: ${C.bold}${consoleLogs.length}${C.reset}\n`);
  for (const { path, count } of consoleLogs.slice(0, 10)) {
    const mark = count > 10 ? C.red : count > 3 ? C.yellow : C.gray;
    console.log(`   ${mark}${String(count).padStart(3)} ×${C.reset}  ${path}`);
  }
}

header('📝  TODO / FIXME');
if (todos.length === 0) {
  console.log(`   ${C.green}✅ هیچ TODO/FIXME باقی نمانده${C.reset}`);
} else {
  for (const { path, count } of todos.slice(0, 10)) {
    console.log(`   ${C.yellow}•${C.reset} ${String(count).padStart(3)} ×  ${path}`);
  }
}

if (bundle && bundle.length > 0) {
  header('📊  توزیع Bundle (dist)');
  let total = 0;
  for (const { name, size } of bundle) {
    total += size;
    const mark = size > 300 * 1024 ? '🔴' : size > 100 * 1024 ? '🟡' : '  ';
    console.log(`   ${mark} ${fileSize(size).padStart(10)}  ${name}`);
  }
  console.log('');
  console.log(`   ${C.bold}مجموع: ${fileSize(total)}${C.reset}`);
}

header('🔐  وضعیت سرور');
if (!serverInfo.hasServer) {
  console.log(`   ${C.yellow}⚠️  پوشه server/ نیست${C.reset}`);
} else {
  console.log(`   ✅ پوشه server/ موجود`);
  console.log(`   ${serverInfo.hasConfig ? '✅' : '⚠️ '} config.json`);
  console.log(`   ${serverInfo.hasEnv ? '✅' : '⚠️ '} .env`);
}

header('💾  کلیدهای localStorage');
if (lsKeys.length === 0) {
  console.log(`   (خالی)`);
} else {
  console.log(`   تعداد کلید: ${C.bold}${lsKeys.length}${C.reset}\n`);
  for (const [key, files] of lsKeys.slice(0, 15)) {
    console.log(`   ${C.gray}•${C.reset} ${key.padEnd(30)} ${C.gray}(${files.length} فایل)${C.reset}`);
  }
  if (lsKeys.length > 15) {
    console.log(`   ${C.gray}... و ${lsKeys.length - 15} تای دیگر${C.reset}`);
  }
}

// ═══════════════ ذخیره گزارش ═══════════════
header('💾  ذخیره گزارش');
const outDir = existsSync('/sdcard') ? '/sdcard/divan-report' : join(ROOT, 'audit-reports');
try {
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `audit-v3-${Date.now()}.txt`);
  const lines = [
    `ممیزی دیوان v3 — ${new Date().toISOString()}`,
    `نسخه: ${pkg?.version}`,
    '',
    '== فایل‌های بلااستفاده ==',
    ...unused.map((f) => `  - ${f}`),
    '',
    '== پکیج‌های مسئله‌دار ==',
    ...unusedPkgs.map((p) => `  - ${p.name} (${p.reason})`),
    ...serverInSpa.map((p) => `  ! ${p} (سرور در SPA)`),
    ...forbiddenUsed.map((p) => `  !! ${p} (TanStack Start)`),
    '',
    '== import شکسته ==',
    ...broken.map((b) => `  - ${b.from} → ${b.to}`),
    '',
    '== بزرگ‌ترین فایل‌ها ==',
    ...sizes.slice(0, 30).map((s) => `  ${String(s.n).padStart(4)} خط  ${s.p}`),
    '',
    '== console.log ها ==',
    ...consoleLogs.map((c) => `  ${c.count} × ${c.path}`),
    '',
    '== TODO/FIXME ==',
    ...todos.map((t) => `  ${t.count} × ${t.path}`),
    '',
    '== Bundle ==',
    ...(bundle || []).map((b) => `  ${fileSize(b.size)}  ${b.name}`),
    '',
    '== localStorage keys ==',
    ...lsKeys.map(([k, v]) => `  ${k} (${v.length} فایل)`),
  ].join('\n');
  writeFileSync(out, lines, 'utf8');
  console.log(`   ${C.green}✅ ${out}${C.reset}`);
} catch (e) {
  console.log(`   ${C.yellow}⚠️  ذخیره نشد: ${e.message}${C.reset}`);
}

// ═══════════════ خلاصه ═══════════════
const dt = ((Date.now() - t0) / 1000).toFixed(2);
header(`📊  خلاصه  (${dt}s)`);
console.log(`   کل فایل:          ${allFiles.length}`);
console.log(`   بلااستفاده:       ${unused.length === 0 ? C.green : C.red}${unused.length}${C.reset}`);
console.log(`   پکیج مسئله‌دار:    ${unusedPkgs.length === 0 ? C.green : C.yellow}${unusedPkgs.length}${C.reset}`);
console.log(`   import شکسته:     ${broken.length === 0 ? C.green : C.red}${broken.length}${C.reset}`);
console.log(`   وابستگی دایره‌ای:  ${cycles.length === 0 ? C.green : C.yellow}${cycles.length}${C.reset}`);
console.log(`   console.log:      ${consoleLogs.length === 0 ? C.green : C.yellow}${consoleLogs.length} فایل${C.reset}`);
console.log(`   TODO/FIXME:       ${todos.length === 0 ? C.green : C.yellow}${todos.length} فایل${C.reset}`);
console.log('');
