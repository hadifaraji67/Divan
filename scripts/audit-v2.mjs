#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

const ENTRY_POINTS = new Set(['src/main.tsx', 'src/routeTree.gen.ts', 'src/router.tsx']);
const GENERATED = new Set(['src/routeTree.gen.ts']);
const SERVER_ONLY = ['pg', '@types/pg', 'nodemailer', '@types/nodemailer', 'jose', 'better-auth', 'kysely', '@electric-sql/pglite', '@neondatabase/serverless'];
const FORBIDDEN = ['@tanstack/react-start', 'nitro'];
const DEV_ONLY = ['typescript', 'vite', 'eslint', 'prettier', 'tailwindcss', '@types/', '@vitejs/', 'lightningcss', 'globals', 'playwright'];

const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m', reset: '\x1b[0m' };
const line = () => console.log('━'.repeat(55));
const header = (t) => { console.log(''); line(); console.log(`  ${C.bold}${t}${C.reset}`); line(); };
const rel = (p) => relative(ROOT, p).replace(/\\/g, '/');

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  let entries;
  try { entries = readdirSync(dir); } catch { return files; }
  for (const e of entries) {
    if (e === 'node_modules' || e.startsWith('.')) continue;
    const full = join(dir, e);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

const isCode = (p) => ['.ts', '.tsx', '.js', '.jsx', '.mjs'].includes(extname(p));

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

function resolveImport(imp, fromFile) {
  if (!imp.startsWith('.') && !imp.startsWith('@/')) return null;
  const base = imp.startsWith('@/') ? join(SRC, imp.slice(2)) : join(dirname(fromFile), imp);
  const candidates = [base, base + '.ts', base + '.tsx', base + '.js', base + '.jsx', join(base, 'index.ts'), join(base, 'index.tsx'), join(base, 'index.js')];
  for (const c of candidates) {
    try { if (existsSync(c) && statSync(c).isFile()) return c; } catch {}
  }
  return null;
}

function pkgNameFrom(imp) {
  if (imp.startsWith('@')) return imp.split('/').slice(0, 2).join('/');
  return imp.split('/')[0];
}

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

const t0 = Date.now();
console.log(`${C.cyan}${C.bold}`);
console.log('═══════════════════════════════════════════════');
console.log('  ممیزی هوشمند پروژه دیوان (v2)');
console.log(`  تاریخ: ${new Date().toISOString()}`);
console.log('═══════════════════════════════════════════════');
console.log(C.reset);

const allFiles = walk(SRC).filter(isCode);
console.log(`📁 فایل‌های کد: ${allFiles.length}`);
console.log(`📁 نقاط ورود:   ${ENTRY_POINTS.size}`);

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

const unused = allFiles.filter((f) => {
  const r = rel(f);
  if (ENTRY_POINTS.has(r) || GENERATED.has(r)) return false;
  return !imported.has(f);
}).map(rel).sort();

const pkg = (() => { try { return JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')); } catch { return null; } })();

const used = new Set();
for (const f of allFiles) {
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

const sizes = allFiles.map((f) => {
  let n = 0;
  try { n = readFileSync(f, 'utf8').split('\n').length; } catch {}
  return { p: rel(f), n };
}).sort((a, b) => b.n - a.n);

header('🗑  فایل‌های بلااستفاده');
if (unused.length === 0) console.log(`   ${C.green}✅ هیچ فایل بلااستفاده‌ای نیست${C.reset}`);
else {
  console.log(`   تعداد: ${C.bold}${unused.length}${C.reset}\n`);
  for (const f of unused) console.log(`   ${C.red}🗑${C.reset}  ${f}`);
}

header('📦  پکیج‌های مسئله‌دار');
if (!unusedPkgs.length && !serverInSpa.length && !forbiddenUsed.length) console.log(`   ${C.green}✅ همه پکیج‌ها سالم${C.reset}`);
else {
  for (const { name, reason } of unusedPkgs) console.log(`   ${C.red}✗${C.reset}  ${name.padEnd(35)} ${C.gray}${reason}${C.reset}`);
  for (const name of serverInSpa) console.log(`   ${C.yellow}!${C.reset}  ${name.padEnd(35)} ${C.gray}سرور در SPA${C.reset}`);
  for (const name of forbiddenUsed) console.log(`   ${C.red}!!${C.reset} ${name.padEnd(35)} ${C.gray}TanStack Start${C.reset}`);
}

header('✗  import های شکسته');
if (!broken.length) console.log(`   ${C.green}✅ هیچ import شکسته‌ای نیست${C.reset}`);
else for (const b of broken) console.log(`   ${C.red}✗${C.reset} ${b.from} ${C.gray}→ ${b.to}${C.reset}`);

header('🔄  وابستگی دایره‌ای');
const cycles = findCycles(graph, allFiles);
if (!cycles.length) console.log(`   ${C.green}✅ هیچ وابستگی دایره‌ای نیست${C.reset}`);
else for (const c of cycles.slice(0, 5)) console.log(`   ${C.yellow}↻${C.reset} ${c.map(rel).join(' → ')}`);

header('📈  بزرگ‌ترین فایل‌ها (top 15)');
for (const { p, n } of sizes.slice(0, 15)) {
  const mark = n > 500 ? '🔴' : n > 300 ? '🟡' : '  ';
  console.log(`   ${mark} ${String(n).padStart(4)} خط  ${p}`);
}

header('💾  ذخیره گزارش');
const outDir = existsSync('/sdcard') ? '/sdcard/divan-report' : join(ROOT, 'audit-reports');
try {
  mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `audit-v2-${Date.now()}.txt`);
  const lines = [
    'ممیزی دیوان v2', `تاریخ: ${new Date().toISOString()}`, '',
    '== بلااستفاده ==', ...unused.map((f) => `  - ${f}`), '',
    '== پکیج‌های مسئله‌دار ==',
    ...unusedPkgs.map((p) => `  - ${p.name} (${p.reason})`),
    ...serverInSpa.map((p) => `  ! ${p} (سرور در SPA)`),
    ...forbiddenUsed.map((p) => `  !! ${p} (TanStack Start)`), '',
    '== import شکسته ==', ...broken.map((b) => `  - ${b.from} → ${b.to}`), '',
    '== بزرگ‌ترین ==', ...sizes.slice(0, 30).map((s) => `  ${String(s.n).padStart(4)} خط  ${s.p}`),
  ].join('\n');
  writeFileSync(out, lines, 'utf8');
  console.log(`   ${C.green}✅ ${out}${C.reset}`);
} catch (e) { console.log(`   ${C.yellow}⚠️  ذخیره نشد: ${e.message}${C.reset}`); }

const dt = ((Date.now() - t0) / 1000).toFixed(2);
header(`📊  خلاصه  (${dt}s)`);
console.log(`   کل فایل:          ${allFiles.length}`);
console.log(`   بلااستفاده:       ${unused.length === 0 ? C.green : C.red}${unused.length}${C.reset}`);
console.log(`   پکیج مسئله‌دار:    ${unusedPkgs.length === 0 ? C.green : C.yellow}${unusedPkgs.length}${C.reset}`);
console.log(`   import شکسته:     ${broken.length === 0 ? C.green : C.red}${broken.length}${C.reset}`);
console.log(`   وابستگی دایره‌ای:  ${cycles.length === 0 ? C.green : C.yellow}${cycles.length}${C.reset}`);
console.log('');
