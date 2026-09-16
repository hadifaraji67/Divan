#!/usr/bin/env node
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, basename, extname } from 'node:path';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');

async function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  const files = [];
  async function walk(d) {
    try {
      const entries = await readdir(d, { withFileTypes: true });
      for (const e of entries) {
        const full = join(d, e.name);
        if (e.isDirectory()) {
          if (e.name === 'node_modules' || e.name.startsWith('.') || e.name === 'ui') continue;
          await walk(full);
        } else if (exts.includes(extname(e.name))) {
          files.push(full);
        }
      }
    } catch {}
  }
  await walk(dir);
  return files;
}

function extractImports(content) {
  const imports = [];
  const regex = /import\s+(?:[\w*\s{},]+from\s+)?['"]([^'"]+)['"]/g;
  let m;
  while ((m = regex.exec(content)) !== null) imports.push(m[1]);
  return imports;
}

function resolvePath(importerFile, importPath) {
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) return null;
  let base;
  if (importPath.startsWith('@/')) {
    base = join(SRC, importPath.slice(2));
  } else {
    base = join(importerFile, '..', importPath);
  }
  const candidates = [
    base, base + '.tsx', base + '.ts',
    join(base, 'index.tsx'), join(base, 'index.ts'),
  ];
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

async function main() {
  const out = [];
  const log = (s) => out.push(s);

  log('═══════════════════════════════════════════════');
  log('  ممیزی پروژه دیوان');
  log('  تاریخ: ' + new Date().toISOString());
  log('═══════════════════════════════════════════════');
  log('');

  const files = await getAllFiles(SRC);
  const contents = {};
  for (const f of files) {
    try { contents[f] = await readFile(f, 'utf-8'); } catch { contents[f] = ''; }
  }

  const referrers = {};
  for (const f of files) referrers[f] = new Set();

  for (const f of files) {
    for (const imp of extractImports(contents[f])) {
      const target = resolvePath(f, imp);
      if (target && referrers[target]) referrers[target].add(f);
    }
  }

  const entryPoints = [
    // Entry point واقعی از index.html
    join(SRC, 'main.tsx'),
    // Router و App
    join(SRC, 'router.tsx'),
    join(SRC, 'App.tsx'),
    // TanStack Router
    join(SRC, 'routeTree.gen.ts'),
    join(SRC, 'routes', '__root.tsx'),
    join(SRC, 'routes', 'index.tsx'),
    join(SRC, 'routes', 'reset-password.tsx'),
    // Service Worker و ابزارها
    join(SRC, 'registerServiceWorker.ts'),
  ];

  // ۱. بلااستفاده‌ها
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  🗑 فایل‌های بلااستفاده');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  const unused = [];
  for (const f of files) {
    const rel = relative(SRC, f);
    if (entryPoints.includes(f)) continue;
    if (rel.startsWith('routes/')) continue;
    if (rel.startsWith('lib/security/use-lock')) continue;  // مستقیم از lock-service استفاده می‌شود
    if (referrers[f].size === 0) unused.push(f);
  }

  if (unused.length === 0) {
    log('✅ هیچ فایل بلااستفاده‌ای نیست');
  } else {
    log(`تعداد: ${unused.length}`);
    log('');
    for (const f of unused.sort()) {
      const rel = relative(ROOT, f);
      // خطای TS
      let tsError = '';
      log(`🗑  ${rel}`);
    }
  }

  log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  📊 آمار کلی');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');
  log(`کل فایل‌ها:    ${files.length}`);
  log(`بلااستفاده:    ${unused.length}`);
  log('');

  // گروه‌بندی
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  📁 بلااستفاده‌ها بر اساس پوشه');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  const byFolder = {};
  for (const f of unused) {
    const folder = relative(SRC, f).split('/').slice(0, -1).join('/') || '(ریشه)';
    if (!byFolder[folder]) byFolder[folder] = [];
    byFolder[folder].push(basename(f));
  }

  for (const [folder, list] of Object.entries(byFolder).sort()) {
    log(`📁 ${folder}/`);
    for (const f of list.sort()) log(`   • ${f}`);
    log('');
  }

  // ۲. import های شکسته
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  ✗ import های شکسته');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  const broken = [];
  for (const f of files) {
    for (const imp of extractImports(contents[f])) {
      if (!imp.startsWith('.') && !imp.startsWith('@/')) continue;
      const target = resolvePath(f, imp);
      if (!target) broken.push({ file: relative(ROOT, f), import: imp });
    }
  }

  if (broken.length === 0) {
    log('✅ هیچ import شکسته‌ای نیست');
  } else {
    log(`تعداد: ${broken.length}`);
    log('');
    for (const b of broken) {
      log(`✗  ${b.file}`);
      log(`      → ${b.import}`);
    }
  }

  log('');

  // ۳. فایل‌های بزرگ
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  📈 بزرگ‌ترین فایل‌ها');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  const sizes = files.map(f => ({
    file: relative(SRC, f),
    lines: (contents[f] || '').split('\n').length,
    bytes: (contents[f] || '').length,
  })).sort((a, b) => b.lines - a.lines);

  for (const s of sizes.slice(0, 15)) {
    log(`${String(s.lines).padStart(5)} خط  ${s.file}`);
  }

  log('');

  // ۴. لیست کامل فایل‌ها با ارجاع
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('  📋 همه فایل‌ها با تعداد ارجاع');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  log('');

  for (const f of files.sort()) {
    const rel = relative(SRC, f);
    const refs = referrers[f].size;
    const marker = refs === 0 ? '🗑' : '✓';
    log(`${marker} [${String(refs).padStart(2)}] ${rel}`);
  }

  return out.join('\n');
}

main().then(text => {
  const dir = '/sdcard/divan-report';
  try { mkdirSync(dir, { recursive: true }); } catch {}
  const path = dir + '/audit-report.txt';
  writeFileSync(path, text);
  console.log(text);
  console.log('');
  console.log('📄 ذخیره شد در: ' + path);
}).catch(err => {
  console.error('خطا:', err);
  process.exit(1);
});
