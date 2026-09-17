#!/usr/bin/env node
/**
 * ساخت manifest.json + web-vX.X.X.zip برای OTA
 * استفاده: node scripts/build-manifest.mjs v4.9.0
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const ROOT = process.cwd();
const version = (process.argv[2]?.replace(/^v/, '')) || JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version;
const tag = `v${version}`;

console.log(`📦 ساخت manifest برای ${tag}`);

// ۱. مطمئن شو dist/ هست
const distDir = join(ROOT, 'dist');
if (!existsSync(distDir)) {
  console.error('❌ dist/ نیست — اول npm run build');
  process.exit(1);
}

// ۲. مطمئن شو release/ هست
const releaseDir = join(ROOT, 'release');
if (!existsSync(releaseDir)) mkdirSync(releaseDir, { recursive: true });

// ۳. ساخت ZIP از dist/
const zipName = `web-${tag}.zip`;
const zipPath = join(releaseDir, zipName);

console.log(`📁 ساخت ZIP از dist/...`);
let zipMade = false;
try {
  execSync(`cd dist && zip -r -q "../release/${zipName}" .`, { stdio: 'pipe' });
  zipMade = true;
  console.log('✅ با zip system');
} catch {
  console.log('⚠️  zip command نیست، از fflate استفاده می‌کنم...');
  const fflate = await import('fflate');
  const files = {};

  function walkDir(dir, base = '') {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const relPath = base ? `${base}/${entry}` : entry;
      const st = statSync(full);
      if (st.isDirectory()) walkDir(full, relPath);
      else files[relPath] = new Uint8Array(readFileSync(full));
    }
  }
  walkDir(distDir);

  const zipped = fflate.zipSync(files, { level: 6 });
  writeFileSync(zipPath, zipped);
  zipMade = true;
}

if (!zipMade) {
  console.error('❌ خطا در ساخت ZIP');
  process.exit(1);
}

const zipSize = statSync(zipPath).size;
const zipBuffer = readFileSync(zipPath);
const checksum = 'sha256:' + createHash('sha256').update(zipBuffer).digest('hex');

console.log(`✅ ZIP: ${zipName} (${(zipSize / 1024).toFixed(0)} KB)`);

// ۴. اطلاعات APK
const apkName = `divan-${tag}.apk`;
const apkPath = join(releaseDir, apkName);
let apkSize = 0;
if (existsSync(apkPath)) {
  apkSize = statSync(apkPath).size;
  console.log(`✅ APK: ${apkName} (${(apkSize / 1024 / 1024).toFixed(2)} MB)`);
} else {
  // تخمین
  const apks = readdirSync(releaseDir).filter(f => f.endsWith('.apk'));
  if (apks.length > 0) {
    apkSize = statSync(join(releaseDir, apks[apks.length - 1])).size;
  }
  if (apkSize === 0) apkSize = 3900000;
  console.log(`⚠️  APK ساخته نشده — تخمین: ${(apkSize / 1024 / 1024).toFixed(2)} MB`);
}

// ۵. تشخیص نیاز به native update
let nativeRequired = false;
const nativeReqPath = join(ROOT, '.native-required.json');
if (existsSync(nativeReqPath)) {
  try {
    nativeRequired = JSON.parse(readFileSync(nativeReqPath, 'utf8')).required || false;
  } catch {}
}

// ۶. ساخت manifest
const [major, minor, patch] = version.split('.').map(Number);
const versionCode = major * 10000 + minor * 100 + patch;

const manifest = {
  version,
  releaseNotes: `نسخه ${version} — برای جزئیات: github.com/hadifaraji67/Divan/releases/tag/${tag}`,
  ota: {
    available: true,
    url: `https://github.com/hadifaraji67/Divan/releases/download/${tag}/${zipName}`,
    size: zipSize,
    checksum,
    minNativeVersion: '4.9.0',
  },
  apk: {
    available: true,
    url: `https://github.com/hadifaraji67/Divan/releases/download/${tag}/${apkName}`,
    size: apkSize,
    versionCode,
  },
  requiresNativeUpdate: nativeRequired,
  generatedAt: new Date().toISOString(),
};

const manifestPath = join(ROOT, 'manifest.json');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
console.log(`✅ manifest.json ساخته شد`);
console.log(`   OTA: ${(zipSize / 1024).toFixed(0)} KB`);
console.log(`   APK: ${(apkSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`   Native Required: ${nativeRequired}`);
console.log('');
console.log(`📌 مراحل بعدی:`);
console.log(`   1. npx cap sync android`);
console.log(`   2. git add manifest.json release/${zipName}`);
console.log(`   3. commit + tag + push`);
