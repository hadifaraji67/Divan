import { readFileSync, writeFileSync } from 'node:fs';
const file = 'src/lib/update/update-v2.ts';
let src = readFileSync(file, 'utf8');
const log = [];

// حذف فیلدهای apkLight از UpdateInfo
src = src.replace(/\s*apkLightAvailable[?:]?\s*[^;]+;/g, '');
src = src.replace(/\s*apkLightUrl[?:]?\s*[^;]+;/g, '');
src = src.replace(/\s*apkLightSize[?:]?\s*[^;]+;/g, '');

// حذف از fetchManifest — پیدا کردن light APK
src = src.replace(
  /const lightApk = rel\.assets\?\.find\(\(a: any\) => a\.name\?\.endsWith\('-light\.apk'\)\);\s*\n/g,
  ''
);

// حذف از return
src = src.replace(
  /apkLightAvailable:\s*!!lightApk,\s*\n/g,
  ''
);
src = src.replace(
  /apkLightSize:\s*lightApk\?\.size,\s*\n/g,
  ''
);
src = src.replace(
  /apkLightUrl:\s*lightApk\?\.browser_download_url,\s*\n/g,
  ''
);

// حذف از base object
src = src.replace(
  /apkLightAvailable:\s*false,\s*\n/g,
  ''
);

writeFileSync(file, src);
console.log('✅ apkLight از update-v2.ts حذف شد');
