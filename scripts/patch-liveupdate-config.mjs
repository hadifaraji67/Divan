import { readFileSync, writeFileSync } from 'node:fs';

const file = 'capacitor.config.ts';
let src = readFileSync(file, 'utf8');
const log = [];

// ── افزودن server block (اگر نیست) ──
if (!src.includes('hostname:')) {
  const before = '  webDir: "dist",';
  const after = `  webDir: "dist",
  server: {
    hostname: "localhost",
    androidScheme: "https",
    iosScheme: "capacitor",
  },`;
  if (src.includes(before)) {
    src = src.replace(before, after);
    log.push('✅ server block اضافه شد');
  } else {
    log.push('❌ webDir پیدا نشد');
  }
} else {
  log.push('⏭ server block هست');
}

// ── افزودن LiveUpdate به plugins ──
if (!src.includes('LiveUpdate:')) {
  const before = '  plugins: {';
  const after = `  plugins: {
    LiveUpdate: {
      appId: "ir.divan.app",
      autoUpdateStrategy: "none",
      readyTimeout: 10000,
      resetWhenUpdate: false,
    },`;
  if (src.includes(before)) {
    src = src.replace(before, after);
    log.push('✅ LiveUpdate config اضافه شد');
  } else {
    log.push('❌ plugins پیدا نشد');
  }
} else {
  log.push('⏭ LiveUpdate config هست');
}

writeFileSync(file, src);
console.log(log.join('\n'));
