import { readFileSync, writeFileSync } from 'node:fs';

const file = '.github/workflows/release.yml';
let src = readFileSync(file, 'utf8');
const log = [];

// ── ۱. پاک کردن dist قبل از zip ──
const oldZip = `      - name: ساخت ZIP برای OTA
        run: |
          VERSION="\${{ steps.version.outputs.version }}"
          cd dist
          zip -r -q "../release/web-\${VERSION}.zip" .
          cd ..
          ls -la release/`;

const newZip = `      - name: پاک‌سازی dist از فایل‌های اضافی
        run: |
          cd dist
          find . -name "*.zip" -delete
          find . -name "*.apk" -delete
          cd ..

      - name: ساخت ZIP برای OTA
        run: |
          VERSION="\${{ steps.version.outputs.version }}"
          cd dist
          zip -r -q "../release/web-\${VERSION}.zip" .
          cd ..
          echo "فایل‌های ساخته شده:"
          ls -la release/`;

if (src.includes(oldZip)) {
  src = src.replace(oldZip, newZip);
  log.push('✅ مرحله پاک‌سازی dist + zip اضافه شد');
} else {
  log.push('❌ بلوک zip پیدا نشد');
}

// ── ۲. اصلاح manifest (VERSION_NO_V برای ZIP) ──
const oldManifest = `VERSION_NO_V="\${VERSION#v}"
          ZIP_NAME="web-\${VERSION}.zip"`;

const newManifest = `VERSION_NO_V="\${VERSION#v}"
          ZIP_NAME="web-\${VERSION}.zip"
          echo "ZIP_NAME=\${ZIP_NAME}"
          echo "VERSION=\${VERSION}"`;

if (src.includes(oldManifest)) {
  src = src.replace(oldManifest, newManifest);
  log.push('✅ لاگ اضافه شد برای دیباگ');
} else {
  log.push('⏭ بلوک manifest قبلاً درست است');
}

writeFileSync(file, src);
console.log(log.join('\n'));
if (log.some(l => l.startsWith('❌'))) process.exit(1);
console.log('\n🎉 patch موفق');
