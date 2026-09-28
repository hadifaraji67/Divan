#!/usr/bin/env node
/**
 * تولید کد فعال‌سازی ماژول برای یک سازمان
 *
 * استفاده:
 *   node scripts/generate-activation-code.mjs "نام سازمان" hr,projects
 *
 * ماژول‌های مجاز: sales, purchase, inventory, finance, reports, hr, projects
 * ⚠️ SALT و checksum باید دقیقاً با src/lib/licensing.ts یکی باشد.
 */
const SALT = 'divan-5-module-lock-2026';
const KNOWN = ['sales', 'purchase', 'inventory', 'finance', 'reports', 'hr', 'projects'];

function checksum(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36).toUpperCase().padStart(4, '0').slice(-4);
}

const [org, modulesArg] = process.argv.slice(2);
if (!org || !modulesArg) {
  console.error('استفاده: node scripts/generate-activation-code.mjs "نام سازمان" hr,projects');
  process.exit(1);
}

const modules = modulesArg.split(',').map(s => s.trim()).filter(Boolean);
const bad = modules.filter(m => !KNOWN.includes(m));
if (bad.length) {
  console.error(`ماژول نامعتبر: ${bad.join(', ')}\nمجاز: ${KNOWN.join(', ')}`);
  process.exit(1);
}

const encoded = Buffer.from(`${org}|${modules.join(',')}`, 'utf8').toString('base64url');
console.log(`DIVAN-${encoded}-${checksum(encoded + SALT)}`);
