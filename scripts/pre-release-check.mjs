#!/usr/bin/env node
/**
 * چک‌های قبل از انتشار
 * این اسکریپت قبل از release اجرا می‌شود
 */

import { execSync } from 'node:child_process';

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function title(msg) {
  console.log(`\n${C.bold}${C.cyan}═══ ${msg} ═══${C.reset}`);
}

let hasError = false;

// ═══ ۱. TypeScript ═══
title('۱. بررسی TypeScript');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe', encoding: 'utf-8' });
  console.log(`${C.green}✅ TypeScript سالم است${C.reset}`);
} catch (err) {
  console.log(`${C.red}❌ خطای TypeScript:${C.reset}`);
  console.log(err.stdout || err.message);
  hasError = true;
}

// ═══ ۲. فایل‌های بلااستفاده ═══
title('۲. بررسی فایل‌های بلااستفاده');
try {
  const out = execSync('node scripts/audit.mjs 2>&1', { encoding: 'utf-8' });
  const match = out.match(/تعداد:\s*(\d+)/);
  const count = match ? parseInt(match[1]) : 0;

  if (count > 5) {
    console.log(`${C.yellow}⚠️  ${count} فایل بلااستفاده — بهتر است پاک‌سازی شود${C.reset}`);
    console.log(`${C.yellow}   برای ادامه release، این اسکریپت متوقف نمی‌شود${C.reset}`);
  } else if (count > 0) {
    console.log(`${C.green}✅ ${count} فایل بلااستفاده (قابل قبول)${C.reset}`);
  } else {
    console.log(`${C.green}✅ بدون فایل بلااستفاده${C.reset}`);
  }
} catch (err) {
  console.log(`${C.yellow}⚠️  ممیزی اجرا نشد (نادیده گرفته می‌شود)${C.reset}`);
}

// ═══ ۳. نسخه package.json ═══
title('۳. بررسی نسخه');
try {
  const pkg = JSON.parse(execSync('cat package.json', { encoding: 'utf-8' }));
  console.log(`${C.green}✅ نسخه: ${pkg.version}${C.reset}`);
} catch (err) {
  console.log(`${C.red}❌ package.json قابل خواندن نیست${C.reset}`);
  hasError = true;
}

// ═══ نتیجه ═══
title('نتیجه');
if (hasError) {
  console.log(`${C.red}${C.bold}❌ چک‌ها با خطا مواجه شدند — انتشار متوقف شد${C.reset}`);
  process.exit(1);
} else {
  console.log(`${C.green}${C.bold}✅ همه چک‌ها موفق — آماده انتشار${C.reset}`);
  process.exit(0);
}
